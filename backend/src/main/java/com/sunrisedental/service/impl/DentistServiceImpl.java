package com.sunrisedental.service.impl;

import com.sunrisedental.dto.DentistRequest;
import com.sunrisedental.dto.DentistResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.entity.AppointmentStatus;
import com.sunrisedental.entity.AvailabilityStatus;
import com.sunrisedental.entity.Dentist;
import com.sunrisedental.exception.ResourceNotFoundException;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.DentistRepository;
import com.sunrisedental.service.DentistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DentistServiceImpl implements DentistService {

    private final DentistRepository dentistRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public DentistResponse create(DentistRequest request) {
        Dentist dentist = toEntity(request);
        dentist = dentistRepository.save(dentist);
        return toResponse(dentist);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DentistResponse> getAll(
            String search,
            String specialization,
            AvailabilityStatus status,
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

        Page<Dentist> resultPage = dentistRepository.findFilteredAndSearched(
                search != null ? search.trim() : null,
                specialization != null ? specialization.trim() : null,
                status,
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
    public DentistResponse getById(Long id) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", id));
        return toResponse(dentist);
    }

    @Override
    @Transactional
    public DentistResponse update(Long id, DentistRequest request) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", id));

        applyUpdates(dentist, request);
        dentist = dentistRepository.save(dentist);
        return toResponse(dentist);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", id));

        if (appointmentRepository.existsByDentistId(id)) {
            throw new IllegalArgumentException("Cannot delete dentist as they have appointments scheduled in the clinic.");
        }

        dentistRepository.delete(dentist);
    }

    @Override
    @Transactional(readOnly = true)
    public DentistSummary getSummary() {
        long total = dentistRepository.count();
        long available = dentistRepository.countByAvailabilityStatusAndActiveTrue(AvailabilityStatus.AVAILABLE);
        long busy = dentistRepository.countByAvailabilityStatusAndActiveTrue(AvailabilityStatus.BUSY);
        long onLeave = dentistRepository.countByAvailabilityStatusAndActiveTrue(AvailabilityStatus.ON_LEAVE);

        return new DentistSummary(total, available, busy, onLeave);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getSpecializations() {
        return dentistRepository.findActiveSpecializations();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DentistResponse> getActiveDentists() {
        return dentistRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    // Helper mappings

    private Dentist toEntity(DentistRequest req) {
        return Dentist.builder()
                .name(req.getName().trim())
                .specialization(req.getSpecialization().trim())
                .contact(req.getContact().trim())
                .email(nullIfBlank(req.getEmail()))
                .availabilityStatus(req.getAvailabilityStatus())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
    }

    private void applyUpdates(Dentist dentist, DentistRequest req) {
        dentist.setName(req.getName().trim());
        dentist.setSpecialization(req.getSpecialization().trim());
        dentist.setContact(req.getContact().trim());
        dentist.setEmail(nullIfBlank(req.getEmail()));
        dentist.setAvailabilityStatus(req.getAvailabilityStatus());
        if (req.getActive() != null) {
            dentist.setActive(req.getActive());
        }
    }

    private DentistResponse toResponse(Dentist d) {
        DentistResponse res = new DentistResponse();
        res.setId(d.getId());
        res.setName(d.getName());
        res.setSpecialization(d.getSpecialization());
        res.setContact(d.getContact());
        res.setEmail(d.getEmail());
        res.setAvailabilityStatus(d.getAvailabilityStatus());
        res.setActive(d.isActive());
        res.setCreatedAt(d.getCreatedAt());
        res.setUpdatedAt(d.getUpdatedAt());

        // Count appointments today
        long todayAppts = appointmentRepository.countByDentistIdAndAppointmentDateAndStatusNot(
                d.getId(), LocalDate.now(), AppointmentStatus.CANCELLED);
        res.setTodayAppointmentCount(todayAppts);

        return res;
    }

    private String allowedSortField(String sortBy) {
        return switch (sortBy == null ? "" : sortBy) {
            case "name" -> "name";
            case "specialization" -> "specialization";
            case "availabilityStatus" -> "availabilityStatus";
            case "active" -> "active";
            default -> "createdAt";
        };
    }

    private static String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
