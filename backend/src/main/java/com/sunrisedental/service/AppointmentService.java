package com.sunrisedental.service;

import com.sunrisedental.dto.AppointmentRequest;
import com.sunrisedental.dto.AppointmentResponse;
import com.sunrisedental.dto.PagedResponse;

import java.time.LocalDate;
import java.time.LocalTime;

public interface AppointmentService {

    AppointmentResponse create(AppointmentRequest request);

    PagedResponse<AppointmentResponse> getAll(
            String search,
            LocalDate date,
            Long patientId,
            Long dentistId,
            Long treatmentId,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir);

    AppointmentResponse getById(Long id);

    AppointmentResponse update(Long id, AppointmentRequest request);

    AppointmentResponse cancel(Long id);

    boolean checkDentistAvailability(Long dentistId, LocalDate date, LocalTime time, Integer duration, Long excludeId);

    AppointmentSummary getSummary();

    record AppointmentSummary(
            long totalScheduled,
            long totalConfirmed,
            long totalPending,
            long totalCancelled
    ) {}
}
