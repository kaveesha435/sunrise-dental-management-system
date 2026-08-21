package com.sunrisedental.service.impl;

import com.sunrisedental.dto.AppointmentRequest;
import com.sunrisedental.dto.AppointmentResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.entity.Appointment;
import com.sunrisedental.entity.AppointmentStatus;
import com.sunrisedental.entity.Patient;
import com.sunrisedental.exception.ResourceNotFoundException;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.PatientRepository;
import com.sunrisedental.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public AppointmentResponse create(AppointmentRequest request) {
        // 1. Fetch Patient
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        // 2. Validate Date and Time (must be in the future)
        validateDateTimeInFuture(request.getAppointmentDate(), request.getAppointmentTime());

        // 3. Check Dentist Double Booking
        checkDentistDoubleBooking(request.getDentist(), request.getAppointmentDate(),
                request.getAppointmentTime(), request.getDuration(), null);

        // 4. Check Patient Conflict
        checkPatientConflict(request.getPatientId(), request.getAppointmentDate(),
                request.getAppointmentTime(), request.getDuration(), null);

        // 5. Build and Save first to get auto-increment ID
        AppointmentStatus initialStatus = AppointmentStatus.SCHEDULED;
        if (request.getStatus() != null) {
            try {
                initialStatus = AppointmentStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid appointment status: " + request.getStatus());
            }
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .dentist(request.getDentist())
                .treatment(request.getTreatment())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .duration(request.getDuration())
                .status(initialStatus)
                .notes(request.getNotes())
                .appointmentNumber("TEMP")
                .build();

        appointment = appointmentRepository.save(appointment);

        // Update appointment number sequentially
        appointment.setAppointmentNumber("APT-" + (10000 + appointment.getId()));
        appointment = appointmentRepository.save(appointment);

        return toResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getAll(
            String search,
            LocalDate date,
            Long patientId,
            String dentist,
            String treatment,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        AppointmentStatus apptStatus = null;
        if (status != null && !status.trim().isEmpty() && !"all".equalsIgnoreCase(status)) {
            try {
                apptStatus = AppointmentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore or propagate
            }
        }

        Page<Appointment> resultPage = appointmentRepository.findFilteredAndSearched(
                search, date, patientId, dentist, treatment, apptStatus, pageable);

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
    public AppointmentResponse getById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return toResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse update(Long id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        // Validate Date and Time (must be in the future)
        validateDateTimeInFuture(request.getAppointmentDate(), request.getAppointmentTime());

        // Check Dentist Double Booking
        checkDentistDoubleBooking(request.getDentist(), request.getAppointmentDate(),
                request.getAppointmentTime(), request.getDuration(), id);

        // Check Patient Conflict
        checkPatientConflict(request.getPatientId(), request.getAppointmentDate(),
                request.getAppointmentTime(), request.getDuration(), id);

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        appointment.setPatient(patient);
        appointment.setDentist(request.getDentist());
        appointment.setTreatment(request.getTreatment());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setDuration(request.getDuration());
        appointment.setNotes(request.getNotes());

        if (request.getStatus() != null) {
            try {
                appointment.setStatus(AppointmentStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid appointment status: " + request.getStatus());
            }
        }

        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse cancel(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkDentistAvailability(
            String dentist, LocalDate date, LocalTime time, Integer duration, Long excludeId) {
        try {
            checkDentistDoubleBooking(dentist, date, time, duration, excludeId);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentSummary getSummary() {
        long scheduled = appointmentRepository.countByStatus(AppointmentStatus.SCHEDULED);
        long confirmed = appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED);
        long pending   = appointmentRepository.countByStatus(AppointmentStatus.PENDING);
        long cancelled = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);

        return new AppointmentSummary(scheduled, confirmed, pending, cancelled);
    }

    // Validation helpers

    private void validateDateTimeInFuture(LocalDate date, LocalTime time) {
        LocalDateTime appointmentDateTime = LocalDateTime.of(date, time);
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Appointment date and time must be in the future.");
        }
    }

    private void checkDentistDoubleBooking(
            String dentist, LocalDate date, LocalTime time, Integer duration, Long excludeId) {

        List<Appointment> existing = appointmentRepository
                .findByDentistAndAppointmentDateAndStatusNot(dentist, date, AppointmentStatus.CANCELLED);

        LocalTime newStart = time;
        LocalTime newEnd = newStart.plusMinutes(duration);

        for (Appointment appt : existing) {
            if (excludeId != null && appt.getId().equals(excludeId)) {
                continue;
            }
            LocalTime start = appt.getAppointmentTime();
            LocalTime end = start.plusMinutes(appt.getDuration());

            if (newStart.isBefore(end) && newEnd.isAfter(start)) {
                throw new IllegalArgumentException(String.format(
                        "Dentist %s is already booked between %s and %s on this date.",
                        dentist, start, end));
            }
        }
    }

    private void checkPatientConflict(
            Long patientId, LocalDate date, LocalTime time, Integer duration, Long excludeId) {

        List<Appointment> existing = appointmentRepository
                .findByPatientIdAndAppointmentDateAndStatusNot(patientId, date, AppointmentStatus.CANCELLED);

        LocalTime newStart = time;
        LocalTime newEnd = newStart.plusMinutes(duration);

        for (Appointment appt : existing) {
            if (excludeId != null && appt.getId().equals(excludeId)) {
                continue;
            }
            LocalTime start = appt.getAppointmentTime();
            LocalTime end = start.plusMinutes(appt.getDuration());

            if (newStart.isBefore(end) && newEnd.isAfter(start)) {
                throw new IllegalArgumentException(String.format(
                        "Patient already has an appointment between %s and %s on this date.",
                        start, end));
            }
        }
    }

    private AppointmentResponse toResponse(Appointment appt) {
        AppointmentResponse res = new AppointmentResponse();
        res.setId(appt.getId());
        res.setAppointmentNumber(appt.getAppointmentNumber());
        res.setPatientId(appt.getPatient().getId());
        res.setPatientName(appt.getPatient().getFullName());
        res.setPatientPhone(appt.getPatient().getContactNumber());
        res.setPatientEmail(appt.getPatient().getEmail());
        res.setDentist(appt.getDentist());
        res.setTreatment(appt.getTreatment());
        res.setAppointmentDate(appt.getAppointmentDate());
        res.setAppointmentTime(appt.getAppointmentTime());
        res.setDuration(appt.getDuration());
        res.setStatus(appt.getStatus());
        res.setNotes(appt.getNotes());
        res.setCreatedAt(appt.getCreatedAt());
        res.setUpdatedAt(appt.getUpdatedAt());
        return res;
    }
}
