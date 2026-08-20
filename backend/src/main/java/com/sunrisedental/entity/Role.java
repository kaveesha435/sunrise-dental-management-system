package com.sunrisedental.entity;

/**
 * System roles for access control.
 * ADMIN — full system access.
 * DENTIST — clinical access (appointments, treatments, patients).
 * RECEPTIONIST — front-desk access (appointments, billing).
 */
public enum Role {
    ADMIN,
    DENTIST,
    RECEPTIONIST
}
