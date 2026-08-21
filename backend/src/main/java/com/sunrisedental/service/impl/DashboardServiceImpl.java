package com.sunrisedental.service.impl;

import com.sunrisedental.dto.AppointmentSummaryDto;
import com.sunrisedental.dto.DashboardStatsDto;
import com.sunrisedental.dto.WeeklyChartDto;
import com.sunrisedental.entity.Appointment;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.PatientRepository;
import com.sunrisedental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final AppointmentRepository appointmentRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    @Override
    public DashboardStatsDto getStats() {
        long totalPatients = patientRepository.count();
        long todayApptsCount = appointmentRepository.countTodayAppointments(LocalDate.now());
        
        return DashboardStatsDto.builder()
                .todayAppointments((int) todayApptsCount)
                .totalPatients(totalPatients)
                .todayRevenue(new BigDecimal("24500.00")) // Billing not implemented yet
                .availableDentists(3) // Dentist management not implemented yet
                .build();
    }

    @Override
    public List<AppointmentSummaryDto> getTodayAppointments() {
        List<Appointment> appts = appointmentRepository.findTodayAppointmentsList(LocalDate.now());
        return appts.stream()
                .map(a -> appt(a.getId(), a.getPatient().getFullName(), a.getDentist(), 
                        a.getAppointmentTime().format(TIME_FORMATTER), a.getTreatment(), a.getStatus().name()))
                .toList();
    }

    @Override
    public List<AppointmentSummaryDto> getUpcomingAppointments() {
        List<Appointment> appts = appointmentRepository.findUpcomingAppointments(
                LocalDate.now(), LocalTime.now(), PageRequest.of(0, 5));
        return appts.stream()
                .map(a -> appt(a.getId(), a.getPatient().getFullName(), a.getDentist(), 
                        a.getAppointmentDate().toString() + " · " + a.getAppointmentTime().format(TIME_FORMATTER), 
                        a.getTreatment(), a.getStatus().name()))
                .toList();
    }

    @Override
    public WeeklyChartDto getWeeklyChart() {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);

        List<Object[]> stats = appointmentRepository.getWeeklyStats(monday, sunday);
        Map<LocalDate, Long> countsMap = new HashMap<>();
        for (Object[] row : stats) {
            countsMap.put((LocalDate) row[0], (Long) row[1]);
        }

        List<String> labels = List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
        List<Integer> appointments = new ArrayList<>();
        
        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);
            long count = countsMap.getOrDefault(date, 0L);
            appointments.add((int) count);
        }

        return WeeklyChartDto.builder()
                .labels(labels)
                .appointments(appointments)
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
