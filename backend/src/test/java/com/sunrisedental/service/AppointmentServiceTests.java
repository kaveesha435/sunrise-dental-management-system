package com.sunrisedental.service;

import com.sunrisedental.dto.AppointmentRequest;
import com.sunrisedental.dto.AppointmentResponse;
import com.sunrisedental.entity.AvailabilityStatus;
import com.sunrisedental.entity.Dentist;
import com.sunrisedental.entity.Patient;
import com.sunrisedental.entity.Treatment;
import com.sunrisedental.repository.DentistRepository;
import com.sunrisedental.repository.PatientRepository;
import com.sunrisedental.repository.TreatmentRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
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
class AppointmentServiceTests {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DentistRepository dentistRepository;

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Test
    void testCreateAppointmentAndConflict() {
        Patient patient = Patient.builder()
                .fullName("Test Patient")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender("MALE")
                .contactNumber("0771234567")
                .address("123 Main St")
                .city("Colombo")
                .postalCode("12345")
                .build();
        patient = patientRepository.save(patient);

        Dentist dentist = Dentist.builder()
                .name("Dr. D. Perera")
                .specialization("General Dentistry")
                .contact("0777654321")
                .email("perera@sunrisedental.lk")
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .active(true)
                .build();
        dentist = dentistRepository.save(dentist);

        Treatment rootCanal = Treatment.builder()
                .name("Root Canal")
                .description("Root canal treatment")
                .standardCost(new BigDecimal("15000.00"))
                .active(true)
                .build();
        rootCanal = treatmentRepository.save(rootCanal);

        Treatment filling = Treatment.builder()
                .name("Filling")
                .description("Tooth filling")
                .standardCost(new BigDecimal("3500.00"))
                .active(true)
                .build();
        filling = treatmentRepository.save(filling);

        LocalDate date = LocalDate.now().plusDays(2);
        LocalTime time = LocalTime.of(10, 0);

        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(patient.getId());
        request.setDentistId(dentist.getId());
        request.setTreatmentId(rootCanal.getId());
        request.setAppointmentDate(date);
        request.setAppointmentTime(time);
        request.setDuration(30);

        AppointmentResponse response = appointmentService.create(request);
        assertNotNull(response);
        assertNotNull(response.getAppointmentNumber());

        // Try double booking the same dentist at overlapping time (10:15)
        AppointmentRequest conflictRequest = new AppointmentRequest();
        conflictRequest.setPatientId(patient.getId());
        conflictRequest.setDentistId(dentist.getId());
        conflictRequest.setTreatmentId(filling.getId());
        conflictRequest.setAppointmentDate(date);
        conflictRequest.setAppointmentTime(LocalTime.of(10, 15));
        conflictRequest.setDuration(30);

        assertThrows(IllegalArgumentException.class, () -> appointmentService.create(conflictRequest));
    }
}
