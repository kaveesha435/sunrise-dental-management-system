package com.sunrisedental.exception;

/**
 * Exception thrown when a business rule conflict occurs (e.g., double booking).
 * Maps to HTTP 409 Conflict.
 */
public class BusinessConflictException extends RuntimeException {
    public BusinessConflictException(String message) {
        super(message);
    }
}
