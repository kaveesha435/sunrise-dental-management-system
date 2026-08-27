package com.sunrisedental.controller;

import com.sunrisedental.dto.ApiResponse;
import com.sunrisedental.dto.AppointmentRequest;
import com.sunrisedental.dto.AppointmentResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> create(
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse created = appointmentService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment scheduled successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getAll(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long dentistId,
            @RequestParam(required = false) Long treatmentId,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<AppointmentResponse> result = appointmentService.getAll(
                search, date, patientId, dentistId, treatmentId, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse updated = appointmentService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", updated));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(@PathVariable Long id) {
        AppointmentResponse cancelled = appointmentService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", cancelled));
    }

    @GetMapping("/dentist-availability")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @RequestParam Long dentistId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam Integer duration,
            @RequestParam(required = false) Long excludeId) {

        boolean isAvailable = appointmentService.checkDentistAvailability(dentistId, date, time, duration, excludeId);
        return ResponseEntity.ok(ApiResponse.success(isAvailable));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AppointmentService.AppointmentSummary>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getSummary()));
    }
}
