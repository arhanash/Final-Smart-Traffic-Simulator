package com.smarttraffic.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing traffic events (emergency overrides, congestion alerts, etc.)
 */
@Entity
@Table(name = "traffic_events", indexes = {
    @Index(name = "idx_simulation_id", columnList = "simulation_id"),
    @Index(name = "idx_event_type", columnList = "event_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficEvent {
    
    @Id
    @Column(name = "id", length = 36)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulation_id", nullable = false)
    private SimulationRun simulationRun;
    
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // emergency, congestion, signal_change, etc.
    
    @Column(name = "road_name", length = 50)
    private String roadName;
    
    @Column(name = "vehicle_type", length = 50)
    private String vehicleType; // ambulance, fire_truck, police
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }
}
