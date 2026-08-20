package com.sunrisedental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Weekly appointment chart data for the dashboard bar chart.
 * {@code labels} and {@code appointments} are parallel arrays.
 *
 * TODO (Commit 04): Replace stub data with GROUP BY date aggregation query.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyChartDto {

    /** Day labels, e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] */
    private List<String> labels;

    /** Appointment count per day, parallel to {@code labels}. */
    private List<Integer> appointments;
}
