package com.speechtrans.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.*;

/**
 * WebSocket 实时推送控制器
 *
 * 协议定义（前端订阅）：
 *   /topic/tasks       — 翻译任务状态更新
 *   /topic/queue       — 队列统计变化
 *   /topic/logs        — 系统日志推送
 *
 * 消息格式：
 *   {
 *     "type": "TASK_UPDATE",
 *     "taskId": 12,
 *     "status": "PROCESSING_ASR",
 *     "progress": 0.45,
 *     "timestamp": "2026-06-30T14:30:00"
 *   }
 */
@Controller
@EnableScheduling
public class WebSocketPushController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * 客户端发送消息到 /app/status，广播到 /topic/tasks
     */
    @MessageMapping("/status")
    @SendTo("/topic/tasks")
    public Map<String, Object> broadcastStatus(Map<String, Object> payload) {
        payload.put("timestamp", LocalDateTime.now().toString());
        return payload;
    }

    /**
     * 模拟心跳 —— 每 10 秒推一次队列统计
     */
    @Scheduled(fixedRate = 10000)
    public void pushHeartbeat() {
        Map<String, Object> heartbeat = new LinkedHashMap<>();
        heartbeat.put("type", "HEARTBEAT");
        heartbeat.put("timestamp", LocalDateTime.now().toString());
        heartbeat.put("status", "healthy");
        messagingTemplate.convertAndSend("/topic/tasks", heartbeat);
    }
}
