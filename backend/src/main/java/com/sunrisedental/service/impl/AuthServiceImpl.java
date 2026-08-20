package com.sunrisedental.service.impl;

import com.sunrisedental.dto.AuthResponse;
import com.sunrisedental.dto.LoginRequest;
import com.sunrisedental.dto.UserResponse;
import com.sunrisedental.entity.User;
import com.sunrisedental.service.AuthService;
import com.sunrisedental.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/**
 * Authentication service implementation.
 * Delegates credential validation to Spring Security's {@link AuthenticationManager}
 * and issues a JWT on success.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse login(LoginRequest request) {
        // Delegate to Spring Security — throws BadCredentialsException on failure
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user);

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .active(user.isActive())
                .build();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                .user(userResponse)
                .build();
    }
}
