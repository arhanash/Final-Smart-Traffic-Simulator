package com.smarttraffic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for individual detected vehicle from YOLO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectedVehicleDTO {
    private String id;
    private String type; // car, truck, bus, motorcycle, bicycle
    private Double confidence;
    private BoundingBoxDTO bbox;
    private Double speed; // km/h
    private Long timestamp;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoundingBoxDTO {
        private Double x;
        private Double y;
        private Double width;
        private Double height;
    }
}
