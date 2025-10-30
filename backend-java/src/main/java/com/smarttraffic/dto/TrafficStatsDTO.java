package com.smarttraffic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for overall traffic statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficStatsDTO {
    private Integer totalProcessed;
    private Double avgWaitTime;
    private Integer throughput;
    private Double efficiency;
}
