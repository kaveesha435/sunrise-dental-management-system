package com.sunrisedental.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

/**
 * PatientResponse — read-only DTO returned by all patient API endpoints.
 *
 * The {@code age} field is derived from {@code dateOfBirth} on construction —
 * it is never stored in the database.
 *
 * This class deliberately does NOT use Lombok so that no annotation processing
 * is required when this DTO is used in test code.
 */
public class PatientResponse {

    private Long          id;
    private String        fullName;
    private LocalDate     dateOfBirth;
    private Integer       age;           // computed, not stored
    private String        gender;
    private String        contactNumber;
    private String        email;
    private String        address;
    private String        city;
    private String        postalCode;
    private String        emergencyContact;
    private String        notes;
    private String        status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PatientResponse() {}

    // -------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------

    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }

    public String getFullName()                { return fullName; }
    public void   setFullName(String v)        { fullName = v; }

    public LocalDate getDateOfBirth()          { return dateOfBirth; }
    public void      setDateOfBirth(LocalDate v) {
        dateOfBirth = v;
        age = (v != null) ? Period.between(v, LocalDate.now()).getYears() : null;
    }

    public Integer getAge()                    { return age; }

    public String getGender()                  { return gender; }
    public void   setGender(String v)          { gender = v; }

    public String getContactNumber()           { return contactNumber; }
    public void   setContactNumber(String v)   { contactNumber = v; }

    public String getEmail()                   { return email; }
    public void   setEmail(String v)           { email = v; }

    public String getAddress()                 { return address; }
    public void   setAddress(String v)         { address = v; }

    public String getCity()                    { return city; }
    public void   setCity(String v)            { city = v; }

    public String getPostalCode()              { return postalCode; }
    public void   setPostalCode(String v)      { postalCode = v; }

    public String getEmergencyContact()        { return emergencyContact; }
    public void   setEmergencyContact(String v){ emergencyContact = v; }

    public String getNotes()                   { return notes; }
    public void   setNotes(String v)           { notes = v; }

    public String getStatus()                  { return status; }
    public void   setStatus(String v)          { status = v; }

    public LocalDateTime getCreatedAt()        { return createdAt; }
    public void          setCreatedAt(LocalDateTime v) { createdAt = v; }

    public LocalDateTime getUpdatedAt()        { return updatedAt; }
    public void          setUpdatedAt(LocalDateTime v) { updatedAt = v; }
}
