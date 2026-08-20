package com.sunrisedental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Dashboard headline statistics.
 *
 * TODO (Commit 03+): Replace stub values in {@code DashboardServiceImpl}
 *   with real aggregation queries once Patient, Appointment, and Billing
 *   repositories are available.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {

    private int todayAppointments;
    private int totalPatients;
    private BigDecimal todayRevenue;
    private int availableDentists;
}
