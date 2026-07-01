package com.speechtrans.controller;

import com.speechtrans.common.Result;
import com.speechtrans.config.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${server.port:8088}")
    private String serverPort;

    @Value("${app.upload.dir:./uploads/}")
    private String uploadDir;

    private final JwtUtil jwtUtil;

    public UploadController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * POST /api/upload/avatar — 上传头像
     * 返回图片 URL，前端将其存入 user.profile
     */
    @PostMapping("/avatar")
    public Result<String> uploadAvatar(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {

        // 验证登录
        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.isTokenValid(token)) {
            return Result.error(401, "Token 无效");
        }

        if (file.isEmpty()) {
            return Result.error(400, "请选择文件");
        }

        try {
            // 存储目录（使用相对路径，相对于 user.dir）
            String avatarDir = uploadDir + "avatars/";
            File dir = new File(avatarDir);
            if (!dir.exists()) dir.mkdirs();

            // 生成唯一文件名
            String ext = file.getOriginalFilename();
            ext = ext != null && ext.contains(".") ? ext.substring(ext.lastIndexOf(".")) : ".png";
            String filename = UUID.randomUUID().toString() + ext;

            // 保存文件
            Path path = Paths.get(avatarDir + filename);
            Files.write(path, file.getBytes());

            // 返回可访问的 URL
            String url = "/uploads/avatars/" + filename;

            return Result.success(url);
        } catch (IOException e) {
            return Result.error(500, "上传失败: " + e.getMessage());
        }
    }
}
