package com.smarttraffic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for AI-powered video analytics from vehicle detection
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoAnalyticsDTO {
    private String roadName;
    private Integer vehicleCount;
    private Integer queueLength;
    private Double averageSpeed;
    private List<DetectedVehicleDTO> detectedVehicles;
    private Long timestamp;
    private Double flowRate; // vehicles per minute
}
