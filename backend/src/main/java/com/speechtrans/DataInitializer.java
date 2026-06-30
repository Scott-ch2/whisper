package com.speechtrans;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.speechtrans.entity.User;
import com.speechtrans.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 如果 admin 不存在则创建
        Long adminCount = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, "admin"));
        if (adminCount == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@whisper.io");
            admin.setRole("ADMIN");
            admin.setStatus(1);
            userMapper.insert(admin);
            System.out.println(">>> Admin user created: admin / admin123");
        } else {
            // 修复已有 admin 的密码
            User admin = userMapper.selectOne(
                    new LambdaQueryWrapper<User>().eq(User::getUsername, "admin"));
            admin.setPassword(passwordEncoder.encode("admin123"));
            userMapper.updateById(admin);
            System.out.println(">>> Admin password reset to: admin123");
        }

        // 如果 test 不存在则创建
        Long testCount = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, "test"));
        if (testCount == 0) {
            User test = new User();
            test.setUsername("test");
            test.setPassword(passwordEncoder.encode("123456"));
            test.setEmail("test@whisper.io");
            test.setRole("USER");
            test.setStatus(1);
            userMapper.insert(test);
            System.out.println(">>> Test user created: test / 123456");
        }
    }
}
