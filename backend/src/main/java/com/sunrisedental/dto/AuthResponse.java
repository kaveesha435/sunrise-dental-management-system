package com.sunrisedental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body for a successful POST /api/auth/login.
 * Contains the signed JWT and a safe user projection.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /** Signed JWT Bearer token. */
    private String token;

    /** Token type — always "Bearer". */
    @Builder.Default
    private String tokenType = "Bearer";

    /** Token lifetime in milliseconds (mirrors jwt.expiration). */
    private long expiresIn;

    /** Safe user projection — no password hash. */
    private UserResponse user;
}
