package com.speechtrans.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("model_config")
public class ModelConfig {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String modelName;
    private String modelType;
    private Integer isEnabled;
    private String configJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
