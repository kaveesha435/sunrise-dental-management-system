package com.sunrisedental.service;

import com.sunrisedental.dto.AuthResponse;
import com.sunrisedental.dto.LoginRequest;

/**
 * Authentication service contract.
 */
public interface AuthService {

    /**
     * Validates credentials and returns a signed JWT if successful.
     *
     * @param request login credentials (username/email + password)
     * @return {@link AuthResponse} containing the token and safe user projection
     * @throws org.springframework.security.authentication.BadCredentialsException on invalid credentials
     */
    AuthResponse login(LoginRequest request);
}
