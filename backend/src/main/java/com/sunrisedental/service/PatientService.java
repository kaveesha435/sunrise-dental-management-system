package com.sunrisedental.service;

import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.dto.PatientRequest;
import com.sunrisedental.dto.PatientResponse;

/**
 * PatientService — defines the contract for patient management operations.
 *
 * Implementations must:
 *  - Map between {@link PatientRequest}/{@link PatientResponse} and the entity layer
 *  - Never expose JPA entities to the controller layer
 *  - Apply pagination for all list operations
 */
public interface PatientService {

    /**
     * Creates a new patient record.
     *
     * @param request validated patient data
     * @return the created patient as a response DTO
     */
    PatientResponse create(PatientRequest request);

    /**
     * Returns a paginated, optionally filtered and searched list of patients.
     *
     * @param search   search term for name / contact / ID (empty = no filter)
     * @param status   status filter: "ACTIVE", "INACTIVE", or null/empty for all
     * @param page     0-indexed page number
     * @param size     page size
     * @param sortBy   field name to sort by (e.g. "fullName", "createdAt")
     * @param sortDir  "asc" or "desc"
     * @return paged response wrapper
     */
    PagedResponse<PatientResponse> getAll(
            String search, String status,
            int page, int size,
            String sortBy, String sortDir);

    /**
     * Returns a single patient by ID.
     *
     * @throws com.sunrisedental.exception.ResourceNotFoundException if not found
     */
    PatientResponse getById(Long id);

    /**
     * Updates an existing patient record.
     *
     * @param id      patient ID
     * @param request new data (all fields replaced)
     * @return updated patient as a response DTO
     * @throws com.sunrisedental.exception.ResourceNotFoundException if not found
     */
    PatientResponse update(Long id, PatientRequest request);

    /**
     * Deletes a patient record permanently.
     *
     * @throws com.sunrisedental.exception.ResourceNotFoundException if not found
     */
    void delete(Long id);

    /**
     * Checks whether a patient with the given contact number already exists,
     * optionally excluding a specific patient ID (used for update duplicate check).
     *
     * @param contactNumber the phone number to check
     * @param excludeId     patient ID to exclude (null for new-patient check)
     * @return true if a duplicate exists
     */
    boolean isDuplicateContact(String contactNumber, Long excludeId);

    /**
     * Returns summary counts used by the patient list page stat cards.
     */
    PatientSummary getSummary();

    /**
     * Lightweight summary DTO for patient stat cards.
     */
    record PatientSummary(
            long total,
            long active,
            long inactive,
            long newThisMonth
    ) {}
}
