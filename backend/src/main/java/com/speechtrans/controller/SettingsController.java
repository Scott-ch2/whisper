package com.speechtrans.controller;

import com.speechtrans.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/settings")
public class SettingsController {

    // 简单用内存 Map 模拟配置存储（生产环境应存数据库）
    private static final Map<String, Object> SETTINGS = new LinkedHashMap<>();

    static {
        SETTINGS.put("systemName", "Whisper Control Center");
        SETTINGS.put("language", "English");
        SETTINGS.put("timeZone", "UTC+8 (Asia/Shanghai)");
        SETTINGS.put("theme", "forest");
        SETTINGS.put("glassOpacity", "medium");
        SETTINGS.put("density", "comfortable");
        SETTINGS.put("twoFactorAuth", true);
        SETTINGS.put("sessionTimeout", 30);
        SETTINGS.put("apiKey", "sk-••••••••••••••••");
        SETTINGS.put("audioAutoCleanup", true);
        SETTINGS.put("audioRetentionDays", 30);
        SETTINGS.put("errorAlerts", true);
        SETTINGS.put("dailyDigest", false);
        SETTINGS.put("defaultModel", "GPT-4 Turbo");
        SETTINGS.put("temperature", 0.7);
        SETTINGS.put("rateLimit", 500);
    }

    @GetMapping
    public Result<Map<String, Object>> getSettings() {
        return Result.success(new LinkedHashMap<>(SETTINGS));
    }

    @PutMapping
    public Result<String> updateSettings(@RequestBody Map<String, Object> updates) {
        SETTINGS.putAll(updates);
        return Result.success("设置已更新");
    }
}
