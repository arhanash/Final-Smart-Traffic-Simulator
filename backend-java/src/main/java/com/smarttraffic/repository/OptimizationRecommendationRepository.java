package com.smarttraffic.repository;

import com.smarttraffic.model.OptimizationRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptimizationRecommendationRepository extends JpaRepository<OptimizationRecommendation, String> {
    
    List<OptimizationRecommendation> findBySimulationId(String simulationId);
    
    List<OptimizationRecommendation> findByPriority(String priority);
    
    List<OptimizationRecommendation> findByStatus(String status);
    
    @Query("SELECT or FROM OptimizationRecommendation or WHERE or.simulationId = :simulationId AND or.status = 'pending' ORDER BY CASE or.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
    List<OptimizationRecommendation> findPendingRecommendationsByPriority(@Param("simulationId") String simulationId);
    
    @Query("SELECT or FROM OptimizationRecommendation or WHERE or.roadName = :roadName AND or.status = :status")
    List<OptimizationRecommendation> findByRoadNameAndStatus(
        @Param("roadName") String roadName,
        @Param("status") String status
    );
}
