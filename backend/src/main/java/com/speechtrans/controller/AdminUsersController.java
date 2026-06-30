package com.speechtrans.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.speechtrans.common.Result;
import com.speechtrans.entity.User;
import com.speechtrans.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUsersController {

    private final UserMapper userMapper;

    @GetMapping("/users")
    public Result<Map<String, Object>> listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            wrapper.like(User::getUsername, keyword);
        }
        wrapper.orderByDesc(User::getCreatedAt);

        IPage<User> pageResult = userMapper.selectPage(new Page<>(page, size), wrapper);

        List<Map<String, Object>> records = new ArrayList<>();
        for (User u : pageResult.getRecords()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", u.getId());
            item.put("username", u.getUsername());
            item.put("email", u.getEmail());
            item.put("role", u.getRole());
            item.put("status", u.getStatus());
            item.put("lastLogin", u.getLastLogin());
            item.put("createdAt", u.getCreatedAt());
            records.add(item);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", records);
        result.put("total", pageResult.getTotal());
        result.put("page", page);
        result.put("size", size);
        return Result.success(result);
    }

    @GetMapping("/users/{id}")
    public Result<Map<String, Object>> getUserDetail(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("email", user.getEmail());
        data.put("role", user.getRole());
        data.put("status", user.getStatus());
        data.put("avatar", user.getAvatar());
        data.put("lastLogin", user.getLastLogin());
        data.put("createdAt", user.getCreatedAt());
        return Result.success(data);
    }

    @PutMapping("/users/{id}/status")
    public Result<String> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        Integer status = body.get("status");
        user.setStatus(status != null ? status : (user.getStatus() == 1 ? 0 : 1));
        userMapper.updateById(user);
        return Result.success("状态更新成功");
    }
}
