package com.sunrisedental.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sunrisedental.dto.AppointmentRequest;
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
class AppointmentIntegrationTest {

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
    private Patient patient;
    private Dentist dentist;
    private Treatment treatment;
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

        patient = Patient.builder()
                .fullName("Test Patient")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender("MALE")
                .contactNumber("0771234567")
                .address("123 Main St")
                .city("Colombo")
                .postalCode("12345")
                .status("ACTIVE")
                .build();
        patient = patientRepository.save(patient);

        dentist = Dentist.builder()
                .name("Dr. D. Perera")
                .specialization("General Dentistry")
                .contact("0777654321")
                .email("perera@sunrisedental.lk")
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .active(true)
                .build();
        dentist = dentistRepository.save(dentist);

        treatment = Treatment.builder()
                .name("Root Canal")
                .description("Root canal treatment")
                .standardCost(new BigDecimal("15000.00"))
                .active(true)
                .build();
        treatment = treatmentRepository.save(treatment);

        appointment = Appointment.builder()
                .patient(patient)
                .dentist(dentist)
                .treatment(treatment)
                .appointmentDate(LocalDate.now().plusDays(5))
                .appointmentTime(LocalTime.of(9, 0))
                .duration(30)
                .status(AppointmentStatus.SCHEDULED)
                .appointmentNumber("APT-12345")
                .build();
        appointment = appointmentRepository.save(appointment);
    }

    @Test
    void testCreateAppointment_Success() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(patient.getId());
        request.setDentistId(dentist.getId());
        request.setTreatmentId(treatment.getId());
        request.setAppointmentDate(LocalDate.now().plusDays(2));
        request.setAppointmentTime(LocalTime.of(10, 0));
        request.setDuration(30);

        mockMvc.perform(post("/api/appointments")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.appointmentNumber").exists());
    }

    @Test
    void testCreateAppointment_Conflict() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(patient.getId());
        request.setDentistId(dentist.getId());
        request.setTreatmentId(treatment.getId());
        request.setAppointmentDate(LocalDate.now().plusDays(5));
        request.setAppointmentTime(LocalTime.of(9, 15)); // Overlaps with existing 9:00 (duration 30)
        request.setDuration(30);

        mockMvc.perform(post("/api/appointments")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()) // Global exception handler maps IllegalArgument to 400
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testCancelAppointment_Success() throws Exception {
        mockMvc.perform(post("/api/appointments/" + appointment.getId() + "/cancel")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
