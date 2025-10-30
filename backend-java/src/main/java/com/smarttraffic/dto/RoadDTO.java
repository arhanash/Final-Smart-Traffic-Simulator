package com.smarttraffic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a road in the traffic simulation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadDTO {
    private String name;
    private String direction; // North, East, South, West
    private String light; // red, yellow, green
    private Integer vehicles;
    private Integer queue;
    private Double waitTime;
    private Double performance;
}
