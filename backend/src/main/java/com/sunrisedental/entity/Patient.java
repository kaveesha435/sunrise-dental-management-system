package com.sunrisedental.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Patient entity — represents a registered patient in the dental clinic.
 *
 * Uses {@link GenerationType#IDENTITY} so PostgreSQL sequences are managed by
 * the DB layer; the app never manually sets IDs.
 *
 * Passwords / sensitive data are NOT stored here.
 * PII fields (email, contact, address) are stored as plain strings — encryption
 * at rest should be handled at the database/volume level in production.
 */
@Entity
@Table(name = "patients", indexes = {
        @Index(name = "idx_patient_full_name",      columnList = "full_name"),
        @Index(name = "idx_patient_contact_number",  columnList = "contact_number"),
        @Index(name = "idx_patient_status",          columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Full legal name — required, indexed for search. */
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    /** ISO date of birth — used to compute age on the fly. */
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    /** MALE / FEMALE / OTHER */
    @Column(nullable = false, length = 10)
    private String gender;

    /** Primary phone — required, indexed for search. */
    @Column(name = "contact_number", nullable = false, length = 20)
    private String contactNumber;

    /** Optional email address. */
    @Column(length = 100)
    private String email;

    /** Street / unit address. */
    @Column(nullable = false, length = 200)
    private String address;

    /** City / district. */
    @Column(nullable = false, length = 100)
    private String city;

    /** Postal / ZIP code. */
    @Column(name = "postal_code", nullable = false, length = 10)
    private String postalCode;

    /** Name and contact for next-of-kin or emergency contact. */
    @Column(name = "emergency_contact", length = 150)
    private String emergencyContact;

    /** Free-text clinical or administrative notes. */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * ACTIVE / INACTIVE.
     * New patients default to ACTIVE.
     */
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String status = "ACTIVE";

    /** Set by {@link #onCreate()} — never updated after insert. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Updated by {@link #onUpdate()} on every save. */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
