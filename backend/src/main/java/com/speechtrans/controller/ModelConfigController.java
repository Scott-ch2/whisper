package com.speechtrans.controller;

import com.speechtrans.common.Result;
import com.speechtrans.entity.ModelConfig;
import com.speechtrans.mapper.ModelConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ModelConfigController {

    private final ModelConfigMapper modelMapper;

    @GetMapping("/models")
    public Result<List<Map<String, Object>>> listModels() {
        List<ModelConfig> models = modelMapper.selectList(null);
        List<Map<String, Object>> records = new ArrayList<>();
        for (ModelConfig m : models) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", m.getId());
            item.put("modelName", m.getModelName());
            item.put("modelType", m.getModelType());
            item.put("isEnabled", m.getIsEnabled());
            item.put("configJson", m.getConfigJson());
            item.put("updatedAt", m.getUpdatedAt());
            records.add(item);
        }
        return Result.success(records);
    }

    @GetMapping("/models/{id}")
    public Result<Map<String, Object>> getModel(@PathVariable Long id) {
        ModelConfig m = modelMapper.selectById(id);
        if (m == null) {
            return Result.error(404, "模型不存在");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", m.getId());
        data.put("modelName", m.getModelName());
        data.put("modelType", m.getModelType());
        data.put("isEnabled", m.getIsEnabled());
        data.put("configJson", m.getConfigJson());
        return Result.success(data);
    }

    @PutMapping("/models/{id}")
    public Result<String> updateModel(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        ModelConfig m = modelMapper.selectById(id);
        if (m == null) {
            return Result.error(404, "模型不存在");
        }
        if (body.containsKey("isEnabled")) {
            m.setIsEnabled((Integer) body.get("isEnabled"));
        }
        if (body.containsKey("configJson")) {
            m.setConfigJson((String) body.get("configJson"));
        }
        modelMapper.updateById(m);
        return Result.success("模型配置更新成功");
    }
}
