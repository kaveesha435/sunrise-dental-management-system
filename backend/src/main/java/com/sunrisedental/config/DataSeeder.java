package com.sunrisedental.config;

import com.sunrisedental.entity.Role;
import com.sunrisedental.entity.User;
import com.sunrisedental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataSeeder — seeds the initial administrator account on first startup.
 *
 * Safe to run in all environments: checks for existing records before inserting.
 *
 * ============================================================
 * DEVELOPMENT CREDENTIALS (local development only)
 * ============================================================
 *  Username : admin
 *  Email    : admin@sunrisedental.lk
 *  Password : Admin@123
 * ============================================================
 *
 * WARNING: Change this password immediately in any non-development environment.
 * The production password should be provided via environment variable or
 * a secure secrets manager and NEVER committed to source control.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedAdminUser();
    }

    private void seedAdminUser() {
        if (userRepository.existsByUsername("admin")) {
            log.info("DataSeeder: admin user already exists — skipping seed.");
            return;
        }

        User admin = User.builder()
                .username("admin")
                .email("admin@sunrisedental.lk")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .active(true)
                .build();

        userRepository.save(admin);
        log.info("DataSeeder: admin user created — username: admin, email: admin@sunrisedental.lk");
    }
}
