package com.speechtrans.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("system_log")
public class SystemLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String action;
    private Long targetId;
    private String detail;
    private String ip;
    private String userAgent;
    private LocalDateTime createdAt;
}
