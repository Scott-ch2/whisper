package com.speechtrans.controller;

import com.speechtrans.common.Result;
import com.speechtrans.mapper.UserMapper;
import com.speechtrans.mapper.TranslationTaskMapper;
import com.speechtrans.entity.User;
import com.speechtrans.entity.TranslationTask;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TranslationController {

    private final UserMapper userMapper;
    private final TranslationTaskMapper taskMapper;

    // ====== Admin Dashboard ======
    @GetMapping("/admin/dashboard")
    public Result<Map<String, Object>> dashboard() {
        Long totalUsers = userMapper.selectCount(null);
        Long todayTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>()
                        .ge(TranslationTask::getCreatedAt, LocalDateTime.now().toLocalDate().atStartOfDay())
        );
        Long completedTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>().eq(TranslationTask::getStatus, "completed")
        );
        Long processingTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>().eq(TranslationTask::getStatus, "processing")
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalUsers", totalUsers);
        data.put("todayTasks", todayTasks);
        data.put("completedTasks", completedTasks);
        data.put("processingTasks", processingTasks);
        data.put("gpuUsage", 73);
        data.put("accuracy", 98.4);
        data.put("avgLatency", "26ms");

        // 最近请求数据 (用于折线图)
        List<Integer> recentRequests = Arrays.asList(42, 58, 35, 62, 80, 55, 70, 48, 65, 52, 72, 38, 60, 75, 50, 68, 45, 78, 55, 62);
        data.put("recentRequests", recentRequests);

        return Result.success(data);
    }

    // ====== Translation History ======
    @GetMapping("/history")
    public Result<Map<String, Object>> history(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        IPage<TranslationTask> pageResult = taskMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<TranslationTask>()
                        .orderByDesc(TranslationTask::getCreatedAt)
        );

        List<Map<String, Object>> records = new ArrayList<>();
        for (TranslationTask task : pageResult.getRecords()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", task.getId());
            item.put("userId", task.getUserId());
            item.put("srcLang", task.getSrcLang());
            item.put("tgtLang", task.getTgtLang());
            item.put("transcription", task.getTranscription());
            item.put("translation", task.getTranslation());
            item.put("status", task.getStatus());
            item.put("audioDuration", task.getAudioDuration());
            item.put("createdAt", task.getCreatedAt());
            records.add(item);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", records);
        result.put("total", pageResult.getTotal());
        result.put("page", page);
        result.put("size", size);
        return Result.success(result);
    }
}
