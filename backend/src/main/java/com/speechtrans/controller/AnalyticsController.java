package com.speechtrans.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.speechtrans.common.Result;
import com.speechtrans.entity.TranslationTask;
import com.speechtrans.entity.User;
import com.speechtrans.mapper.TranslationTaskMapper;
import com.speechtrans.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final TranslationTaskMapper taskMapper;
    private final UserMapper userMapper;

    // ====== 分析总览 ======
    @GetMapping("/overview")
    public Result<Map<String, Object>> overview() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        long totalUsers = userMapper.selectCount(null);
        long totalTasks = taskMapper.selectCount(null);
        long todayTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>()
                        .ge(TranslationTask::getCreatedAt, todayStart));
        long completedTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>().eq(TranslationTask::getStatus, "completed"));
        long failedTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<TranslationTask>().eq(TranslationTask::getStatus, "failed"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalUsers", totalUsers);
        data.put("totalTasks", totalTasks);
        data.put("todayTasks", todayTasks);
        data.put("completedTasks", completedTasks);
        data.put("failedTasks", failedTasks);
        data.put("completionRate", totalTasks > 0
                ? Math.round(completedTasks * 10000.0 / totalTasks) / 100.0
                : 100.0);
        return Result.success(data);
    }

    // ====== 语言分布 ======
    @GetMapping("/languages")
    public Result<Map<String, Object>> languageDistribution() {
        List<TranslationTask> all = taskMapper.selectList(
                new LambdaQueryWrapper<TranslationTask>()
                        .isNotNull(TranslationTask::getDetectedLang));

        Map<String, Long> langCount = new LinkedHashMap<>();
        for (TranslationTask t : all) {
            String lang = t.getDetectedLang() != null ? t.getDetectedLang() : "unknown";
            langCount.merge(lang, 1L, Long::sum);
        }
        long total = langCount.values().stream().mapToLong(v -> v).sum();

        List<Map<String, Object>> distribution = new ArrayList<>();
        langCount.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .forEach(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("language", e.getKey());
                    item.put("count", e.getValue());
                    item.put("percentage", total > 0
                            ? Math.round(e.getValue() * 10000.0 / total) / 100.0
                            : 0.0);
                    distribution.add(item);
                });

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("distribution", distribution);
        data.put("total", total);
        return Result.success(data);
    }

    // ====== 高峰时段 ======
    @GetMapping("/peak-time")
    public Result<Map<String, Object>> peakTime() {
        List<TranslationTask> all = taskMapper.selectList(null);

        // 按小时统计
        int[] hourCount = new int[24];
        for (TranslationTask t : all) {
            if (t.getCreatedAt() != null) {
                int hour = t.getCreatedAt().getHour();
                hourCount[hour]++;
            }
        }

        List<Map<String, Object>> hourly = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("hour", h);
            item.put("count", hourCount[h]);
            hourly.add(item);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("hourly", hourly);
        return Result.success(data);
    }

    // ====== 用户趋势 (最近 10 天) ======
    @GetMapping("/users-trend")
    public Result<Map<String, Object>> usersTrend() {
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 9; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long count = taskMapper.selectCount(
                    new LambdaQueryWrapper<TranslationTask>()
                            .ge(TranslationTask::getCreatedAt, date.atStartOfDay())
                            .lt(TranslationTask::getCreatedAt, date.plusDays(1).atStartOfDay())
            );
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("date", date.toString());
            item.put("count", count);
            trend.add(item);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("trend", trend);
        return Result.success(data);
    }
}
