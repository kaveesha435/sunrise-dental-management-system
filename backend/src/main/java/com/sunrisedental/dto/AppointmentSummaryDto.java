package com.sunrisedental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight appointment projection used on the dashboard —
 * today's appointments table and upcoming appointments list.
 *
 * TODO (Commit 04): Replace stub data with real Appointment entity projections.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSummaryDto {

    private Long id;

    /** Patient full name. */
    private String patientName;

    /** Dentist full name. */
    private String dentistName;

    /** Formatted time, e.g. "09:30 AM". */
    private String time;

    /** Treatment name. */
    private String treatment;

    /** Status string: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED. */
    private String status;
}
