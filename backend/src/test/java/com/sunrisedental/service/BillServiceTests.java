package com.sunrisedental.service;

import com.sunrisedental.dto.AppointmentBillingInfo;
import com.sunrisedental.dto.BillRequest;
import com.sunrisedental.dto.BillResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.entity.*;
import com.sunrisedental.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import com.sunrisedental.exception.BusinessConflictException;

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
class BillServiceTests {

    @Autowired
    private BillService billService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DentistRepository dentistRepository;

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private BillRepository billRepository;

    private Patient patient;
    private Dentist dentist;
    private Treatment treatment;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        patient = Patient.builder()
                .fullName("Test Patient")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender("MALE")
                .contactNumber("0771234567")
                .address("123 Main St")
                .city("Colombo")
                .postalCode("12345")
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
                .appointmentDate(LocalDate.now().plusDays(2))
                .appointmentTime(LocalTime.of(10, 0))
                .duration(30)
                .status(AppointmentStatus.SCHEDULED)
                .appointmentNumber("APT-99999")
                .build();
        appointment = appointmentRepository.save(appointment);
    }

    @Test
    void testGetAppointmentBillingInfo() {
        AppointmentBillingInfo info = billService.getAppointmentBillingInfo(appointment.getId());

        assertNotNull(info);
        assertEquals(appointment.getId(), info.getAppointmentId());
        assertEquals("APT-99999", info.getAppointmentNumber());
        assertEquals(patient.getId(), info.getPatientId());
        assertEquals("Test Patient", info.getPatientName());
        assertEquals("Root Canal", info.getTreatmentName());
        assertEquals(new BigDecimal("15000.00"), info.getTreatmentCost());
        assertEquals(new BigDecimal("1500.00"), info.getDefaultConsultationFee());
    }

    @Test
    void testCalculateBill() {
        BigDecimal customFee = new BigDecimal("2000.00");
        BillResponse response = billService.calculateBill(appointment.getId(), customFee);

        assertNotNull(response);
        assertEquals(appointment.getId(), response.getAppointmentId());
        assertEquals(new BigDecimal("15000.00"), response.getTreatmentCost());
        assertEquals(customFee, response.getConsultationFee());
        assertEquals(new BigDecimal("17000.00"), response.getSubtotal());
        assertEquals(new BigDecimal("17000.00"), response.getTotal());
    }

    @Test
    void testSaveBillSuccessAndCalculations() {
        BigDecimal fee = new BigDecimal("1800.00");
        BillRequest request = new BillRequest();
        request.setAppointmentId(appointment.getId());
        request.setConsultationFee(fee);
        request.setPaymentStatus("PAID");

        BillResponse saved = billService.saveBill(request);

        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertTrue(saved.getReceiptNumber().startsWith("REC-"));
        assertEquals("PAID", saved.getPaymentStatus());
        assertEquals(new BigDecimal("15000.00"), saved.getTreatmentCost());
        assertEquals(fee, saved.getConsultationFee());
        assertEquals(new BigDecimal("16800.00"), saved.getSubtotal());
        assertEquals(new BigDecimal("16800.00"), saved.getTotal());

        // Verify it was persisted in H2
        Bill persisted = billRepository.findById(saved.getId()).orElse(null);
        assertNotNull(persisted);
        assertEquals(PaymentStatus.PAID, persisted.getPaymentStatus());
        assertEquals(new BigDecimal("16800.00"), persisted.getTotal());
    }

    @Test
    void testSaveBillDuplicateFails() {
        BillRequest request = new BillRequest();
        request.setAppointmentId(appointment.getId());
        request.setConsultationFee(new BigDecimal("1500.00"));
        request.setPaymentStatus("PENDING");

        // Save first time
        billService.saveBill(request);

        // Attempt to save again
        assertThrows(BusinessConflictException.class, () -> billService.saveBill(request));
    }

    @Test
    void testSaveBillCancelledAppointmentFails() {
        // Cancel the appointment first
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);

        BillRequest request = new BillRequest();
        request.setAppointmentId(appointment.getId());
        request.setConsultationFee(new BigDecimal("1500.00"));
        request.setPaymentStatus("PENDING");

        assertThrows(BusinessConflictException.class, () -> billService.saveBill(request));
    }

    @Test
    void testGetAllBillsAndPagination() {
        BillRequest request = new BillRequest();
        request.setAppointmentId(appointment.getId());
        request.setConsultationFee(new BigDecimal("1200.00"));
        request.setPaymentStatus("PAID");
        billService.saveBill(request);

        PagedResponse<BillResponse> page = billService.getAllBills("", "PAID", 0, 10, "createdAt", "desc");

        assertNotNull(page);
        assertEquals(1, page.getContent().size());
        assertEquals(1, page.getTotalElements());
        assertTrue(page.getContent().get(0).getReceiptNumber().startsWith("REC-"));
    }
}
