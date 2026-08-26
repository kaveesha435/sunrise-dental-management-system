package com.sunrisedental.service;

import com.sunrisedental.dto.ChartDataDto;
import com.sunrisedental.dto.ReportDto;
import com.sunrisedental.dto.TreatmentReportDto;
import com.sunrisedental.entity.AppointmentStatus;
import com.sunrisedental.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AppointmentRepository appointmentRepository;

    public ReportDto generateReport(LocalDate startDate, LocalDate endDate, Long dentistId, Long treatmentId, AppointmentStatus status) {
        long totalAppointments = appointmentRepository.countReportAppointments(startDate, endDate, dentistId, treatmentId, status);
        long completedAppointments = appointmentRepository.countReportAppointments(startDate, endDate, dentistId, treatmentId, AppointmentStatus.COMPLETED);
        long cancelledAppointments = appointmentRepository.countReportAppointments(startDate, endDate, dentistId, treatmentId, AppointmentStatus.CANCELLED);
        
        BigDecimal totalRevenue = appointmentRepository.getTotalRevenue(startDate, endDate, dentistId, treatmentId, status);

        List<Object[]> dailyVolume = appointmentRepository.getDailyAppointmentVolume(startDate, endDate, dentistId, treatmentId, status);
        List<ChartDataDto> weeklyAppointmentVolume = new ArrayList<>();
        for (Object[] row : dailyVolume) {
            weeklyAppointmentVolume.add(new ChartDataDto(row[0].toString(), new BigDecimal(((Number) row[1]).longValue())));
        }

        List<Object[]> dailyRevenue = appointmentRepository.getDailyRevenueTrend(startDate, endDate, dentistId, treatmentId, status);
        List<ChartDataDto> revenueTrend = new ArrayList<>();
        for (Object[] row : dailyRevenue) {
            revenueTrend.add(new ChartDataDto(row[0].toString(), (BigDecimal) row[1]));
        }

        List<Object[]> treatmentData = appointmentRepository.getTreatmentReportData(startDate, endDate, dentistId, treatmentId, status);
        List<TreatmentReportDto> treatmentSummary = new ArrayList<>();
        for (Object[] row : treatmentData) {
            String name = (String) row[0];
            long count = ((Number) row[1]).longValue();
            BigDecimal revenue = (BigDecimal) row[2];
            
            double percentage = 0.0;
            if (totalRevenue != null && totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                percentage = revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            } else if (totalAppointments > 0) {
                percentage = (double) count / totalAppointments * 100.0; // fallback to count percentage if revenue is 0
            }

            treatmentSummary.add(new TreatmentReportDto(name, count, revenue, percentage));
        }

        return ReportDto.builder()
                .totalAppointments(totalAppointments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .totalRevenue(totalRevenue)
                .weeklyAppointmentVolume(weeklyAppointmentVolume)
                .revenueTrend(revenueTrend)
                .treatmentSummary(treatmentSummary)
                .build();
    }

    public String generateCsv(LocalDate startDate, LocalDate endDate, Long dentistId, Long treatmentId, AppointmentStatus status) {
        ReportDto report = generateReport(startDate, endDate, dentistId, treatmentId, status);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Sunrise Dental - Report Export\n\n");
        
        csv.append("Summary\n");
        csv.append("Total Appointments,Completed,Cancelled,Total Revenue (LKR)\n");
        csv.append(report.getTotalAppointments()).append(",");
        csv.append(report.getCompletedAppointments()).append(",");
        csv.append(report.getCancelledAppointments()).append(",");
        csv.append(report.getTotalRevenue() != null ? report.getTotalRevenue() : 0).append("\n\n");
        
        csv.append("Treatment Breakdown\n");
        csv.append("Treatment,Appointments,Revenue (LKR),Percentage (%)\n");
        for (TreatmentReportDto t : report.getTreatmentSummary()) {
            csv.append(escapeCsv(t.getTreatmentName())).append(",");
            csv.append(t.getAppointmentCount()).append(",");
            csv.append(t.getRevenue()).append(",");
            csv.append(String.format("%.2f", t.getPercentage())).append("\n");
        }
        
        return csv.toString();
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        if (data.contains(",") || data.contains("\"") || data.contains("\n")) {
            return "\"" + data.replace("\"", "\"\"") + "\"";
        }
        return data;
    }
}
