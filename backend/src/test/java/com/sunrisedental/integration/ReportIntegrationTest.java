package com.sunrisedental.integration;

import com.sunrisedental.entity.Role;
import com.sunrisedental.entity.User;
import com.sunrisedental.repository.UserRepository;
import com.sunrisedental.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.open-in-view=false",
        "jwt.secret=SunriseDentalJwtSecretKeyForTestSuite2024",
        "jwt.expiration=86400000"
})
@Transactional
class ReportIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String token;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUsername("admin");
        user.setEmail("admin@sunrisedental.com");
        user.setPassword("password123");
        user.setRole(Role.ADMIN);
        user.setActive(true);
        user = userRepository.save(user);
        token = "Bearer " + jwtUtil.generateToken(user);
    }

    @Test
    void testGetReportData_Success() throws Exception {
        mockMvc.perform(get("/api/reports")
                .header("Authorization", token)
                .param("period", "last_30_days")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalAppointments").exists())
                .andExpect(jsonPath("$.data.totalRevenue").exists());
    }

    @Test
    void testExportReportCsv_Success() throws Exception {
        mockMvc.perform(get("/api/reports/export")
                .header("Authorization", token)
                .param("period", "this_month")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(content().contentType("text/csv"));
    }
}
