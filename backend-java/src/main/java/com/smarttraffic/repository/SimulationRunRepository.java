package com.smarttraffic.repository;

import com.smarttraffic.model.SimulationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SimulationRunRepository extends JpaRepository<SimulationRun, String> {
    
    List<SimulationRun> findByUserId(String userId);
    
    List<SimulationRun> findByStatus(String status);
    
    @Query("SELECT sr FROM SimulationRun sr WHERE sr.startTime BETWEEN :start AND :end")
    List<SimulationRun> findByDateRange(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
    
    @Query("SELECT sr FROM SimulationRun sr WHERE sr.userId = :userId AND sr.status = :status")
    List<SimulationRun> findByUserIdAndStatus(
        @Param("userId") String userId, 
        @Param("status") String status
    );
    
    @Query("SELECT sr FROM SimulationRun sr WHERE sr.efficiency >= :minEfficiency ORDER BY sr.efficiency DESC")
    List<SimulationRun> findTopPerformingSimulations(@Param("minEfficiency") Double minEfficiency);
}
