package com.speechtrans.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.speechtrans.common.Result;
import com.speechtrans.entity.TranslationTask;
import com.speechtrans.entity.SystemLog;
import com.speechtrans.mapper.TranslationTaskMapper;
import com.speechtrans.mapper.SystemLogMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class MonitorController {

    private final TranslationTaskMapper taskMapper;
    private final SystemLogMapper logMapper;
    private final SimpMessagingTemplate messagingTemplate;

    // ====== 活跃请求 ======
    @GetMapping("/monitor")
    public Result<Map<String, Object>> monitor() {
        // 正在处理的翻译任务
        List<TranslationTask> processing = taskMapper.selectList(
                new LambdaQueryWrapper<TranslationTask>()
                        .eq(TranslationTask::getStatus, "processing")
                        .orderByDesc(TranslationTask::getCreatedAt)
                        .last("LIMIT 5")
        );

        List<Map<String, Object>> activeRequests = new ArrayList<>();
        for (TranslationTask t : processing) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", t.getId());
            item.put("userId", t.getUserId());
            item.put("srcLang", t.getSrcLang());
            item.put("tgtLang", t.getTgtLang());
            item.put("status", t.getStatus());
            item.put("audioDuration", t.getAudioDuration());
            item.put("createdAt", t.getCreatedAt());
            activeRequests.add(item);
        }

        // 队列统计
        long queueCount = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>().eq(TranslationTask::getStatus, "pending"));
        long processingCount = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>().eq(TranslationTask::getStatus, "processing"));
        long completedCount = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>().eq(TranslationTask::getStatus, "completed"));
        long failedCount = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>().eq(TranslationTask::getStatus, "failed"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("activeRequests", activeRequests);
        data.put("queueCount", queueCount);
        data.put("processingCount", processingCount);
        data.put("completedCount", completedCount);
        data.put("failedCount", failedCount);
        return Result.success(data);
    }

    // ====== 系统日志 ======
    @GetMapping("/logs")
    public Result<Map<String, Object>> logs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<SystemLog> pageResult = logMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<SystemLog>().orderByDesc(SystemLog::getCreatedAt)
        );

        List<Map<String, Object>> records = new ArrayList<>();
        for (SystemLog log : pageResult.getRecords()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", log.getId());
            item.put("userId", log.getUserId());
            item.put("action", log.getAction());
            item.put("detail", log.getDetail());
            item.put("createdAt", log.getCreatedAt());
            records.add(item);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", records);
        result.put("total", pageResult.getTotal());
        result.put("page", page);
        result.put("size", size);
        return Result.success(result);
    }

    // ====== WebSocket 推送任务状态 ======
    @PostMapping("/monitor/push-task-status")
    public Result<String> pushTaskStatus(@RequestBody Map<String, Object> body) {
        // 将任务状态更新推送到 WebSocket 频道
        messagingTemplate.convertAndSend("/topic/tasks", body);
        return Result.success("已推送");
    }
}
