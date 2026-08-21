package com.sunrisedental.controller;

import com.sunrisedental.dto.ApiResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.dto.PatientRequest;
import com.sunrisedental.dto.PatientResponse;
import com.sunrisedental.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * PatientController — REST endpoints for patient management.
 *
 * Base path: /api/patients
 *
 * All responses use the project-standard {@link ApiResponse} wrapper
 * so the frontend always sees a consistent JSON shape.
 *
 * Endpoints:
 *   POST   /api/patients                   Create patient
 *   GET    /api/patients                   List patients (paginated, searchable, filterable)
 *   GET    /api/patients/{id}              Get patient by ID
 *   PUT    /api/patients/{id}              Update patient
 *   DELETE /api/patients/{id}              Delete patient
 *   GET    /api/patients/summary           Summary counts for stat cards
 *   GET    /api/patients/check-duplicate   Duplicate contact check (used by frontend)
 */
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    // -------------------------------------------------------
    // POST /api/patients — Create
    // -------------------------------------------------------

    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponse>> create(
            @Valid @RequestBody PatientRequest request) {

        PatientResponse created = patientService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered successfully", created));
    }

    // -------------------------------------------------------
    // GET /api/patients — List (paged + searchable)
    // -------------------------------------------------------

    /**
     * @param search  searches patient name, contact number, or patient ID
     * @param status  ACTIVE | INACTIVE | all (default: all)
     * @param page    0-indexed page number (default: 0)
     * @param size    items per page (default: 10, max: 100)
     * @param sortBy  field to sort by: fullName | dateOfBirth | city | status | createdAt
     * @param sortDir asc | desc (default: desc)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PatientResponse>>> getAll(
            @RequestParam(defaultValue = "")     String search,
            @RequestParam(defaultValue = "")     String status,
            @RequestParam(defaultValue = "0")    int    page,
            @RequestParam(defaultValue = "10")   int    size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        // Clamp page size to prevent large dumps
        int safeSize = Math.min(size, 100);

        PagedResponse<PatientResponse> result =
                patientService.getAll(search, status, page, safeSize, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // -------------------------------------------------------
    // GET /api/patients/summary — Stat card counts
    // -------------------------------------------------------

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PatientService.PatientSummary>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getSummary()));
    }

    // -------------------------------------------------------
    // GET /api/patients/check-duplicate — Duplicate contact check
    // -------------------------------------------------------

    /**
     * Returns {@code {"data": true}} if a patient with this contact number
     * already exists (optionally excluding a patient by ID for update scenarios).
     *
     * @param contact   contact number to check
     * @param excludeId patient ID to exclude (omit for new-patient check)
     */
    @GetMapping("/check-duplicate")
    public ResponseEntity<ApiResponse<Boolean>> checkDuplicate(
            @RequestParam String contact,
            @RequestParam(required = false) Long excludeId) {

        boolean isDuplicate = patientService.isDuplicateContact(contact, excludeId);
        return ResponseEntity.ok(ApiResponse.success(isDuplicate));
    }

    // -------------------------------------------------------
    // GET /api/patients/{id} — Get by ID
    // -------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> getById(@PathVariable Long id) {
        PatientResponse patient = patientService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    // -------------------------------------------------------
    // PUT /api/patients/{id} — Update
    // -------------------------------------------------------

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request) {

        PatientResponse updated = patientService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", updated));
    }

    // -------------------------------------------------------
    // DELETE /api/patients/{id} — Delete
    // -------------------------------------------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully", null));
    }
}
