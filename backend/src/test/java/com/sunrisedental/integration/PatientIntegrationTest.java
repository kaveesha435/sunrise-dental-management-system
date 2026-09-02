package com.sunrisedental.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sunrisedental.dto.PatientRequest;
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

import java.time.LocalDate;

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
class PatientIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String token;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUsername("patient-test-admin");
        user.setEmail("patient-test-admin@sunrisedental.lk");
        user.setPassword("password123");
        user.setRole(Role.ADMIN);
        user.setActive(true);
        user = userRepository.save(user);

        token = "Bearer " + jwtUtil.generateToken(user);
    }

    @Test
    void testCreatePatient_Success() throws Exception {
        PatientRequest request = new PatientRequest();
        request.setFullName("John Doe");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));
        request.setGender("MALE");
        request.setContactNumber("0771112233");
        request.setEmail("john.doe@example.com");
        request.setAddress("123 Main St");
        request.setCity("Colombo");
        request.setPostalCode("00100");
        request.setStatus("ACTIVE");

        mockMvc.perform(post("/api/patients")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("John Doe"))
                .andExpect(jsonPath("$.data.id").exists());
    }

    @Test
    void testCreatePatient_Unauthorized() throws Exception {
        PatientRequest request = new PatientRequest();
        request.setFullName("John Doe");

        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()); // Expect 401 or 403 because no token
    }

    @Test
    void testCreatePatient_ValidationFailure() throws Exception {
        PatientRequest request = new PatientRequest();
        // Missing required fields

        mockMvc.perform(post("/api/patients")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testGetAllPatients_Success() throws Exception {
        mockMvc.perform(get("/api/patients")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").exists());
    }
}
