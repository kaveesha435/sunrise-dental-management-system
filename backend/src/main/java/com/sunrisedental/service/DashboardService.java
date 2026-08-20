package com.sunrisedental.service;

import com.sunrisedental.dto.AppointmentSummaryDto;
import com.sunrisedental.dto.DashboardStatsDto;
import com.sunrisedental.dto.WeeklyChartDto;

import java.util.List;

/**
 * Dashboard data service contract.
 * Each method maps to one section of the dashboard UI.
 */
public interface DashboardService {

    /** Headline statistics displayed in the 4 stat cards. */
    DashboardStatsDto getStats();

    /** Appointments list for the Today's Appointments table. */
    List<AppointmentSummaryDto> getTodayAppointments();

    /** Short list of upcoming appointments for the sidebar widget. */
    List<AppointmentSummaryDto> getUpcomingAppointments();

    /** Weekly appointment counts for the bar chart. */
    WeeklyChartDto getWeeklyChart();
}
