package com.speechtrans.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("translation_task")
public class TranslationTask {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String audioFileName;
    private String audioFilePath;
    private Float audioDuration;
    private String srcLang;
    private String tgtLang;
    private String detectedLang;
    private String transcription;
    private String translation;
    private String segmentsJson;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
