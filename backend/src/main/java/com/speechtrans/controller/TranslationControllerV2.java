package com.speechtrans.controller;

import com.speechtrans.common.Result;
import com.speechtrans.entity.TranslationTask;
import com.speechtrans.entity.TranslationSegment;
import com.speechtrans.mapper.TranslationTaskMapper;
import com.speechtrans.mapper.TranslationSegmentMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
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
    private final SimpMessagingTemplate messagingTemplate;

    private static final String UPLOAD_DIR = "./uploads/audio/";

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

        // 1. 保存音频文件
        Path uploadDir = Paths.get(UPLOAD_DIR);
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

        // 3. 推送状态到 WebSocket
        Map<String, Object> wsMsg = new LinkedHashMap<>();
        wsMsg.put("type", "TASK_CREATED");
        wsMsg.put("taskId", task.getId());
        wsMsg.put("status", "pending");
        wsMsg.put("timestamp", LocalDateTime.now().toString());
        messagingTemplate.convertAndSend("/topic/tasks", wsMsg);

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

        // 延迟模拟 → 实际应调用 Python 推理服务
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                task.setStatus("completed");
                task.setDetectedLang("en");
                task.setTranscription("Hello everyone, welcome to the AI real-time translation demo.");
                task.setTranslation("大家好，欢迎体验 AI 实时翻译演示。");
                task.setAudioDuration(4.8f);
                taskMapper.updateById(task);

                // 写入分段数据
                insertMockSegments(id);

                pushStatus(id, "COMPLETED", 1.0);
            } catch (InterruptedException e) {
                task.setStatus("failed");
                task.setErrorMessage("处理被中断: " + e.getMessage());
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
