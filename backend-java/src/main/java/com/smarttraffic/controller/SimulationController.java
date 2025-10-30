package com.smarttraffic.controller;

import com.smarttraffic.dto.*;
import com.smarttraffic.model.SimulationRun;
import com.smarttraffic.service.TrafficSimulationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for traffic simulation operations
 */
@RestController
@RequestMapping("/simulation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SimulationController {
    
    private final TrafficSimulationService simulationService;
    
    /**
     * Create a new simulation
     * POST /api/simulation/create
     */
    @PostMapping("/create")
    public ResponseEntity<SimulationRun> createSimulation(@RequestBody CreateSimulationRequest request) {
        SimulationRun simulation = simulationService.createSimulation(
            request.getUserId(), 
            request.getSpeed()
        );
        return ResponseEntity.ok(simulation);
    }
    
    /**
     * Process a simulation tick
     * POST /api/simulation/{id}/tick
     */
    @PostMapping("/{id}/tick")
    public ResponseEntity<Void> tick(
        @PathVariable String id,
        @RequestParam(defaultValue = "1.0") Double deltaTime
    ) {
        simulationService.tick(id, deltaTime);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get current roads state
     * GET /api/simulation/{id}/roads
     */
    @GetMapping("/{id}/roads")
    public ResponseEntity<List<RoadDTO>> getRoads(@PathVariable String id) {
        List<RoadDTO> roads = simulationService.getRoads(id);
        return ResponseEntity.ok(roads);
    }
    
    /**
     * Get current statistics
     * GET /api/simulation/{id}/stats
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<TrafficStatsDTO> getStats(@PathVariable String id) {
        TrafficStatsDTO stats = simulationService.getStats(id);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Set emergency override
     * POST /api/simulation/{id}/emergency
     */
    @PostMapping("/{id}/emergency")
    public ResponseEntity<Void> setEmergencyOverride(
        @PathVariable String id,
        @RequestBody EmergencyOverrideDTO override
    ) {
        simulationService.setEmergencyOverride(id, override);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Clear emergency override
     * DELETE /api/simulation/{id}/emergency
     */
    @DeleteMapping("/{id}/emergency")
    public ResponseEntity<Void> clearEmergencyOverride(@PathVariable String id) {
        simulationService.clearEmergencyOverride(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Update road from video analytics
     * POST /api/simulation/{id}/road/{roadName}/video-update
     */
    @PostMapping("/{id}/road/{roadName}/video-update")
    public ResponseEntity<Void> updateRoadFromVideo(
        @PathVariable String id,
        @PathVariable String roadName,
        @RequestBody VideoAnalyticsDTO videoData
    ) {
        simulationService.updateRoadFromVideo(id, roadName, videoData);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Pause simulation
     * POST /api/simulation/{id}/pause
     */
    @PostMapping("/{id}/pause")
    public ResponseEntity<Void> pauseSimulation(@PathVariable String id) {
        simulationService.pauseSimulation(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Resume simulation
     * POST /api/simulation/{id}/resume
     */
    @PostMapping("/{id}/resume")
    public ResponseEntity<Void> resumeSimulation(@PathVariable String id) {
        simulationService.resumeSimulation(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Stop simulation
     * POST /api/simulation/{id}/stop
     */
    @PostMapping("/{id}/stop")
    public ResponseEntity<Void> stopSimulation(@PathVariable String id) {
        simulationService.stopSimulation(id);
        return ResponseEntity.ok().build();
    }
    
    @Data
    public static class CreateSimulationRequest {
        private String userId;
        private Double speed;
    }
}
