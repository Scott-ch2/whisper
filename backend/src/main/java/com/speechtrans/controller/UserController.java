package com.speechtrans.controller;

import com.speechtrans.common.Result;
import com.speechtrans.config.JwtUtil;
import com.speechtrans.entity.User;
import com.speechtrans.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * GET /api/user/profile — 获取当前用户信息
     */
    @GetMapping("/profile")
    public Result<Map<String, Object>> getProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.isTokenValid(token)) {
            return Result.error(401, "Token 无效");
        }
        Long userId = jwtUtil.getUserId(token);
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "avatar", user.getAvatar() != null ? user.getAvatar() : ""
        ));
    }

    /**
     * PUT /api/user/profile — 更新用户名/邮箱/头像
     */
    @PutMapping("/profile")
    public Result<Map<String, Object>> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.isTokenValid(token)) {
            return Result.error(401, "Token 无效");
        }
        Long userId = jwtUtil.getUserId(token);
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }

        if (body.containsKey("username") && !body.get("username").isBlank()) {
            user.setUsername(body.get("username").trim());
        }
        if (body.containsKey("email") && !body.get("email").isBlank()) {
            user.setEmail(body.get("email").trim());
        }
        if (body.containsKey("avatar")) {
            user.setAvatar(body.get("avatar"));
        }

        userMapper.updateById(user);

        return Result.success(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "avatar", user.getAvatar() != null ? user.getAvatar() : ""
        ));
    }

    /**
     * PUT /api/user/password — 修改密码
     */
    @PutMapping("/password")
    public Result<String> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.isTokenValid(token)) {
            return Result.error(401, "Token 无效");
        }
        Long userId = jwtUtil.getUserId(token);
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }

        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        // 校验旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return Result.error(400, "当前密码错误");
        }

        // 校验新密码
        if (newPassword == null || newPassword.length() < 6) {
            return Result.error(400, "新密码长度至少6位");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);

        return Result.success("密码修改成功");
    }
}
