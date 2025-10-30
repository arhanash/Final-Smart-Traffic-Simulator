package com.smarttraffic.service;

import com.smarttraffic.dto.DetectedVehicleDTO;
import com.smarttraffic.dto.DetectedVehicleDTO.BoundingBoxDTO;
import com.smarttraffic.dto.VideoAnalyticsDTO;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

/**
 * AI-powered vehicle detection service using computer vision (YOLO simulation)
 * Converted from TypeScript vehicleDetection.ts
 * 
 * In production, this would integrate with OpenCV + YOLO model via backend API
 */
@Service
@Slf4j
public class VehicleDetectionService {
    
    private final Map<String, ScheduledFuture<?>> detectionTasks = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    
    // Vehicle type probabilities (50% cars, 20% trucks, 10% bus, 20% motorcycle/bicycle)
    private final String[] vehicleTypes = {
        "car", "car", "car", "car", "car",
        "truck", "truck",
        "bus",
        "motorcycle", "bicycle"
    };
    
    private final Random random = new Random();
    
    /**
     * Start real-time vehicle detection for a road
     * Simulates 2 FPS processing (every 500ms)
     */
    public void startDetection(String roadName, DetectionCallback callback) {
        // Stop existing detection if running
        stopDetection(roadName);
        
        // Run detection every 500ms (2 FPS)
        ScheduledFuture<?> task = scheduler.scheduleAtFixedRate(() -> {
            try {
                VideoAnalyticsDTO analytics = detectVehicles(roadName);
                callback.onAnalytics(analytics);
            } catch (Exception e) {
                log.error("Error in vehicle detection for {}: {}", roadName, e.getMessage());
            }
        }, 0, 500, TimeUnit.MILLISECONDS);
        
        detectionTasks.put(roadName, task);
        log.info("Started vehicle detection for {}", roadName);
    }
    
    /**
     * Stop detection for a specific road
     */
    public void stopDetection(String roadName) {
        ScheduledFuture<?> task = detectionTasks.remove(roadName);
        if (task != null) {
            task.cancel(false);
            log.info("Stopped vehicle detection for {}", roadName);
        }
    }
    
    /**
     * Stop all detections
     */
    public void stopAllDetections() {
        detectionTasks.forEach((roadName, task) -> task.cancel(false));
        detectionTasks.clear();
        log.info("Stopped all vehicle detections");
    }
    
    /**
     * Simulate YOLO detection on current video frame
     */
    private VideoAnalyticsDTO detectVehicles(String roadName) {
        long timestamp = System.currentTimeMillis();
        
        // Simulate varying traffic density (0-15 vehicles per frame)
        int vehicleCount = random.nextInt(16);
        
        List<DetectedVehicleDTO> detectedVehicles = new ArrayList<>();
        
        for (int i = 0; i < vehicleCount; i++) {
            // Random vehicle type
            String type = vehicleTypes[random.nextInt(vehicleTypes.length)];
            
            // Random bounding box (normalized coordinates 0-1)
            BoundingBoxDTO bbox = BoundingBoxDTO.builder()
                .x(random.nextDouble() * 0.8)
                .y(random.nextDouble() * 0.8)
                .width(0.05 + random.nextDouble() * 0.15)  // 5-20% of frame width
                .height(0.05 + random.nextDouble() * 0.15) // 5-20% of frame height
                .build();
            
            // YOLO confidence score (0.5-0.99)
            double confidence = 0.5 + random.nextDouble() * 0.49;
            
            // Simulated speed (0-80 km/h)
            double speed = random.nextDouble() * 80.0;
            
            DetectedVehicleDTO vehicle = DetectedVehicleDTO.builder()
                .id(String.format("%s-vehicle-%d-%d", roadName, timestamp, i))
                .type(type)
                .confidence(confidence)
                .bbox(bbox)
                .speed(speed)
                .timestamp(timestamp)
                .build();
            
            detectedVehicles.add(vehicle);
        }
        
        // Calculate queue length (vehicles with low speed < 10 km/h)
        int queueLength = (int) detectedVehicles.stream()
            .filter(v -> v.getSpeed() < 10.0)
            .count();
        
        // Calculate average speed
        double averageSpeed = vehicleCount > 0
            ? detectedVehicles.stream()
                .mapToDouble(DetectedVehicleDTO::getSpeed)
                .average()
                .orElse(0.0)
            : 0.0;
        
        // Flow rate: vehicles per minute (extrapolate from current detection)
        double flowRate = vehicleCount * 2.0 * 60.0; // 2 detections per second * 60 seconds
        
        return VideoAnalyticsDTO.builder()
            .roadName(roadName)
            .vehicleCount(vehicleCount)
            .queueLength(queueLength)
            .averageSpeed(Math.round(averageSpeed * 100.0) / 100.0)
            .detectedVehicles(detectedVehicles)
            .timestamp(timestamp)
            .flowRate(flowRate)
            .build();
    }
    
    /**
     * Analyze traffic density and recommend signal timing
     */
    public TrafficDensityAnalysis analyzeTrafficDensity(VideoAnalyticsDTO analytics) {
        int vehicleCount = analytics.getVehicleCount();
        int queueLength = analytics.getQueueLength();
        double averageSpeed = analytics.getAverageSpeed();
        
        // Calculate traffic density score
        double densityScore = (vehicleCount * 2.0) + (queueLength * 3.0) + ((50.0 - averageSpeed) / 10.0);
        
        String density;
        int recommendedGreenTime;
        int urgency;
        
        if (densityScore < 10.0) {
            density = "low";
            recommendedGreenTime = 15;
            urgency = 20;
        } else if (densityScore < 25.0) {
            density = "medium";
            recommendedGreenTime = 25;
            urgency = 50;
        } else if (densityScore < 40.0) {
            density = "high";
            recommendedGreenTime = 35;
            urgency = 75;
        } else {
            density = "critical";
            recommendedGreenTime = 45;
            urgency = 95;
        }
        
        return new TrafficDensityAnalysis(density, recommendedGreenTime, urgency);
    }
    
    /**
     * Callback interface for detection results
     */
    @FunctionalInterface
    public interface DetectionCallback {
        void onAnalytics(VideoAnalyticsDTO analytics);
    }
    
    /**
     * Traffic density analysis result
     */
    @Data
    public static class TrafficDensityAnalysis {
        private final String density; // low, medium, high, critical
        private final int recommendedGreenTime; // seconds
        private final int urgency; // 0-100
    }
    
    /**
     * Shutdown hook for cleanup
     */
    public void shutdown() {
        stopAllDetections();
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
