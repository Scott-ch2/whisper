package com.speechtrans.controller;

import com.speechtrans.common.Result;
import com.speechtrans.entity.TranslationTask;
import com.speechtrans.entity.TranslationSegment;
import com.speechtrans.mapper.TranslationTaskMapper;
import com.speechtrans.mapper.TranslationSegmentMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.speechtrans.service.InferenceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TranslationControllerV2 {

    private final TranslationTaskMapper taskMapper;
    private final TranslationSegmentMapper segmentMapper;
    private final InferenceClient inferenceClient;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.audio.upload-dir:data/uploads/audio/}")
    private String uploadDirPath;

    /**
     * 上传音频并创建翻译任务
     *
     * POST /api/translate
     * multipart/form-data:
     *   file: 音频文件
     *   srcLang: 源语言 (可选, 默认 "auto")
     *   tgtLang: 目标语言
     */
    @PostMapping("/translate")
    public Result<Map<String, Object>> translate(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "srcLang", defaultValue = "auto") String srcLang,
            @RequestParam("tgtLang") String tgtLang) throws IOException {

        // 1. 保存音频文件（绝对路径，基于 user.dir）
        //    在 Docker 中 user.dir=/app，最终路径 /app/data/uploads/audio/
        //    在 IDE 中 user.dir=项目根目录/backend，确保目录存在
        String baseDir = System.getProperty("user.dir");
        Path basePath = Paths.get(baseDir);
        // 如果 user.dir 以 backend 结尾，取父目录作为基准
        if (basePath.endsWith("backend")) {
            basePath = basePath.getParent();
        }
        Path uploadDir = basePath.resolve(uploadDirPath).normalize();
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadDir.resolve(fileName);
        file.transferTo(filePath.toFile());

        // 2. 创建翻译任务
        TranslationTask task = new TranslationTask();
        task.setUserId(1L); // TODO: 从 JWT 获取真实用户 ID
        task.setAudioFileName(file.getOriginalFilename());
        task.setAudioFilePath(filePath.toString());
        task.setAudioDuration(0f); // TODO: 用 FFmpeg 获取真实时长
        task.setSrcLang(srcLang);
        task.setTgtLang(tgtLang);
        task.setStatus("pending");
        taskMapper.insert(task);

        // 3. 推送状态到 WebSocket (non-critical, catch errors silently)
        try {
            Map<String, Object> wsMsg = new LinkedHashMap<>();
            wsMsg.put("type", "TASK_CREATED");
            wsMsg.put("taskId", task.getId());
            wsMsg.put("status", "pending");
            wsMsg.put("timestamp", LocalDateTime.now().toString());
            messagingTemplate.convertAndSend("/topic/tasks", wsMsg);
        } catch (Exception ignored) {
            // WebSocket is optional for translation to work
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", task.getId());
        data.put("status", "pending");
        return Result.success("翻译任务已创建", data);
    }

    /**
     * 查询任务状态与结果
     *
     * GET /api/translate/{id}
     */
    @GetMapping("/translate/{id}")
    public Result<Map<String, Object>> getTaskResult(@PathVariable Long id) {
        TranslationTask task = taskMapper.selectById(id);
        if (task == null) {
            return Result.error(404, "任务不存在");
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", task.getId());
        data.put("status", task.getStatus());
        data.put("srcLang", task.getSrcLang());
        data.put("tgtLang", task.getTgtLang());
        data.put("detectedLang", task.getDetectedLang());
        data.put("transcription", task.getTranscription());
        data.put("translation", task.getTranslation());
        data.put("audioDuration", task.getAudioDuration());
        data.put("createdAt", task.getCreatedAt());

        // 查询分段信息
        List<TranslationSegment> segments = segmentMapper.selectList(
                new LambdaQueryWrapper<TranslationSegment>()
                        .eq(TranslationSegment::getTaskId, id)
                        .orderByAsc(TranslationSegment::getSeq)
        );
        List<Map<String, Object>> segList = new ArrayList<>();
        for (TranslationSegment seg : segments) {
            Map<String, Object> segMap = new LinkedHashMap<>();
            segMap.put("seq", seg.getSeq());
            segMap.put("start", seg.getStartTime());
            segMap.put("end", seg.getEndTime());
            segMap.put("sourceText", seg.getSourceText());
            segMap.put("targetText", seg.getTargetText());
            segMap.put("confidence", seg.getConfidence());
            segList.add(segMap);
        }
        data.put("segments", segList);

        if (task.getErrorMessage() != null) {
            data.put("errorMessage", task.getErrorMessage());
        }

        return Result.success(data);
    }

    /**
     * 模拟 ASR + NMT 处理（当前假数据版本）
     *
     * PUT /api/translate/{id}/process
     */
    @PutMapping("/translate/{id}/process")
    public Result<String> processTask(@PathVariable Long id) {
        TranslationTask task = taskMapper.selectById(id);
        if (task == null) {
            return Result.error(404, "任务不存在");
        }

        // 模拟处理流程
        task.setStatus("processing");
        taskMapper.updateById(task);
        pushStatus(id, "PROCESSING_ASR", 0.0);

        // 调用 Python 推理服务进行真实 ASR+NMT
        new Thread(() -> {
            try {
                // 读取音频文件字节
                byte[] audioBytes = java.nio.file.Files.readAllBytes(java.nio.file.Path.of(task.getAudioFilePath()));

                // 调用推理服务
                Map<String, Object> result = inferenceClient.translate(
                        audioBytes,
                        task.getAudioFileName(),
                        task.getSrcLang(),
                        task.getTgtLang()
                );

                // 更新任务
                task.setStatus("completed");
                task.setDetectedLang((String) result.get("detectedLanguage"));
                task.setTranscription((String) result.get("transcription"));
                task.setTranslation((String) result.get("translation"));
                Object dur = result.get("duration");
                task.setAudioDuration(dur != null ? ((Number) dur).floatValue() : 0f);
                taskMapper.updateById(task);

                // 写入分段数据
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> segs = (List<Map<String, Object>>) result.get("segments");
                if (segs != null) {
                    for (int i = 0; i < segs.size(); i++) {
                        Map<String, Object> segData = segs.get(i);
                        TranslationSegment seg = new TranslationSegment();
                        seg.setTaskId(id);
                        seg.setSeq(i);
                        Object startVal = segData.get("start");
                        seg.setStartTime(startVal != null ? ((Number) startVal).floatValue() : 0f);
                        Object endVal = segData.get("end");
                        seg.setEndTime(endVal != null ? ((Number) endVal).floatValue() : 0f);
                        seg.setSourceText((String) segData.get("sourceText"));
                        seg.setTargetText((String) segData.get("targetText"));
                        seg.setConfidence(0.95f);
                        segmentMapper.insert(seg);
                    }
                }

                pushStatus(id, "COMPLETED", 1.0);
            } catch (Exception e) {
                task.setStatus("failed");
                task.setErrorMessage("推理服务错误: " + e.getMessage());
                taskMapper.updateById(task);
                pushStatus(id, "FAILED", 0.0);
            }
        }).start();

        return Result.success("处理中");
    }

    // ====== 历史导出 ======
    @GetMapping("/history/{id}/export")
    public Result<Map<String, String>> exportTask(@PathVariable Long id) {
        TranslationTask task = taskMapper.selectById(id);
        if (task == null) {
            return Result.error(404, "任务不存在");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("=== Whisper Translation Export ===\n");
        sb.append("Task ID: ").append(task.getId()).append("\n");
        sb.append("Source: ").append(task.getSrcLang()).append("\n");
        sb.append("Target: ").append(task.getTgtLang()).append("\n");
        sb.append("Date: ").append(task.getCreatedAt()).append("\n\n");
        sb.append("[Original]\n").append(task.getTranscription()).append("\n\n");
        sb.append("[Translation]\n").append(task.getTranslation()).append("\n");

        Map<String, String> data = new LinkedHashMap<>();
        data.put("content", sb.toString());
        data.put("filename", "whisper_export_" + id + ".txt");
        return Result.success(data);
    }

    // ====== 辅助方法 ======
    private void pushStatus(Long taskId, String status, double progress) {
        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("type", "TASK_UPDATE");
        msg.put("taskId", taskId);
        msg.put("status", status);
        msg.put("progress", progress);
        msg.put("timestamp", LocalDateTime.now().toString());
        messagingTemplate.convertAndSend("/topic/tasks", msg);
    }

    private void insertMockSegments(Long taskId) {
        TranslationSegment s1 = new TranslationSegment();
        s1.setTaskId(taskId); s1.setSeq(0);
        s1.setStartTime(0.0f); s1.setEndTime(3.2f);
        s1.setSourceText("Hello everyone,");
        s1.setTargetText("大家好，");
        s1.setConfidence(0.98f);
        segmentMapper.insert(s1);

        TranslationSegment s2 = new TranslationSegment();
        s2.setTaskId(taskId); s2.setSeq(1);
        s2.setStartTime(3.2f); s2.setEndTime(4.8f);
        s2.setSourceText("welcome to the AI real-time translation demo.");
        s2.setTargetText("欢迎体验 AI 实时翻译演示。");
        s2.setConfidence(0.96f);
        segmentMapper.insert(s2);
    }
}
