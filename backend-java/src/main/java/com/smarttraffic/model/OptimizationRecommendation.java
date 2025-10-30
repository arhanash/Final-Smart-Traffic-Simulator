package com.smarttraffic.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing AI-generated optimization recommendations
 */
@Entity
@Table(name = "optimization_recommendations", indexes = {
    @Index(name = "idx_simulation_id", columnList = "simulation_id"),
    @Index(name = "idx_priority", columnList = "priority")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationRecommendation {
    
    @Id
    @Column(name = "id", length = 36)
    private String id;
    
    @Column(name = "simulation_id", nullable = false, length = 36)
    private String simulationId;
    
    @Column(name = "road_name", nullable = false, length = 50)
    private String roadName;
    
    @Column(name = "category", nullable = false, length = 50)
    private String category; // timing, infrastructure, emergency
    
    @Column(name = "priority", nullable = false, length = 20)
    private String priority; // low, medium, high, critical
    
    @Column(name = "recommendation", nullable = false, columnDefinition = "TEXT")
    private String recommendation;
    
    @Column(name = "expected_improvement")
    private Double expectedImprovement; // percentage
    
    @Column(name = "status", nullable = false, length = 20)
    private String status; // pending, implemented, dismissed
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
