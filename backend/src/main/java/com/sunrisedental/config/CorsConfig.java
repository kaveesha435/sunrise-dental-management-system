package com.sunrisedental.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration — allows the React frontend dev server to communicate
 * with the Spring Boot API during development.
 *
 * For production, restrict {@code allowedOrigins} to the deployed frontend URL.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Comma-separated list of origins allowed to call the API. Defaults to the
     * local dev servers; set CORS_ALLOWED_ORIGINS to the deployed frontend URL
     * when hosting.
     */
    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
