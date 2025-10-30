-- MySQL Database Setup Script for Smart Traffic Simulator
-- Run this script to create the database and configure users

-- Create database
CREATE DATABASE IF NOT EXISTS smart_traffic_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE smart_traffic_db;

-- Optional: Create dedicated user for the application
-- Uncomment and modify if you want a separate user instead of root
-- CREATE USER IF NOT EXISTS 'smart_traffic'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT ALL PRIVILEGES ON smart_traffic_db.* TO 'smart_traffic'@'localhost';
-- FLUSH PRIVILEGES;

-- The tables will be auto-created by Hibernate when the application starts
-- But you can verify table creation with:
-- SHOW TABLES;

-- Verify database configuration
SELECT 
  @@character_set_database as charset, 
  @@collation_database as collation;

-- Show current user privileges
SHOW GRANTS FOR CURRENT_USER();

SHOW DATABASES;

-- Notes:
-- 1. Tables (simulation_runs, road_performance, traffic_events, optimization_recommendations) 
--    will be automatically created by Spring Boot JPA with ddl-auto: update
-- 2. Make sure to update application.yml with your MySQL credentials
-- 3. The application will handle all schema migrations automatically
