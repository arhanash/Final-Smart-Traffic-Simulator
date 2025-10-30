package com.smarttraffic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Smart Traffic Insights Simulator Backend Application
 * 
 * Main Spring Boot application entry point for the traffic simulation system.
 * This backend provides REST APIs, WebSocket support, and real-time vehicle detection analytics.
 */
@SpringBootApplication
@EnableScheduling
public class SmartTrafficApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartTrafficApplication.class, args);
        System.out.println("========================================");
        System.out.println("Smart Traffic Simulator Backend Started");
        System.out.println("API Base URL: http://localhost:8080/api");
        System.out.println("WebSocket URL: ws://localhost:8080/ws");
        System.out.println("========================================");
    }
}
