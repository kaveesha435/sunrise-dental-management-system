package com.sunrisedental.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Request DTO for creating/updating a Treatment procedure.
 */
public class TreatmentRequest {

    @NotBlank(message = "Treatment name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Standard cost is required")
    @DecimalMin(value = "0.0", message = "Standard cost must be a positive number or zero")
    private BigDecimal standardCost;

    @NotNull(message = "Active status is required")
    private Boolean active;

    // Getters and Setters

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getStandardCost() { return standardCost; }
    public void setStandardCost(BigDecimal standardCost) { this.standardCost = standardCost; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
