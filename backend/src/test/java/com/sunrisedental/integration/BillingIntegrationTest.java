package com.sunrisedental.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sunrisedental.dto.BillRequest;
import com.sunrisedental.entity.*;
import com.sunrisedental.repository.*;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

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
class BillingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DentistRepository dentistRepository;

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String token;
    private Appointment appointment;

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

        Patient patient = Patient.builder()
                .fullName("Test Patient")
                .contactNumber("0771234567")
                .build();
        patient = patientRepository.save(patient);

        Dentist dentist = Dentist.builder()
                .name("Dr. D. Perera")
                .specialization("General")
                .build();
        dentist = dentistRepository.save(dentist);

        Treatment treatment = Treatment.builder()
                .name("Root Canal")
                .standardCost(new BigDecimal("15000.00"))
                .build();
        treatment = treatmentRepository.save(treatment);

        appointment = Appointment.builder()
                .patient(patient)
                .dentist(dentist)
                .treatment(treatment)
                .appointmentDate(LocalDate.now().plusDays(1))
                .appointmentTime(LocalTime.of(10, 0))
                .duration(30)
                .status(AppointmentStatus.COMPLETED) // Must be completed to bill usually, though system allows scheduled
                .appointmentNumber("APT-BILL")
                .build();
        appointment = appointmentRepository.save(appointment);
    }

    @Test
    void testSaveBill_Success() throws Exception {
        BillRequest request = new BillRequest();
        request.setAppointmentId(appointment.getId());
        request.setConsultationFee(new BigDecimal("1500.00"));
        request.setPaymentStatus("PAID");
        request.setPaymentMethod("CREDIT_CARD");

        mockMvc.perform(post("/api/billing")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.receiptNumber").exists())
                .andExpect(jsonPath("$.data.total").value(16500.00));
    }

    @Test
    void testGetBillingInfo_Success() throws Exception {
        mockMvc.perform(get("/api/billing/appointment/" + appointment.getId())
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.treatmentCost").value(15000.00));
    }

    @Test
    void testCalculateBill_Success() throws Exception {
        mockMvc.perform(get("/api/billing/calculate/" + appointment.getId())
                .header("Authorization", token)
                .param("consultationFee", "2000.00")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.total").value(17000.00));
    }
}
