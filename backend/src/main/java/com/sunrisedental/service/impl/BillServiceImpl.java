package com.sunrisedental.service.impl;

import com.sunrisedental.dto.AppointmentBillingInfo;
import com.sunrisedental.dto.BillRequest;
import com.sunrisedental.dto.BillResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.entity.Appointment;
import com.sunrisedental.entity.AppointmentStatus;
import com.sunrisedental.entity.Bill;
import com.sunrisedental.entity.PaymentStatus;
import com.sunrisedental.exception.ResourceNotFoundException;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.BillRepository;
import com.sunrisedental.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;

    private static final BigDecimal DEFAULT_CONSULTATION_FEE = new BigDecimal("1500.00");

    @Override
    @Transactional(readOnly = true)
    public AppointmentBillingInfo getAppointmentBillingInfo(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        AppointmentBillingInfo info = new AppointmentBillingInfo();
        info.setAppointmentId(appointment.getId());
        info.setAppointmentNumber(appointment.getAppointmentNumber());
        info.setPatientId(appointment.getPatient().getId());
        info.setPatientName(appointment.getPatient().getFullName());
        info.setPatientPhone(appointment.getPatient().getContactNumber());
        info.setPatientEmail(appointment.getPatient().getEmail());
        info.setDentistName(appointment.getDentist().getName());
        info.setTreatmentName(appointment.getTreatment().getName());
        info.setTreatmentCost(appointment.getTreatment().getStandardCost());
        info.setDefaultConsultationFee(DEFAULT_CONSULTATION_FEE);

        return info;
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse calculateBill(Long appointmentId, BigDecimal consultationFee) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        BigDecimal fee = consultationFee != null ? consultationFee : DEFAULT_CONSULTATION_FEE;
        BigDecimal cost = appointment.getTreatment().getStandardCost();
        BigDecimal subtotal = cost.add(fee);
        BigDecimal total = subtotal;

        BillResponse response = new BillResponse();
        response.setAppointmentId(appointment.getId());
        response.setAppointmentNumber(appointment.getAppointmentNumber());
        response.setPatientId(appointment.getPatient().getId());
        response.setPatientName(appointment.getPatient().getFullName());
        response.setPatientPhone(appointment.getPatient().getContactNumber());
        response.setPatientEmail(appointment.getPatient().getEmail());
        response.setDentistName(appointment.getDentist().getName());
        response.setDentistSpecialization(appointment.getDentist().getSpecialization());
        response.setTreatmentName(appointment.getTreatment().getName());
        response.setTreatmentCost(cost);
        response.setConsultationFee(fee);
        response.setSubtotal(subtotal);
        response.setTotal(total);
        
        return response;
    }

    @Override
    @Transactional
    public BillResponse saveBill(BillRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot generate a bill for a cancelled appointment.");
        }

        if (billRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new IllegalArgumentException("A bill has already been generated for this appointment.");
        }

        BigDecimal fee = request.getConsultationFee() != null ? request.getConsultationFee() : DEFAULT_CONSULTATION_FEE;
        BigDecimal cost = appointment.getTreatment().getStandardCost();
        BigDecimal subtotal = cost.add(fee);
        BigDecimal total = subtotal;

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(request.getPaymentStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid payment status: " + request.getPaymentStatus());
        }

        Bill bill = Bill.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .treatmentCost(cost)
                .consultationFee(fee)
                .subtotal(subtotal)
                .total(total)
                .paymentStatus(status)
                .receiptNumber("TEMP")
                .build();

        bill = billRepository.save(bill);

        // Generate sequential receipt number matching style of appointment numbers
        bill.setReceiptNumber("REC-" + (100000 + bill.getId()));
        bill = billRepository.save(bill);

        return toResponse(bill);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BillResponse> getAllBills(
            String search,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PaymentStatus paymentStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status string, ignore and don't filter by status
            }
        }

        Page<Bill> bills = billRepository.findFilteredAndSearched(search, paymentStatus, pageable);
        List<BillResponse> content = bills.map(this::toResponse).getContent();

        return new PagedResponse<>(
                content,
                bills.getNumber(),
                bills.getSize(),
                bills.getTotalElements(),
                bills.getTotalPages()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        return toResponse(bill);
    }

    private BillResponse toResponse(Bill bill) {
        BillResponse res = new BillResponse();
        res.setId(bill.getId());
        res.setReceiptNumber(bill.getReceiptNumber());
        res.setAppointmentId(bill.getAppointment().getId());
        res.setAppointmentNumber(bill.getAppointment().getAppointmentNumber());
        res.setPatientId(bill.getPatient().getId());
        res.setPatientName(bill.getPatient().getFullName());
        res.setPatientPhone(bill.getPatient().getContactNumber());
        res.setPatientEmail(bill.getPatient().getEmail());
        res.setDentistName(bill.getAppointment().getDentist().getName());
        res.setDentistSpecialization(bill.getAppointment().getDentist().getSpecialization());
        res.setTreatmentName(bill.getAppointment().getTreatment().getName());
        res.setTreatmentCost(bill.getTreatmentCost());
        res.setConsultationFee(bill.getConsultationFee());
        res.setSubtotal(bill.getSubtotal());
        res.setTotal(bill.getTotal());
        res.setPaymentStatus(bill.getPaymentStatus().name());
        res.setCreatedAt(bill.getCreatedAt());
        return res;
    }
}
