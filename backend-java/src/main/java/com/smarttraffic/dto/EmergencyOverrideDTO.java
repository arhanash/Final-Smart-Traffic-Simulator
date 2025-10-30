package com.smarttraffic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for emergency override requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyOverrideDTO {
    private String road; // North, East, South, West
    private String vehicleType; // ambulance, fire_truck, police
    private Boolean active;
}
