package com.sunrisedental.controller;

import com.sunrisedental.dto.ApiResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.dto.TreatmentRequest;
import com.sunrisedental.dto.TreatmentResponse;
import com.sunrisedental.service.TreatmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Treatment catalog operations.
 */
@RestController
@RequestMapping("/api/treatments")
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentService treatmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<TreatmentResponse>> create(
            @Valid @RequestBody TreatmentRequest request) {
        TreatmentResponse created = treatmentService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Treatment created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TreatmentResponse>>> getAll(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<TreatmentResponse> result = treatmentService.getAll(
                search, active, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<TreatmentService.TreatmentSummary>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(treatmentService.getSummary()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TreatmentResponse>>> getActiveTreatments() {
        return ResponseEntity.ok(ApiResponse.success(treatmentService.getActiveTreatments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TreatmentResponse>> getById(@PathVariable Long id) {
        TreatmentResponse treatment = treatmentService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(treatment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TreatmentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TreatmentRequest request) {
        TreatmentResponse updated = treatmentService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Treatment updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        treatmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Treatment deleted successfully", null));
    }
}
