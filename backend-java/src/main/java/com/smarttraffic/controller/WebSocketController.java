package com.smarttraffic.controller;

import com.smarttraffic.dto.VideoAnalyticsDTO;
import com.smarttraffic.service.VehicleDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for real-time video analytics streaming
 */
@Controller
@Slf4j
@RequiredArgsConstructor
public class WebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final VehicleDetectionService vehicleDetectionService;
    
    /**
     * Start video detection for a road
     * Client subscribes to: /topic/video-analytics/{roadName}
     * Client sends to: /app/start-detection/{roadName}
     */
    @MessageMapping("/start-detection/{roadName}")
    public void startDetection(@DestinationVariable String roadName) {
        log.info("Starting video detection for road: {}", roadName);
        
        vehicleDetectionService.startDetection(roadName, analytics -> {
            // Push analytics to all subscribers
            messagingTemplate.convertAndSend(
                "/topic/video-analytics/" + roadName,
                analytics
            );
        });
    }
    
    /**
     * Stop video detection for a road
     * Client sends to: /app/stop-detection/{roadName}
     */
    @MessageMapping("/stop-detection/{roadName}")
    public void stopDetection(@DestinationVariable String roadName) {
        log.info("Stopping video detection for road: {}", roadName);
        vehicleDetectionService.stopDetection(roadName);
    }
}
