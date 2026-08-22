package com.sunrisedental.controller;

import com.sunrisedental.dto.ApiResponse;
import com.sunrisedental.dto.DentistRequest;
import com.sunrisedental.dto.DentistResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.entity.AvailabilityStatus;
import com.sunrisedental.service.DentistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Dentist operations.
 */
@RestController
@RequestMapping("/api/dentists")
@RequiredArgsConstructor
public class DentistController {

    private final DentistService dentistService;

    @PostMapping
    public ResponseEntity<ApiResponse<DentistResponse>> create(
            @Valid @RequestBody DentistRequest request) {
        DentistResponse created = dentistService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dentist profile created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<DentistResponse>>> getAll(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String specialization,
            @RequestParam(required = false) AvailabilityStatus status,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<DentistResponse> result = dentistService.getAll(
                search, specialization, status, active, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DentistService.DentistSummary>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(dentistService.getSummary()));
    }

    @GetMapping("/specializations")
    public ResponseEntity<ApiResponse<List<String>>> getSpecializations() {
        return ResponseEntity.ok(ApiResponse.success(dentistService.getSpecializations()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DentistResponse>>> getActiveDentists() {
        return ResponseEntity.ok(ApiResponse.success(dentistService.getActiveDentists()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DentistResponse>> getById(@PathVariable Long id) {
        DentistResponse dentist = dentistService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(dentist));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DentistResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody DentistRequest request) {
        DentistResponse updated = dentistService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dentist profile updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        dentistService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Dentist profile deleted successfully", null));
    }
}
