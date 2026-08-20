package com.sunrisedental.controller;

import com.sunrisedental.dto.ApiResponse;
import com.sunrisedental.dto.AuthResponse;
import com.sunrisedental.dto.LoginRequest;
import com.sunrisedental.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication REST controller.
 *
 * POST /api/auth/login   — issue JWT
 * POST /api/auth/logout  — client-side logout (stateless, no server action needed)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Validates credentials and returns a signed JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        try {
            AuthResponse authResponse = authService.login(request);
            return ResponseEntity.ok(
                    ApiResponse.success("Login successful", authResponse)
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(
                    ApiResponse.error("Invalid username/email or password")
            );
        } catch (DisabledException ex) {
            return ResponseEntity.status(403).body(
                    ApiResponse.error("Your account has been disabled. Please contact an administrator.")
            );
        }
    }

    /**
     * POST /api/auth/logout
     * Stateless JWT has no server-side session to invalidate.
     * The client is responsible for removing the token from storage.
     * This endpoint exists for future token-blacklist implementation.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
