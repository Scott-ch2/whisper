package com.speechtrans.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("translation_segment")
public class TranslationSegment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long taskId;
    private Integer seq;
    private Float startTime;
    private Float endTime;
    private String sourceText;
    private String targetText;
    private Float confidence;
}
