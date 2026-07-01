package com.speechtrans.controller;

import com.speechtrans.common.Result;
import com.speechtrans.config.JwtUtil;
import com.speechtrans.dto.LoginRequest;
import com.speechtrans.dto.LoginResponse;
import com.speechtrans.dto.RegisterRequest;
import com.speechtrans.entity.User;
import com.speechtrans.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest req) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, req.getUsername())
        );
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return Result.error(401, "用户名或密码错误");
        }
        if (user.getStatus() == 2) {
            return Result.error(403, "账号已被冻结");
        }
        // 更新最后登录时间
        user.setLastLogin(LocalDateTime.now());
        userMapper.updateById(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        return Result.success(new LoginResponse(
                token,
                user.getUsername(),
                user.getRole(),
                user.getEmail() != null ? user.getEmail() : "",
                user.getAvatar() != null ? user.getAvatar() : ""
        ));
    }

    @PostMapping("/register")
    public Result<String> register(@RequestBody RegisterRequest req) {
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, req.getUsername())
        );
        if (count > 0) {
            return Result.error(400, "用户名已存在");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        user.setRole("USER");
        user.setStatus(1);
        userMapper.insert(user);
        return Result.success("注册成功");
    }

    @GetMapping("/info")
    public Result<Map<String, Object>> userInfo(@RequestHeader("Authorization") String authHeader) {
        // 简化版：从 JWT 提取用户 ID 查询
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
                "role", user.getRole(),
                "avatar", user.getAvatar() != null ? user.getAvatar() : "",
                "createdAt", user.getCreatedAt()
        ));
    }
}
