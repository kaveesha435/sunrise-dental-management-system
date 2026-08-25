package com.sunrisedental.dto;

import java.math.BigDecimal;

/**
 * DTO for retrieving appointment billing details prior to saving.
 */
public class AppointmentBillingInfo {

    private Long appointmentId;
    private String appointmentNumber;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;
    private String dentistName;
    private String treatmentName;
    private BigDecimal treatmentCost;
    private BigDecimal defaultConsultationFee;

    // Getters and Setters

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getAppointmentNumber() { return appointmentNumber; }
    public void setAppointmentNumber(String appointmentNumber) { this.appointmentNumber = appointmentNumber; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getDentistName() { return dentistName; }
    public void setDentistName(String dentistName) { this.dentistName = dentistName; }

    public String getTreatmentName() { return treatmentName; }
    public void setTreatmentName(String treatmentName) { this.treatmentName = treatmentName; }

    public BigDecimal getTreatmentCost() { return treatmentCost; }
    public void setTreatmentCost(BigDecimal treatmentCost) { this.treatmentCost = treatmentCost; }

    public BigDecimal getDefaultConsultationFee() { return defaultConsultationFee; }
    public void setDefaultConsultationFee(BigDecimal defaultConsultationFee) { this.defaultConsultationFee = defaultConsultationFee; }
}
