package com.smarttraffic.service;

import com.smarttraffic.dto.*;
import com.smarttraffic.model.*;
import com.smarttraffic.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Core traffic simulation engine service
 * Converted from TypeScript simulationEngine.ts
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TrafficSimulationService {
    
    private final SimulationRunRepository simulationRunRepository;
    private final RoadPerformanceRepository roadPerformanceRepository;
    private final TrafficEventRepository trafficEventRepository;
    
    // Active simulations (in-memory state)
    private final Map<String, SimulationState> activeSimulations = new ConcurrentHashMap<>();
    
    /**
     * Initialize a new simulation run
     */
    @Transactional
    public SimulationRun createSimulation(String userId, Double speed) {
        String simulationId = UUID.randomUUID().toString();
        
        SimulationRun simulation = SimulationRun.builder()
            .id(simulationId)
            .userId(userId)
            .startTime(LocalDateTime.now())
            .status("running")
            .speed(speed)
            .cyclesCompleted(0)
            .totalProcessed(0)
            .avgWaitTime(0.0)
            .efficiency(84.0)
            .emergencyEvents(0)
            .build();
        
        SimulationRun saved = simulationRunRepository.save(simulation);
        
        // Initialize in-memory state
        SimulationState state = new SimulationState();
        state.roads = initializeRoads();
        state.currentCycle = 0.0;
        state.cycleLength = 60.0; // seconds
        state.totalProcessed = 0;
        state.emergencyOverride = null;
        
        activeSimulations.put(simulationId, state);
        
        log.info("Created simulation {} for user {}", simulationId, userId);
        return saved;
    }
    
    /**
     * Initialize roads with default values
     */
    private List<RoadDTO> initializeRoads() {
        String[] roadNames = {"Road A", "Road B", "Road C", "Road D"};
        String[] directions = {"North", "East", "South", "West"};
        
        List<RoadDTO> roads = new ArrayList<>();
        Random random = new Random();
        
        for (int i = 0; i < 4; i++) {
            roads.add(RoadDTO.builder()
                .name(roadNames[i])
                .direction(directions[i])
                .light("red")
                .vehicles(random.nextInt(10) + 10)
                .queue(random.nextInt(10) + 10)
                .waitTime((double) (random.nextInt(30) + 30))
                .performance((double) (random.nextInt(20) + 75))
                .build());
        }
        
        return roads;
    }
    
    /**
     * Process one simulation tick (1 second of simulation time)
     */
    @Transactional
    public void tick(String simulationId, Double deltaTime) {
        SimulationState state = activeSimulations.get(simulationId);
        if (state == null) {
            log.warn("Simulation {} not found in active simulations", simulationId);
            return;
        }
        
        state.currentCycle += deltaTime;
        
        if (state.emergencyOverride != null && state.emergencyOverride.getActive()) {
            handleEmergencyOverride(state);
        } else {
            updateTrafficLights(state);
        }
        
        simulateTraffic(state);
        updateStats(state, simulationId);
        
        // Save road performance snapshots every 10 seconds
        if (state.currentCycle % 10 < deltaTime) {
            saveRoadPerformanceSnapshot(simulationId, state.roads);
        }
    }
    
    /**
     * Handle emergency override (give priority to emergency vehicles)
     */
    private void handleEmergencyOverride(SimulationState state) {
        EmergencyOverrideDTO override = state.emergencyOverride;
        Random random = new Random();
        
        for (RoadDTO road : state.roads) {
            if (road.getDirection().equals(override.getRoad())) {
                // Emergency road gets green light
                road.setLight("green");
                
                // Clear emergency road faster
                if (road.getVehicles() > 0) {
                    road.setVehicles(Math.max(0, road.getVehicles() - 2));
                }
                if (road.getQueue() > 0) {
                    road.setQueue(Math.max(0, road.getQueue() - 2));
                }
            } else {
                // Other roads stay red
                road.setLight("red");
                
                // Build up on other roads
                if (random.nextDouble() > 0.7) {
                    road.setVehicles(road.getVehicles() + 1);
                    road.setQueue(road.getQueue() + 1);
                }
            }
        }
    }
    
    /**
     * Update traffic lights based on cycle position
     */
    private void updateTrafficLights(SimulationState state) {
        double cyclePosition = state.currentCycle % state.cycleLength;
        double quarterCycle = state.cycleLength / 4.0;
        double transitionTime = 3.0; // yellow light duration
        
        for (int i = 0; i < state.roads.size(); i++) {
            RoadDTO road = state.roads.get(i);
            double roadStart = i * quarterCycle;
            double roadEnd = roadStart + quarterCycle;
            
            if (cyclePosition >= roadStart && cyclePosition < roadEnd - transitionTime) {
                road.setLight("green");
            } else if (cyclePosition >= roadEnd - transitionTime && cyclePosition < roadEnd) {
                road.setLight("yellow");
            } else {
                road.setLight("red");
            }
        }
    }
    
    /**
     * Simulate traffic flow (vehicles entering/leaving)
     */
    private void simulateTraffic(SimulationState state) {
        Random random = new Random();
        
        for (RoadDTO road : state.roads) {
            if ("green".equals(road.getLight())) {
                // Process vehicles
                if (road.getQueue() > 0) {
                    int processed = Math.min(random.nextInt(3) + 1, road.getQueue());
                    road.setQueue(road.getQueue() - processed);
                    road.setVehicles(Math.max(0, road.getVehicles() - processed));
                    state.totalProcessed += processed;
                }
                
                // Reduce wait time
                road.setWaitTime(Math.max(20.0, road.getWaitTime() - random.nextInt(5)));
            } else {
                // Add new vehicles
                if (random.nextDouble() > 0.5) {
                    road.setVehicles(road.getVehicles() + random.nextInt(2));
                    road.setQueue(road.getQueue() + random.nextInt(2));
                }
                
                // Increase wait time
                road.setWaitTime(Math.min(80.0, road.getWaitTime() + random.nextInt(3)));
            }
            
            // Update performance based on queue and wait time
            double queuePenalty = Math.min(road.getQueue() * 2.0, 30.0);
            double waitPenalty = Math.min((road.getWaitTime() - 30.0) / 2.0, 20.0);
            road.setPerformance(Math.max(50.0, Math.min(98.0, 100.0 - queuePenalty - waitPenalty)));
        }
    }
    
    /**
     * Update overall statistics
     */
    private void updateStats(SimulationState state, String simulationId) {
        double totalWaitTime = state.roads.stream()
            .mapToDouble(RoadDTO::getWaitTime)
            .sum();
        double avgWaitTime = totalWaitTime / state.roads.size();
        
        double avgPerformance = state.roads.stream()
            .mapToDouble(RoadDTO::getPerformance)
            .average()
            .orElse(84.0);
        
        int throughput = (int) Math.floor(state.totalProcessed / (state.currentCycle / 60.0));
        if (throughput == 0) throughput = 20;
        
        state.stats = TrafficStatsDTO.builder()
            .totalProcessed(state.totalProcessed)
            .avgWaitTime(Math.round(avgWaitTime * 100.0) / 100.0)
            .throughput(throughput)
            .efficiency(Math.round(avgPerformance * 100.0) / 100.0)
            .build();
        
        // Update database
        SimulationRun simulation = simulationRunRepository.findById(simulationId).orElse(null);
        if (simulation != null) {
            simulation.setTotalProcessed(state.totalProcessed);
            simulation.setAvgWaitTime(state.stats.getAvgWaitTime());
            simulation.setEfficiency(state.stats.getEfficiency());
            simulationRunRepository.save(simulation);
        }
    }
    
    /**
     * Set emergency override
     */
    @Transactional
    public void setEmergencyOverride(String simulationId, EmergencyOverrideDTO override) {
        SimulationState state = activeSimulations.get(simulationId);
        if (state != null) {
            state.emergencyOverride = override;
            
            // Log event
            SimulationRun simulation = simulationRunRepository.findById(simulationId).orElse(null);
            if (simulation != null) {
                TrafficEvent event = TrafficEvent.builder()
                    .id(UUID.randomUUID().toString())
                    .simulationRun(simulation)
                    .eventType("emergency")
                    .roadName(override.getRoad())
                    .vehicleType(override.getVehicleType())
                    .description("Emergency override activated for " + override.getVehicleType())
                    .timestamp(LocalDateTime.now())
                    .build();
                
                trafficEventRepository.save(event);
                
                simulation.setEmergencyEvents(simulation.getEmergencyEvents() + 1);
                simulationRunRepository.save(simulation);
            }
            
            log.info("Emergency override set for simulation {}: {} on {}", 
                simulationId, override.getVehicleType(), override.getRoad());
        }
    }
    
    /**
     * Clear emergency override
     */
    public void clearEmergencyOverride(String simulationId) {
        SimulationState state = activeSimulations.get(simulationId);
        if (state != null) {
            state.emergencyOverride = null;
            log.info("Emergency override cleared for simulation {}", simulationId);
        }
    }
    
    /**
     * Get current roads state
     */
    public List<RoadDTO> getRoads(String simulationId) {
        SimulationState state = activeSimulations.get(simulationId);
        return state != null ? state.roads : Collections.emptyList();
    }
    
    /**
     * Get current statistics
     */
    public TrafficStatsDTO getStats(String simulationId) {
        SimulationState state = activeSimulations.get(simulationId);
        return state != null ? state.stats : TrafficStatsDTO.builder()
            .totalProcessed(0)
            .avgWaitTime(0.0)
            .throughput(20)
            .efficiency(84.0)
            .build();
    }
    
    /**
     * Update road data from video analytics (AI-driven adaptive timing)
     */
    public void updateRoadFromVideo(String simulationId, String roadName, VideoAnalyticsDTO videoData) {
        SimulationState state = activeSimulations.get(simulationId);
        if (state == null) return;
        
        RoadDTO road = state.roads.stream()
            .filter(r -> r.getName().equals(roadName))
            .findFirst()
            .orElse(null);
        
        if (road == null) return;
        
        // Use AI-detected vehicle and queue data
        road.setVehicles(videoData.getVehicleCount());
        road.setQueue(videoData.getQueueLength());
        
        // Dynamically adjust cycle length based on traffic density
        int trafficDensity = videoData.getVehicleCount() + (videoData.getQueueLength() * 2);
        
        if (trafficDensity > 20) {
            // Critical density - extend cycle
            state.cycleLength = Math.min(90.0, state.cycleLength + 1.0);
        } else if (trafficDensity < 10) {
            // Low density - reduce cycle
            state.cycleLength = Math.max(45.0, state.cycleLength - 1.0);
        }
        
        // Update performance based on real-time data
        double queuePenalty = Math.min(videoData.getQueueLength() * 2.0, 30.0);
        double densityPenalty = Math.min(videoData.getVehicleCount(), 20.0);
        road.setPerformance(Math.max(50.0, Math.min(98.0, 100.0 - queuePenalty - densityPenalty)));
        
        log.debug("Updated {} from video analytics: {} vehicles, {} queue", 
            roadName, videoData.getVehicleCount(), videoData.getQueueLength());
    }
    
    /**
     * Pause simulation
     */
    @Transactional
    public void pauseSimulation(String simulationId) {
        SimulationRun simulation = simulationRunRepository.findById(simulationId).orElse(null);
        if (simulation != null) {
            simulation.setStatus("paused");
            simulationRunRepository.save(simulation);
            log.info("Simulation {} paused", simulationId);
        }
    }
    
    /**
     * Resume simulation
     */
    @Transactional
    public void resumeSimulation(String simulationId) {
        SimulationRun simulation = simulationRunRepository.findById(simulationId).orElse(null);
        if (simulation != null) {
            simulation.setStatus("running");
            simulationRunRepository.save(simulation);
            log.info("Simulation {} resumed", simulationId);
        }
    }
    
    /**
     * Stop simulation
     */
    @Transactional
    public void stopSimulation(String simulationId) {
        SimulationRun simulation = simulationRunRepository.findById(simulationId).orElse(null);
        if (simulation != null) {
            simulation.setStatus("completed");
            simulation.setEndTime(LocalDateTime.now());
            simulationRunRepository.save(simulation);
            
            // Remove from active simulations
            activeSimulations.remove(simulationId);
            log.info("Simulation {} stopped", simulationId);
        }
    }
    
    /**
     * Save road performance snapshot to database
     */
    @Transactional
    private void saveRoadPerformanceSnapshot(String simulationId, List<RoadDTO> roads) {
        SimulationRun simulation = simulationRunRepository.findById(simulationId).orElse(null);
        if (simulation == null) return;
        
        for (RoadDTO road : roads) {
            RoadPerformance performance = RoadPerformance.builder()
                .id(UUID.randomUUID().toString())
                .simulationRun(simulation)
                .roadName(road.getName())
                .roadDirection(road.getDirection())
                .vehicles(road.getVehicles())
                .waitTime(road.getWaitTime())
                .queueLength(road.getQueue())
                .efficiency(road.getPerformance())
                .signalState(road.getLight())
                .timestamp(LocalDateTime.now())
                .build();
            
            roadPerformanceRepository.save(performance);
        }
    }
    
    /**
     * Internal simulation state holder
     */
    private static class SimulationState {
        List<RoadDTO> roads;
        Double currentCycle;
        Double cycleLength;
        EmergencyOverrideDTO emergencyOverride;
        Integer totalProcessed;
        TrafficStatsDTO stats;
    }
}
