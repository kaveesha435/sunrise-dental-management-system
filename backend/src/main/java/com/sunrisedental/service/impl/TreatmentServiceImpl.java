package com.sunrisedental.service.impl;

import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.dto.TreatmentRequest;
import com.sunrisedental.dto.TreatmentResponse;
import com.sunrisedental.entity.Treatment;
import com.sunrisedental.exception.BusinessConflictException;
import com.sunrisedental.exception.ResourceNotFoundException;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.TreatmentRepository;
import com.sunrisedental.service.TreatmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TreatmentServiceImpl implements TreatmentService {

    private final TreatmentRepository treatmentRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public TreatmentResponse create(TreatmentRequest request) {
        // Enforce non-negative price
        if (request.getStandardCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Standard cost cannot be a negative amount.");
        }

        // Treatment names are unique in the catalogue — reject duplicates with a
        // clear 409 instead of letting the DB constraint surface as a 500.
        if (treatmentRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BusinessConflictException(
                    "A treatment named '" + request.getName().trim() + "' already exists in the catalogue.");
        }

        Treatment treatment = toEntity(request);
        treatment = treatmentRepository.save(treatment);
        return toResponse(treatment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TreatmentResponse> getAll(
            String search,
            Boolean active,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        String safeSortBy = allowedSortField(sortBy);
        Sort sort = "desc".equalsIgnoreCase(sortDir)
                ? Sort.by(safeSortBy).descending()
                : Sort.by(safeSortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Treatment> resultPage = treatmentRepository.findFilteredAndSearched(
                search != null ? search.trim() : null,
                active,
                pageable);

        return new PagedResponse<>(
                resultPage.getContent().stream().map(this::toResponse).toList(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentResponse getById(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment", "id", id));
        return toResponse(treatment);
    }

    @Override
    @Transactional
    public TreatmentResponse update(Long id, TreatmentRequest request) {
        if (request.getStandardCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Standard cost cannot be a negative amount.");
        }

        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment", "id", id));

        if (treatmentRepository.existsByNameIgnoreCaseAndIdNot(request.getName().trim(), id)) {
            throw new BusinessConflictException(
                    "A treatment named '" + request.getName().trim() + "' already exists in the catalogue.");
        }

        applyUpdates(treatment, request);
        treatment = treatmentRepository.save(treatment);
        return toResponse(treatment);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment", "id", id));

        if (appointmentRepository.existsByTreatmentId(id)) {
            throw new IllegalArgumentException("Cannot delete treatment as it is referenced in clinic appointments.");
        }

        treatmentRepository.delete(treatment);
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentSummary getSummary() {
        long total = treatmentRepository.count();
        long active = treatmentRepository.countByActiveTrue();
        long inactive = treatmentRepository.countByActiveFalse();

        List<Treatment> all = treatmentRepository.findAll();
        double avg = 0.0;
        if (!all.isEmpty()) {
            BigDecimal sum = BigDecimal.ZERO;
            for (Treatment t : all) {
                sum = sum.add(t.getStandardCost());
            }
            avg = sum.divide(BigDecimal.valueOf(all.size()), 2, RoundingMode.HALF_UP).doubleValue();
        }

        return new TreatmentSummary(total, active, inactive, avg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreatmentResponse> getActiveTreatments() {
        return treatmentRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    // Helper mappings

    private Treatment toEntity(TreatmentRequest req) {
        return Treatment.builder()
                .name(req.getName().trim())
                .description(req.getDescription().trim())
                .standardCost(req.getStandardCost())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
    }

    private void applyUpdates(Treatment treatment, TreatmentRequest req) {
        treatment.setName(req.getName().trim());
        treatment.setDescription(req.getDescription().trim());
        treatment.setStandardCost(req.getStandardCost());
        if (req.getActive() != null) {
            treatment.setActive(req.getActive());
        }
    }

    private TreatmentResponse toResponse(Treatment t) {
        TreatmentResponse res = new TreatmentResponse();
        res.setId(t.getId());
        res.setName(t.getName());
        res.setDescription(t.getDescription());
        res.setStandardCost(t.getStandardCost());
        res.setActive(t.isActive());
        res.setCreatedAt(t.getCreatedAt());
        res.setUpdatedAt(t.getUpdatedAt());
        return res;
    }

    private String allowedSortField(String sortBy) {
        return switch (sortBy == null ? "" : sortBy) {
            case "name" -> "name";
            case "standardCost" -> "standardCost";
            case "active" -> "active";
            default -> "createdAt";
        };
    }
}
