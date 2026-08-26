package com.sunrisedental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private BigDecimal totalRevenue;

    private List<ChartDataDto> weeklyAppointmentVolume;
    private List<ChartDataDto> revenueTrend;
    private List<TreatmentReportDto> treatmentSummary;
}
