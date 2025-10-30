package com.smarttraffic.repository;

import com.smarttraffic.model.TrafficEvent;
import com.smarttraffic.model.SimulationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrafficEventRepository extends JpaRepository<TrafficEvent, String> {
    
    List<TrafficEvent> findBySimulationRun(SimulationRun simulationRun);
    
    List<TrafficEvent> findByEventType(String eventType);
    
    @Query("SELECT te FROM TrafficEvent te WHERE te.simulationRun.id = :simulationId AND te.eventType = :eventType")
    List<TrafficEvent> findBySimulationIdAndEventType(
        @Param("simulationId") String simulationId,
        @Param("eventType") String eventType
    );
    
    @Query("SELECT te FROM TrafficEvent te WHERE te.timestamp BETWEEN :start AND :end ORDER BY te.timestamp DESC")
    List<TrafficEvent> findByTimeRange(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
    
    @Query("SELECT COUNT(te) FROM TrafficEvent te WHERE te.simulationRun.id = :simulationId AND te.eventType = 'emergency'")
    Long countEmergencyEvents(@Param("simulationId") String simulationId);
}
