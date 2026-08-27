package com.sunrisedental.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for Treatment operations.
 */
@Getter
@Setter
public class TreatmentResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal standardCost;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
