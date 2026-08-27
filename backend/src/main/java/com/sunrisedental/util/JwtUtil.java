package com.sunrisedental.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

/**
 * Utility class for generating, parsing, and validating JSON Web Tokens.
 *
 * Uses HMAC-SHA256 (HS256) signing. The secret key is read from
 * {@code jwt.secret} and must be at least 32 characters long (256 bits).
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Getter
    @Value("${jwt.expiration}")
    private long expirationMs;

    // -------------------------------------------------------
    // Token generation
    // -------------------------------------------------------

    /**
     * Generates a signed JWT for the given user.
     *
     * @param userDetails the authenticated user
     * @return signed JWT string
     */
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // -------------------------------------------------------
    // Token validation
    // -------------------------------------------------------

    /**
     * Returns true if the token is valid for the given user and not expired.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    // -------------------------------------------------------
    // Claims extraction
    // -------------------------------------------------------

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // -------------------------------------------------------
    // Signing key
    // -------------------------------------------------------

    /**
     * Derives the {@link SecretKey} from the configured secret string.
     * The secret must be ≥ 32 bytes (256 bits) for HS256.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
