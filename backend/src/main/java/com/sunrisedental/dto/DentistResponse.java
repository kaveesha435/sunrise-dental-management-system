package com.sunrisedental.dto;

import com.sunrisedental.entity.AvailabilityStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Response DTO for Dentist operations.
 */
@Getter
@Setter
public class DentistResponse {

    private Long id;
    private String name;
    private String specialization;
    private String contact;
    private String email;
    private AvailabilityStatus availabilityStatus;
    private boolean active;
    private long todayAppointmentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
