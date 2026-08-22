package com.sunrisedental.service;

import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.dto.TreatmentRequest;
import com.sunrisedental.dto.TreatmentResponse;

import java.util.List;

/**
 * Service interface for Treatment procedures catalog.
 */
public interface TreatmentService {

    TreatmentResponse create(TreatmentRequest request);

    PagedResponse<TreatmentResponse> getAll(
            String search,
            Boolean active,
            int page,
            int size,
            String sortBy,
            String sortDir);

    TreatmentResponse getById(Long id);

    TreatmentResponse update(Long id, TreatmentRequest request);

    void delete(Long id);

    TreatmentSummary getSummary();

    List<TreatmentResponse> getActiveTreatments();

    record TreatmentSummary(
            long total,
            long active,
            long inactive,
            double averagePrice
    ) {}
}
