package com.sunrisedental.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * Request DTO for creating or updating a bill.
 */
public class BillRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @DecimalMin(value = "0.0", message = "Consultation fee must be a positive number or zero")
    private BigDecimal consultationFee;

    @NotNull(message = "Payment status is required")
    @Pattern(regexp = "PAID|PENDING|CANCELLED", message = "Invalid payment status. Must be PAID, PENDING, or CANCELLED")
    private String paymentStatus;

    // Getters and Setters

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
