/**
 * JSDoc type definitions for domain models.
 * Used throughout the application for IDE autocomplete and documentation.
 * These will be backed by actual Spring Boot DTOs from the API.
 */

/**
 * @typedef {Object} Patient
 * @property {number}  id
 * @property {string}  firstName
 * @property {string}  lastName
 * @property {string}  dateOfBirth   - ISO date string
 * @property {'M'|'F'|'OTHER'} gender
 * @property {string}  phone
 * @property {string}  email
 * @property {string}  address
 * @property {string}  medicalHistory
 * @property {string}  createdAt     - ISO datetime string
 */

/**
 * @typedef {Object} Dentist
 * @property {number}  id
 * @property {string}  firstName
 * @property {string}  lastName
 * @property {string}  specialization
 * @property {string}  phone
 * @property {string}  email
 * @property {'ACTIVE'|'INACTIVE'} status
 */

/**
 * @typedef {Object} Appointment
 * @property {number}  id
 * @property {Patient} patient
 * @property {Dentist} dentist
 * @property {string}  appointmentDate  - ISO datetime string
 * @property {string}  notes
 * @property {'SCHEDULED'|'COMPLETED'|'CANCELLED'|'NO_SHOW'} status
 */

/**
 * @typedef {Object} Treatment
 * @property {number}  id
 * @property {string}  name
 * @property {string}  description
 * @property {number}  defaultCost
 * @property {boolean} active
 */

/**
 * @typedef {Object} Invoice
 * @property {number}      id
 * @property {Appointment} appointment
 * @property {number}      subtotal
 * @property {number}      tax
 * @property {number}      total
 * @property {'PENDING'|'PAID'|'OVERDUE'} status
 * @property {string}      issuedAt     - ISO datetime string
 * @property {string}      paidAt       - ISO datetime string
 */

/**
 * @typedef {Object} PagedResponse
 * @property {Array}  content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} number          - current page (0-indexed)
 * @property {number} size
 */

export {};
