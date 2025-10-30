-- PostgreSQL Database Setup Script for Smart Traffic Simulator
-- Run this script as PostgreSQL superuser or database owner

-- Create database
CREATE DATABASE smart_traffic_db
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Connect to the new database
\c smart_traffic_db;

-- Create tables (Note: Spring Boot JPA will auto-create these with ddl-auto=update)
-- These are provided for reference and manual setup if needed

-- Simulation Runs table
CREATE TABLE IF NOT EXISTS simulation_runs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'paused', 'completed', 'stopped')),
    speed DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    cycles_completed INTEGER DEFAULT 0,
    total_processed INTEGER DEFAULT 0,
    avg_wait_time DOUBLE PRECISION DEFAULT 0.0,
    efficiency DOUBLE PRECISION DEFAULT 0.0,
    emergency_events INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Road Performance table
CREATE TABLE IF NOT EXISTS road_performance (
    id VARCHAR(255) PRIMARY KEY,
    simulation_id VARCHAR(255) NOT NULL,
    road_name VARCHAR(100) NOT NULL,
    road_direction VARCHAR(50) NOT NULL,
    vehicles INTEGER DEFAULT 0,
    wait_time DOUBLE PRECISION DEFAULT 0.0,
    queue_length INTEGER DEFAULT 0,
    efficiency DOUBLE PRECISION DEFAULT 0.0,
    signal_state VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulation_runs(id) ON DELETE CASCADE
);

-- Traffic Events table
CREATE TABLE IF NOT EXISTS traffic_events (
    id VARCHAR(255) PRIMARY KEY,
    simulation_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    road_name VARCHAR(100),
    vehicle_type VARCHAR(50),
    description TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulation_runs(id) ON DELETE CASCADE
);

-- Optimization Recommendations table
CREATE TABLE IF NOT EXISTS optimization_recommendations (
    id VARCHAR(255) PRIMARY KEY,
    simulation_id VARCHAR(255) NOT NULL,
    road_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    recommendation TEXT NOT NULL,
    expected_improvement DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'under_review')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulation_runs(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_id ON simulation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_status ON simulation_runs(status);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_start_time ON simulation_runs(start_time);

CREATE INDEX IF NOT EXISTS idx_road_performance_simulation_id ON road_performance(simulation_id);
CREATE INDEX IF NOT EXISTS idx_road_performance_road_name ON road_performance(road_name);
CREATE INDEX IF NOT EXISTS idx_road_performance_timestamp ON road_performance(timestamp);

CREATE INDEX IF NOT EXISTS idx_traffic_events_simulation_id ON traffic_events(simulation_id);
CREATE INDEX IF NOT EXISTS idx_traffic_events_event_type ON traffic_events(event_type);
CREATE INDEX IF NOT EXISTS idx_traffic_events_timestamp ON traffic_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_simulation_id ON optimization_recommendations(simulation_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_priority ON optimization_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_status ON optimization_recommendations(status);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for simulation_runs
DROP TRIGGER IF EXISTS update_simulation_runs_updated_at ON simulation_runs;
CREATE TRIGGER update_simulation_runs_updated_at
    BEFORE UPDATE ON simulation_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant privileges (adjust username as needed)
-- GRANT ALL PRIVILEGES ON DATABASE smart_traffic_db TO your_username;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;

-- Verify tables were created
SELECT 
    table_name, 
    table_type 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name IN ('simulation_runs', 'road_performance', 'traffic_events', 'optimization_recommendations')
ORDER BY 
    table_name;

-- Display message
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL database setup completed successfully!';
    RAISE NOTICE 'Database: smart_traffic_db';
    RAISE NOTICE 'Tables created: simulation_runs, road_performance, traffic_events, optimization_recommendations';
    RAISE NOTICE 'Indexes and triggers configured';
END $$;
