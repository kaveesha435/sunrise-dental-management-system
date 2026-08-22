package com.sunrisedental.service;

import com.sunrisedental.dto.DentistRequest;
import com.sunrisedental.dto.DentistResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.entity.AvailabilityStatus;

import java.util.List;

/**
 * Service interface for Dentist management operations.
 */
public interface DentistService {

    DentistResponse create(DentistRequest request);

    PagedResponse<DentistResponse> getAll(
            String search,
            String specialization,
            AvailabilityStatus status,
            Boolean active,
            int page,
            int size,
            String sortBy,
            String sortDir);

    DentistResponse getById(Long id);

    DentistResponse update(Long id, DentistRequest request);

    void delete(Long id);

    DentistSummary getSummary();

    List<String> getSpecializations();

    List<DentistResponse> getActiveDentists();

    record DentistSummary(
            long total,
            long available,
            long busy,
            long onLeave
    ) {}
}
