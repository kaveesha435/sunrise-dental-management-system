package com.sunrisedental.dto;

import jakarta.validation.constraints.*;

/**
 * PatientRequest — DTO for create and update patient operations.
 *
 * Bean Validation constraints are applied here so the controller can use
 * {@code @Valid} to trigger validation automatically. The entity is never
 * exposed to API consumers.
 *
 * Constraint summary:
 *  - fullName:        required, 2–100 chars
 *  - dateOfBirth:     required, must be in the past
 *  - gender:          required, one of MALE/FEMALE/OTHER
 *  - contactNumber:   required, Sri Lankan format (10 digits or +94 followed by 9 digits)
 *  - email:           optional, valid email if provided, max 100 chars
 *  - address:         required, 5–200 chars
 *  - city:            required, 2–100 chars
 *  - postalCode:      required, 4–10 chars
 *  - emergencyContact: optional, max 150 chars
 *  - notes:           optional, max 1000 chars
 *  - status:          optional, defaults to ACTIVE in entity; if provided must be ACTIVE or INACTIVE
 */
public class PatientRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private java.time.LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Pattern(
            regexp = "MALE|FEMALE|OTHER",
            message = "Gender must be MALE, FEMALE, or OTHER"
    )
    private String gender;

    @NotBlank(message = "Contact number is required")
    @Pattern(
            regexp = "^(\\+94|0)[0-9]{9}$",
            message = "Contact number must be a valid Sri Lankan phone number (e.g. 0771234567 or +94771234567)"
    )
    private String contactNumber;

    @Email(message = "Email must be a valid email address")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    private String city;

    @NotBlank(message = "Postal code is required")
    @Size(min = 4, max = 10, message = "Postal code must be between 4 and 10 characters")
    private String postalCode;

    @Size(max = 150, message = "Emergency contact must not exceed 150 characters")
    private String emergencyContact;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Pattern(
            regexp = "ACTIVE|INACTIVE",
            message = "Status must be ACTIVE or INACTIVE"
    )
    private String status;

    // -------------------------------------------------------
    // Getters / Setters (manual — no Lombok to keep DTO
    // free of annotation processor dependencies in tests)
    // -------------------------------------------------------

    public String getFullName()             { return fullName; }
    public void   setFullName(String v)     { fullName = v; }

    public java.time.LocalDate getDateOfBirth()              { return dateOfBirth; }
    public void                setDateOfBirth(java.time.LocalDate v) { dateOfBirth = v; }

    public String getGender()               { return gender; }
    public void   setGender(String v)       { gender = v; }

    public String getContactNumber()        { return contactNumber; }
    public void   setContactNumber(String v){ contactNumber = v; }

    public String getEmail()                { return email; }
    public void   setEmail(String v)        { email = v; }

    public String getAddress()              { return address; }
    public void   setAddress(String v)      { address = v; }

    public String getCity()                 { return city; }
    public void   setCity(String v)         { city = v; }

    public String getPostalCode()           { return postalCode; }
    public void   setPostalCode(String v)   { postalCode = v; }

    public String getEmergencyContact()     { return emergencyContact; }
    public void   setEmergencyContact(String v) { emergencyContact = v; }

    public String getNotes()                { return notes; }
    public void   setNotes(String v)        { notes = v; }

    public String getStatus()               { return status; }
    public void   setStatus(String v)       { status = v; }
}
