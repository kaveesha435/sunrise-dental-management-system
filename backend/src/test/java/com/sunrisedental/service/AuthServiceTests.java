package com.sunrisedental.service;

import com.sunrisedental.dto.AuthResponse;
import com.sunrisedental.dto.LoginRequest;
import com.sunrisedental.entity.Role;
import com.sunrisedental.entity.User;
import com.sunrisedental.service.impl.AuthServiceImpl;
import com.sunrisedental.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private User mockUser;
    private LoginRequest validRequest;
    private LoginRequest invalidRequest;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("admin");
        mockUser.setEmail("admin@sunrisedental.com");
        mockUser.setPassword("hashedpassword");
        mockUser.setRole(Role.ADMIN);
        mockUser.setActive(true);

        validRequest = new LoginRequest();
        validRequest.setUsernameOrEmail("admin");
        validRequest.setPassword("password123");

        invalidRequest = new LoginRequest();
        invalidRequest.setUsernameOrEmail("admin");
        invalidRequest.setPassword("wrongpassword");
    }

    @Test
    void testLogin_Success() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        
        when(jwtUtil.generateToken(mockUser)).thenReturn("mocked-jwt-token");
        when(jwtUtil.getExpirationMs()).thenReturn(3600000L);

        AuthResponse response = authService.login(validRequest);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(3600000L, response.getExpiresIn());
        
        assertNotNull(response.getUser());
        assertEquals(1L, response.getUser().getId());
        assertEquals("admin", response.getUser().getUsername());
        assertEquals("ADMIN", response.getUser().getRole());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, times(1)).generateToken(mockUser);
    }

    @Test
    void testLogin_InvalidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(invalidRequest);
        });

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, never()).generateToken(any());
    }
}
