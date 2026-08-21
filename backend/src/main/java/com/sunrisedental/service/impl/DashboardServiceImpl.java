package com.sunrisedental.service.impl;

import com.sunrisedental.dto.AppointmentSummaryDto;
import com.sunrisedental.dto.DashboardStatsDto;
import com.sunrisedental.dto.WeeklyChartDto;
import com.sunrisedental.repository.PatientRepository;
import com.sunrisedental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Dashboard service implementation.
 *
 * ============================================================
 * DEVELOPMENT NOTE — STUB DATA
 * ============================================================
 * This implementation returns realistic development data.
 * Each method body contains a TODO comment explaining which
 * repository query should replace the stub in a future commit:
 *
 *  - TODO Commit 03: Replace totalPatients with PatientRepository.count()
 *  - TODO Commit 04: Replace appointments with AppointmentRepository queries
 *  - TODO Commit 07: Replace todayRevenue with InvoiceRepository aggregation
 *  - TODO Commit 05: Replace availableDentists with DentistRepository.countActive()
 * ============================================================
 */
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PatientRepository patientRepository;

    @Override
    public DashboardStatsDto getStats() {
        /*
         * Commit 03: totalPatients now reads from real DB via PatientRepository.
         * TODO Commit 04: todayAppointments = appointmentRepository.countByDate(LocalDate.now())
         * TODO Commit 07: todayRevenue = invoiceRepository.sumPaidToday(LocalDate.now())
         * TODO Commit 05: availableDentists = dentistRepository.countByStatusAndActive(AVAILABLE, true)
         */
        long totalPatients = patientRepository.count();
        return DashboardStatsDto.builder()
                .todayAppointments(8)
                .totalPatients(totalPatients)
                .todayRevenue(new BigDecimal("24500.00"))
                .availableDentists(3)
                .build();
    }

    @Override
    public List<AppointmentSummaryDto> getTodayAppointments() {
        /*
         * TODO Commit 04: Replace with appointmentRepository.findByDate(LocalDate.now())
         *   mapped to AppointmentSummaryDto via a projection or mapper.
         */
        return List.of(
                appt(1L, "Amara Silva",          "Dr. D. Perera",     "09:00 AM", "Teeth Cleaning", "COMPLETED"),
                appt(2L, "Kasun Fernando",        "Dr. L. Wijesinghe", "09:30 AM", "Root Canal",     "IN_PROGRESS"),
                appt(3L, "Nisha Raj",             "Dr. D. Perera",     "10:00 AM", "Filling",        "SCHEDULED"),
                appt(4L, "Rohan Jayawardena",     "Dr. S. Fernando",   "10:30 AM", "Extraction",     "SCHEDULED"),
                appt(5L, "Dilani Herath",         "Dr. L. Wijesinghe", "11:00 AM", "Consultation",   "SCHEDULED"),
                appt(6L, "Tharanga Silva",        "Dr. D. Perera",     "02:00 PM", "Whitening",      "SCHEDULED"),
                appt(7L, "Priya Krishnamurti",    "Dr. S. Fernando",   "03:30 PM", "Check-up",       "SCHEDULED"),
                appt(8L, "Sandaru Gunasekara",    "Dr. D. Perera",     "04:00 PM", "Braces Adjust",  "SCHEDULED")
        );
    }

    @Override
    public List<AppointmentSummaryDto> getUpcomingAppointments() {
        /*
         * TODO Commit 04: Replace with appointmentRepository.findUpcoming(LocalDate.now(), limit=5)
         */
        return List.of(
                appt(9L,  "Kavya Patel",          "Dr. L. Wijesinghe", "Tomorrow, 10:00 AM", "Consultation",   "SCHEDULED"),
                appt(10L, "Mihiri Gunawardena",   "Dr. S. Fernando",   "Tomorrow, 02:30 PM", "Filling",        "SCHEDULED"),
                appt(11L, "Amara Silva",           "Dr. D. Perera",     "Wed, 09:00 AM",      "Follow-up",      "SCHEDULED"),
                appt(12L, "Yasir Hameed",          "Dr. L. Wijesinghe", "Wed, 11:00 AM",      "Teeth Cleaning", "SCHEDULED"),
                appt(13L, "Sachini Bandara",       "Dr. D. Perera",     "Thu, 10:00 AM",      "Root Canal",     "SCHEDULED")
        );
    }

    @Override
    public WeeklyChartDto getWeeklyChart() {
        /*
         * TODO Commit 04: Replace with:
         *   SELECT DATE(appointment_date), COUNT(*) FROM appointments
         *   WHERE appointment_date BETWEEN :weekStart AND :weekEnd
         *   GROUP BY DATE(appointment_date)
         */
        return WeeklyChartDto.builder()
                .labels(List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"))
                .appointments(List.of(12, 8, 15, 10, 14, 6, 2))
                .build();
    }

    /** Helper to build appointment summary stubs. */
    private AppointmentSummaryDto appt(Long id, String patient, String dentist,
                                        String time, String treatment, String status) {
        return AppointmentSummaryDto.builder()
                .id(id)
                .patientName(patient)
                .dentistName(dentist)
                .time(time)
                .treatment(treatment)
                .status(status)
                .build();
    }
}
