package com.smarttraffic.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a traffic simulation run session
 */
@Entity
@Table(name = "simulation_runs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRun {
    
    @Id
    @Column(name = "id", length = 36)
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "status", nullable = false, length = 20)
    private String status; // running, paused, completed
    
    @Column(name = "speed", nullable = false)
    private Double speed;
    
    @Column(name = "cycles_completed")
    private Integer cyclesCompleted;
    
    @Column(name = "total_processed")
    private Integer totalProcessed;
    
    @Column(name = "avg_wait_time")
    private Double avgWaitTime;
    
    @Column(name = "efficiency")
    private Double efficiency;
    
    @Column(name = "emergency_events")
    private Integer emergencyEvents;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "simulationRun", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RoadPerformance> roadPerformances = new ArrayList<>();
    
    @OneToMany(mappedBy = "simulationRun", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TrafficEvent> trafficEvents = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (cyclesCompleted == null) cyclesCompleted = 0;
        if (totalProcessed == null) totalProcessed = 0;
        if (avgWaitTime == null) avgWaitTime = 0.0;
        if (efficiency == null) efficiency = 0.0;
        if (emergencyEvents == null) emergencyEvents = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
