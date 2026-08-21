package com.sunrisedental.service.impl;

import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.dto.PatientRequest;
import com.sunrisedental.dto.PatientResponse;
import com.sunrisedental.entity.Patient;
import com.sunrisedental.exception.ResourceNotFoundException;
import com.sunrisedental.repository.PatientRepository;
import com.sunrisedental.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PatientServiceImpl — concrete implementation of {@link PatientService}.
 *
 * Design decisions:
 *  - All entity ↔ DTO mapping is done here (no MapStruct to avoid extra deps)
 *  - Repository queries are selected based on which combination of
 *    search/status params are present to keep SQL efficient
 *  - Transactions are read-only on queries, read-write on mutations
 */
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    // -------------------------------------------------------
    // Create
    // -------------------------------------------------------

    @Override
    @Transactional
    public PatientResponse create(PatientRequest request) {
        Patient patient = toEntity(request);
        patient = patientRepository.save(patient);
        return toResponse(patient);
    }

    // -------------------------------------------------------
    // Read — list
    // -------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PatientResponse> getAll(
            String search, String status,
            int page, int size,
            String sortBy, String sortDir) {

        // Build sort — whitelist allowed fields to prevent injection
        String safeSortBy = allowedSortField(sortBy);
        Sort sort = "desc".equalsIgnoreCase(sortDir)
                ? Sort.by(safeSortBy).descending()
                : Sort.by(safeSortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null && !status.isBlank() && !status.equalsIgnoreCase("all");

        Page<Patient> resultPage;

        if (hasSearch && hasStatus) {
            resultPage = patientRepository.searchByStatus(status.toUpperCase(), search.trim(), pageable);
        } else if (hasSearch) {
            resultPage = patientRepository.search(search.trim(), pageable);
        } else if (hasStatus) {
            resultPage = patientRepository.findByStatus(status.toUpperCase(), pageable);
        } else {
            resultPage = patientRepository.findAll(pageable);
        }

        return new PagedResponse<>(
                resultPage.getContent().stream().map(this::toResponse).toList(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages()
        );
    }

    // -------------------------------------------------------
    // Read — single
    // -------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return toResponse(patient);
    }

    // -------------------------------------------------------
    // Update
    // -------------------------------------------------------

    @Override
    @Transactional
    public PatientResponse update(Long id, PatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        applyUpdates(patient, request);
        patient = patientRepository.save(patient);
        return toResponse(patient);
    }

    // -------------------------------------------------------
    // Delete
    // -------------------------------------------------------

    @Override
    @Transactional
    public void delete(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        patientRepository.delete(patient);
    }

    // -------------------------------------------------------
    // Duplicate check
    // -------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public boolean isDuplicateContact(String contactNumber, Long excludeId) {
        if (excludeId != null) {
            return patientRepository.existsByContactNumberAndIdNot(contactNumber, excludeId);
        }
        return patientRepository.existsByContactNumber(contactNumber);
    }

    // -------------------------------------------------------
    // Summary
    // -------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public PatientSummary getSummary() {
        long total    = patientRepository.count();
        long active   = patientRepository.countByStatus("ACTIVE");
        long inactive = patientRepository.countByStatus("INACTIVE");

        LocalDateTime now = LocalDateTime.now();
        long newThisMonth = patientRepository.countCreatedInMonth(now.getYear(), now.getMonthValue());

        return new PatientSummary(total, active, inactive, newThisMonth);
    }

    // -------------------------------------------------------
    // Private mapping helpers
    // -------------------------------------------------------

    /** Maps a {@link PatientRequest} to a new {@link Patient} entity. */
    private Patient toEntity(PatientRequest req) {
        return Patient.builder()
                .fullName(req.getFullName().trim())
                .dateOfBirth(req.getDateOfBirth())
                .gender(req.getGender())
                .contactNumber(req.getContactNumber().trim())
                .email(nullIfBlank(req.getEmail()))
                .address(req.getAddress().trim())
                .city(req.getCity().trim())
                .postalCode(req.getPostalCode().trim())
                .emergencyContact(nullIfBlank(req.getEmergencyContact()))
                .notes(nullIfBlank(req.getNotes()))
                .status(req.getStatus() != null ? req.getStatus() : "ACTIVE")
                .build();
    }

    /** Applies all mutable fields from a request onto an existing entity. */
    private void applyUpdates(Patient patient, PatientRequest req) {
        patient.setFullName(req.getFullName().trim());
        patient.setDateOfBirth(req.getDateOfBirth());
        patient.setGender(req.getGender());
        patient.setContactNumber(req.getContactNumber().trim());
        patient.setEmail(nullIfBlank(req.getEmail()));
        patient.setAddress(req.getAddress().trim());
        patient.setCity(req.getCity().trim());
        patient.setPostalCode(req.getPostalCode().trim());
        patient.setEmergencyContact(nullIfBlank(req.getEmergencyContact()));
        patient.setNotes(nullIfBlank(req.getNotes()));
        if (req.getStatus() != null) {
            patient.setStatus(req.getStatus());
        }
    }

    /** Maps a {@link Patient} entity to a {@link PatientResponse} DTO. */
    private PatientResponse toResponse(Patient p) {
        PatientResponse r = new PatientResponse();
        r.setId(p.getId());
        r.setFullName(p.getFullName());
        r.setDateOfBirth(p.getDateOfBirth());   // setter also computes age
        r.setGender(p.getGender());
        r.setContactNumber(p.getContactNumber());
        r.setEmail(p.getEmail());
        r.setAddress(p.getAddress());
        r.setCity(p.getCity());
        r.setPostalCode(p.getPostalCode());
        r.setEmergencyContact(p.getEmergencyContact());
        r.setNotes(p.getNotes());
        r.setStatus(p.getStatus());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        return r;
    }

    /**
     * Whitelists sort fields to prevent HQL injection via sort param.
     * Defaults to createdAt if an unrecognised field is supplied.
     */
    private String allowedSortField(String sortBy) {
        return switch (sortBy == null ? "" : sortBy) {
            case "fullName"    -> "fullName";
            case "dateOfBirth" -> "dateOfBirth";
            case "city"        -> "city";
            case "status"      -> "status";
            default            -> "createdAt";
        };
    }

    /** Returns null for blank/empty strings so nullable columns stay null. */
    private static String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
