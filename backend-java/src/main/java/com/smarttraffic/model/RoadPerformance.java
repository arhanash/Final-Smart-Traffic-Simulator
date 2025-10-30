package com.smarttraffic.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing performance metrics for individual roads
 */
@Entity
@Table(name = "road_performance", indexes = {
    @Index(name = "idx_simulation_id", columnList = "simulation_id"),
    @Index(name = "idx_road_name", columnList = "road_name")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadPerformance {
    
    @Id
    @Column(name = "id", length = 36)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulation_id", nullable = false)
    private SimulationRun simulationRun;
    
    @Column(name = "road_name", nullable = false, length = 50)
    private String roadName;
    
    @Column(name = "road_direction", nullable = false, length = 10)
    private String roadDirection; // North, East, South, West
    
    @Column(name = "vehicles")
    private Integer vehicles;
    
    @Column(name = "wait_time")
    private Double waitTime;
    
    @Column(name = "queue_length")
    private Integer queueLength;
    
    @Column(name = "efficiency")
    private Double efficiency;
    
    @Column(name = "signal_state", nullable = false, length = 10)
    private String signalState; // red, yellow, green
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = LocalDateTime.now();
        if (vehicles == null) vehicles = 0;
        if (waitTime == null) waitTime = 0.0;
        if (queueLength == null) queueLength = 0;
        if (efficiency == null) efficiency = 0.0;
    }
}
