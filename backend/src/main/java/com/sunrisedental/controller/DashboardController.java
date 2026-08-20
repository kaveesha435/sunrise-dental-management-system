package com.sunrisedental.controller;

import com.sunrisedental.dto.ApiResponse;
import com.sunrisedental.dto.AppointmentSummaryDto;
import com.sunrisedental.dto.DashboardStatsDto;
import com.sunrisedental.dto.WeeklyChartDto;
import com.sunrisedental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Dashboard REST controller — requires authentication.
 *
 * All endpoints under /api/dashboard are protected by the JWT filter.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** GET /api/dashboard/stats — headline metric cards */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStats()));
    }

    /** GET /api/dashboard/appointments/today — today's appointments table */
    @GetMapping("/appointments/today")
    public ResponseEntity<ApiResponse<List<AppointmentSummaryDto>>> getTodayAppointments() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTodayAppointments()));
    }

    /** GET /api/dashboard/appointments/upcoming — upcoming appointments widget */
    @GetMapping("/appointments/upcoming")
    public ResponseEntity<ApiResponse<List<AppointmentSummaryDto>>> getUpcomingAppointments() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getUpcomingAppointments()));
    }

    /** GET /api/dashboard/chart/weekly — bar chart data */
    @GetMapping("/chart/weekly")
    public ResponseEntity<ApiResponse<WeeklyChartDto>> getWeeklyChart() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getWeeklyChart()));
    }
}
