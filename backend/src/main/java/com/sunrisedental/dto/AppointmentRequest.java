package com.sunrisedental.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Appointment request DTO for scheduling or updating appointments.
 */
public class AppointmentRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Dentist is required")
    @Size(max = 100, message = "Dentist name must not exceed 100 characters")
    private String dentist;

    @NotBlank(message = "Treatment is required")
    @Size(max = 100, message = "Treatment name must not exceed 100 characters")
    private String treatment;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date must be today or in the future")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    @NotNull(message = "Duration is required")
    @Min(value = 10, message = "Duration must be at least 10 minutes")
    @Max(value = 480, message = "Duration cannot exceed 480 minutes")
    private Integer duration;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    @Pattern(regexp = "SCHEDULED|CONFIRMED|COMPLETED|PENDING|CANCELLED", message = "Invalid status")
    private String status;

    // Getters and Setters

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getDentist() { return dentist; }
    public void setDentist(String dentist) { this.dentist = dentist; }

    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
