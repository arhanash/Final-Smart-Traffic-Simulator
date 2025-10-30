package com.smarttraffic.repository;

import com.smarttraffic.model.RoadPerformance;
import com.smarttraffic.model.SimulationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RoadPerformanceRepository extends JpaRepository<RoadPerformance, String> {
    
    List<RoadPerformance> findBySimulationRun(SimulationRun simulationRun);
    
    List<RoadPerformance> findByRoadName(String roadName);
    
    @Query("SELECT rp FROM RoadPerformance rp WHERE rp.simulationRun.id = :simulationId ORDER BY rp.timestamp DESC")
    List<RoadPerformance> findLatestBySimulationId(@Param("simulationId") String simulationId);
    
    @Query("SELECT rp FROM RoadPerformance rp WHERE rp.roadName = :roadName AND rp.timestamp BETWEEN :start AND :end")
    List<RoadPerformance> findByRoadNameAndTimeRange(
        @Param("roadName") String roadName,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
    
    @Query("SELECT AVG(rp.efficiency) FROM RoadPerformance rp WHERE rp.simulationRun.id = :simulationId")
    Double calculateAverageEfficiency(@Param("simulationId") String simulationId);
}
