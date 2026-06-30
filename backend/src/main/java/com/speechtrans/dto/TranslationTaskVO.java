package com.speechtrans.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranslationTaskVO {
    private Long id;
    private Long userId;
    private String srcLang;
    private String tgtLang;
    private String detectedLang;
    private String transcription;
    private String translation;
    private String status;
    private Float audioDuration;
    private List<Map<String, Object>> segments;
    private LocalDateTime createdAt;
}
