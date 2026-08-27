package com.sunrisedental.service;

import com.sunrisedental.dto.ReportDto;
import com.sunrisedental.entity.AppointmentStatus;
import com.sunrisedental.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTests {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private ReportService reportService;

    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.now().minusDays(30);
        endDate = LocalDate.now();
    }

    @Test
    void testGenerateReport_Success() {
        when(appointmentRepository.countReportAppointments(any(), any(), any(), any(), eq(null)))
                .thenReturn(100L);
        when(appointmentRepository.countReportAppointments(any(), any(), any(), any(), eq(AppointmentStatus.COMPLETED)))
                .thenReturn(80L);
        when(appointmentRepository.countReportAppointments(any(), any(), any(), any(), eq(AppointmentStatus.CANCELLED)))
                .thenReturn(5L);

        when(appointmentRepository.getTotalRevenue(any(), any(), any(), any(), eq(null)))
                .thenReturn(new BigDecimal("150000.00"));

        List<Object[]> mockDailyVolume = List.of(new Object[]{"2023-10-01", 5L});
        when(appointmentRepository.getDailyAppointmentVolume(any(), any(), any(), any(), eq(null)))
                .thenReturn(mockDailyVolume);

        List<Object[]> mockDailyRevenue = List.of(new Object[]{"2023-10-01", new BigDecimal("7500.00")});
        when(appointmentRepository.getDailyRevenueTrend(any(), any(), any(), any(), eq(null)))
                .thenReturn(mockDailyRevenue);

        List<Object[]> mockTreatmentData = List.of(new Object[]{"Root Canal", 10L, new BigDecimal("50000.00")});
        when(appointmentRepository.getTreatmentReportData(any(), any(), any(), any(), eq(null)))
                .thenReturn(mockTreatmentData);

        ReportDto report = reportService.generateReport(startDate, endDate, null, null, null);

        assertNotNull(report);
        assertEquals(100L, report.getTotalAppointments());
        assertEquals(80L, report.getCompletedAppointments());
        assertEquals(5L, report.getCancelledAppointments());
        assertEquals(new BigDecimal("150000.00"), report.getTotalRevenue());
        
        assertEquals(1, report.getWeeklyAppointmentVolume().size());
        assertEquals(1, report.getRevenueTrend().size());
        assertEquals(1, report.getTreatmentSummary().size());

        assertEquals("Root Canal", report.getTreatmentSummary().get(0).getTreatmentName());
        assertEquals(33.3333, report.getTreatmentSummary().get(0).getPercentage(), 0.01);
    }

    @Test
    void testGenerateCsv_Success() {
        when(appointmentRepository.countReportAppointments(any(), any(), any(), any(), eq(null)))
                .thenReturn(10L);
        when(appointmentRepository.countReportAppointments(any(), any(), any(), any(), eq(AppointmentStatus.COMPLETED)))
                .thenReturn(10L);
        when(appointmentRepository.countReportAppointments(any(), any(), any(), any(), eq(AppointmentStatus.CANCELLED)))
                .thenReturn(0L);

        when(appointmentRepository.getTotalRevenue(any(), any(), any(), any(), eq(null)))
                .thenReturn(new BigDecimal("5000.00"));

        when(appointmentRepository.getDailyAppointmentVolume(any(), any(), any(), any(), eq(null)))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.getDailyRevenueTrend(any(), any(), any(), any(), eq(null)))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.getTreatmentReportData(any(), any(), any(), any(), eq(null)))
                .thenReturn(Collections.emptyList());

        String csv = reportService.generateCsv(startDate, endDate, null, null, null);

        assertNotNull(csv);
        assertTrue(csv.contains("Sunrise Dental - Report Export"));
        assertTrue(csv.contains("Total Appointments,Completed,Cancelled,Total Revenue"));
        assertTrue(csv.contains("10,10,0,5000.00"));
    }
}
