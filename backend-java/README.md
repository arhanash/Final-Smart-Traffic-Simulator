# Smart Traffic Simulator - Java Backend

## Overview

This is the Java Spring Boot backend for the Smart Traffic Insights Simulator. It provides REST APIs, WebSocket support for real-time updates, AI-powered vehicle detection simulation, and comprehensive analytics with export capabilities.

## Architecture

```
backend-java/
├── src/main/java/com/smarttraffic/
│   ├── SmartTrafficApplication.java   # Main application entry point
│   ├── config/                         # Configuration classes
│   │   ├── CorsConfig.java            # CORS configuration
│   │   └── WebSocketConfig.java       # WebSocket configuration
│   ├── controller/                     # REST and WebSocket controllers
│   │   ├── SimulationController.java  # Simulation APIs
│   │   ├── ExportController.java      # Export APIs (PDF/Excel/CSV)
│   │   └── WebSocketController.java   # Real-time WebSocket
│   ├── dto/                            # Data Transfer Objects
│   │   ├── RoadDTO.java
│   │   ├── TrafficStatsDTO.java
│   │   ├── EmergencyOverrideDTO.java
│   │   ├── VideoAnalyticsDTO.java
│   │   └── DetectedVehicleDTO.java
│   ├── model/                          # JPA entities
│   │   ├── SimulationRun.java
│   │   ├── RoadPerformance.java
│   │   ├── TrafficEvent.java
│   │   └── OptimizationRecommendation.java
│   ├── repository/                     # JPA repositories
│   │   ├── SimulationRunRepository.java
│   │   ├── RoadPerformanceRepository.java
│   │   ├── TrafficEventRepository.java
│   │   └── OptimizationRecommendationRepository.java
│   └── service/                        # Business logic services
│       ├── TrafficSimulationService.java    # Core simulation engine
│       ├── VehicleDetectionService.java     # AI vehicle detection
│       └── ExportService.java               # PDF/Excel/CSV generation
├── src/main/resources/
│   └── application.yml                # Application configuration
└── pom.xml                            # Maven dependencies
```

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL 12+ (primary), MySQL and H2 also supported
- **ORM**: Spring Data JPA / Hibernate
- **WebSocket**: Spring WebSocket with STOMP
- **PDF Generation**: iText 7
- **Excel Generation**: Apache POI
- **Build Tool**: Maven

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+ (primary database)

## Database Setup

### PostgreSQL (Primary Database)

#### 1. Install PostgreSQL

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**On Windows:**
Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

#### 2. Access PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Or directly
psql -U postgres
```

#### 3. Create Database and User

```bash
# Login to PostgreSQL as postgres user
sudo -u postgres psql

# Or use the provided SQL script
sudo -u postgres psql < database-setup-postgresql.sql
```

**Manual Setup:**
```sql
-- Create database
CREATE DATABASE smart_traffic_db
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Create user (optional, for better security)
CREATE USER smart_traffic WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE smart_traffic_db TO smart_traffic;

-- Connect to the new database
\c smart_traffic_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO smart_traffic;

-- Exit PostgreSQL
\q
```

#### 4. Verify Database Creation
```bash
psql -U postgres
\l                          # List all databases
\c smart_traffic_db         # Connect to database
\dt                         # List tables (after first run)
```

#### 5. Run Database Initialization Script

```bash
# From the backend-java directory
sudo -u postgres psql < database-setup-postgresql.sql

# Or manually
sudo -u postgres psql -d smart_traffic_db -f database-setup-postgresql.sql
```

### Configuration

The default PostgreSQL configuration in `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/smart_traffic_db
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

**Update credentials** to match your PostgreSQL setup:
```yaml
spring:
  datasource:
    username: your_postgres_username
    password: your_postgres_password
```

**For production, use environment variables:**
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/smart_traffic_db
export SPRING_DATASOURCE_USERNAME=smart_traffic
export SPRING_DATASOURCE_PASSWORD=your_secure_password
```

### Alternative Databases

#### MySQL (Alternative)

Uncomment the MySQL configuration in `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/smart_traffic_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
```

#### H2 (Development/Testing)

For quick testing without installing a database, uncomment the H2 configuration:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
```

Then access H2 console at: http://localhost:8080/h2-console

## Installation & Running

### 1. Clone and Build

```bash
cd backend-java
mvn clean install
```

### 2. Run the Application

```bash
mvn spring-boot:run
```

Or run the JAR:

```bash
java -jar target/smart-traffic-backend-1.0.0.jar
```

### 3. Verify Startup

The application will start on port **8080** with context path `/api`.

```
========================================
Smart Traffic Simulator Backend Started
API Base URL: http://localhost:8080/api
WebSocket URL: ws://localhost:8080/ws
========================================
```

## API Endpoints

### Base URL: `http://localhost:8080/api`

### 1. Simulation Management

#### Create Simulation
```http
POST /simulation/create
Content-Type: application/json

{
  "userId": "user123",
  "speed": 1.0
}

Response: SimulationRun object with ID
```

#### Process Tick (1 second of simulation)
```http
POST /simulation/{simulationId}/tick?deltaTime=1.0
```

#### Get Roads State
```http
GET /simulation/{simulationId}/roads

Response: [
  {
    "name": "Road A",
    "direction": "North",
    "light": "green",
    "vehicles": 15,
    "queue": 5,
    "waitTime": 45.0,
    "performance": 82.5
  },
  ...
]
```

#### Get Statistics
```http
GET /simulation/{simulationId}/stats

Response: {
  "totalProcessed": 120,
  "avgWaitTime": 42.5,
  "throughput": 25,
  "efficiency": 84.0
}
```

#### Emergency Override
```http
POST /simulation/{simulationId}/emergency
Content-Type: application/json

{
  "road": "North",
  "vehicleType": "ambulance",
  "active": true
}
```

#### Clear Emergency Override
```http
DELETE /simulation/{simulationId}/emergency
```

#### Update Road from Video Analytics
```http
POST /simulation/{simulationId}/road/{roadName}/video-update
Content-Type: application/json

{
  "roadName": "Road A",
  "vehicleCount": 12,
  "queueLength": 5,
  "averageSpeed": 35.5,
  "detectedVehicles": [...],
  "timestamp": 1698765432000,
  "flowRate": 120.0
}
```

#### Pause/Resume/Stop Simulation
```http
POST /simulation/{simulationId}/pause
POST /simulation/{simulationId}/resume
POST /simulation/{simulationId}/stop
```

### 2. Export Reports

#### Export as PDF
```http
POST /export/pdf
Content-Type: application/json

{
  "systemEfficiency": 84.5,
  "avgWaitTime": 42.3,
  "totalThroughput": 150,
  "emergencyEvents": 3,
  "roadPerformance": [
    {
      "roadName": "Road A",
      "vehicles": 15,
      "waitTime": 45.0,
      "efficiency": 82.0,
      "queueLength": 5,
      "peakTraffic": "08:30"
    },
    ...
  ],
  "recommendations": [...]
}

Response: PDF file (application/pdf)
```

#### Export as Excel
```http
POST /export/excel
Content-Type: application/json

(Same request body as PDF)

Response: Excel file (.xlsx)
```

#### Export as CSV
```http
POST /export/csv
Content-Type: application/json

(Same request body as PDF)

Response: CSV file (text/csv)
```

## WebSocket Integration

### Connection

```javascript
// Connect to WebSocket
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
  console.log('Connected: ' + frame);
  
  // Subscribe to road analytics
  stompClient.subscribe('/topic/video-analytics/Road A', function(message) {
    const analytics = JSON.parse(message.body);
    console.log('Video analytics:', analytics);
    // analytics contains: vehicleCount, queueLength, averageSpeed, detectedVehicles, etc.
  });
  
  // Start detection
  stompClient.send('/app/start-detection/Road A', {}, {});
});
```

### Stop Detection

```javascript
stompClient.send('/app/stop-detection/Road A', {}, {});
```

### WebSocket Topics

- `/topic/video-analytics/{roadName}` - Real-time vehicle detection analytics (2 FPS)

## Frontend Integration

### Update React Frontend to Use Java Backend

Replace Blink SDK calls with REST API calls:

**Before (Blink SDK):**
```typescript
const blink = createClient({ projectId: '...', authRequired: false });
await blink.db.trafficEvents.create({ ... });
```

**After (Java Backend):**
```typescript
const API_BASE_URL = 'http://localhost:8080/api';

// Create simulation
const response = await fetch(`${API_BASE_URL}/simulation/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user123', speed: 1.0 })
});
const simulation = await response.json();
const simulationId = simulation.id;

// Tick simulation
await fetch(`${API_BASE_URL}/simulation/${simulationId}/tick?deltaTime=1.0`, {
  method: 'POST'
});

// Get roads
const roadsResponse = await fetch(`${API_BASE_URL}/simulation/${simulationId}/roads`);
const roads = await roadsResponse.json();

// Export PDF
const exportResponse = await fetch(`${API_BASE_URL}/export/pdf`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(analyticsData)
});
const pdfBlob = await exportResponse.blob();
const url = URL.createObjectURL(pdfBlob);
window.open(url, '_blank');
```

## Configuration

### application.yml

Key configuration options:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/smart_traffic_db
    username: postgres
    password: postgres

cors:
  allowed-origins: http://localhost:5173,https://*.sites.blink.new
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"

traffic:
  simulation:
    default-cycle-length: 60  # seconds
    tick-interval: 1000        # milliseconds
  detection:
    fps: 2                     # frames per second
    confidence-threshold: 0.5
```

## Database Schema

The application auto-creates tables using Hibernate DDL (`ddl-auto: update`).

**Tables:**
- `simulation_runs` - Simulation session metadata
- `road_performance` - Per-road performance snapshots
- `traffic_events` - Event log (emergency, congestion, etc.)
- `optimization_recommendations` - AI-generated recommendations

## Testing

### Manual Testing with curl

```bash
# Create simulation
curl -X POST http://localhost:8080/api/simulation/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","speed":1.0}'

# Get roads (replace {id} with simulation ID)
curl http://localhost:8080/api/simulation/{id}/roads

# Export PDF
curl -X POST http://localhost:8080/api/export/pdf \
  -H "Content-Type: application/json" \
  -d @analytics-data.json \
  --output report.pdf
```

## Production Deployment

### 1. Build Production JAR

```bash
mvn clean package -DskipTests
```

Output: `target/smart-traffic-backend-1.0.0.jar`

### 2. Environment Variables

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://production-db:5432/smart_traffic_db
export SPRING_DATASOURCE_USERNAME=prod_user
export SPRING_DATASOURCE_PASSWORD=secure_password
export CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 3. Run in Production

```bash
java -jar -Dspring.profiles.active=prod target/smart-traffic-backend-1.0.0.jar
```

### Docker Deployment

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/smart-traffic-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
docker build -t smart-traffic-backend .
docker run -p 8080:8080 smart-traffic-backend
```

## Monitoring & Logging

Logs are output to console by default. Configure in `application.yml`:

```yaml
logging:
  level:
    com.smarttraffic: DEBUG
    org.springframework: INFO
  file:
    name: logs/smart-traffic.log
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in application.yml
server:
  port: 8081
```

### Database Connection Failed

**For PostgreSQL:**
- Verify PostgreSQL is running: `pg_isready` or `sudo systemctl status postgresql`
- Check credentials in `application.yml`
- Ensure database exists:
  ```bash
  psql -U postgres
  \l
  ```
- Check PostgreSQL is listening on port 5432: `netstat -an | grep 5432` or `ss -an | grep 5432`
- Verify user has proper permissions:
  ```sql
  \du                                           # List users
  \l smart_traffic_db                          # Show database
  ```
- Check pg_hba.conf for authentication settings (location: `/etc/postgresql/*/main/pg_hba.conf`)
- Restart PostgreSQL after config changes: `sudo systemctl restart postgresql`

**For MySQL (Alternative):**
- Verify MySQL is running: `sudo systemctl status mysql` (Linux) or `brew services list` (macOS)
- Check credentials in `application.yml`
- Ensure database exists:
  ```bash
  mysql -u root -p
  SHOW DATABASES;
  ```

### WebSocket Connection Failed
- Ensure CORS is configured correctly
- Check browser console for errors
- Verify WebSocket endpoint: `ws://localhost:8080/ws`

## Next Steps

1. **Real OpenCV Integration**: Replace simulated vehicle detection with actual OpenCV + YOLO processing
2. **Authentication**: Add Spring Security for user authentication
3. **API Documentation**: Integrate Swagger/OpenAPI for interactive API docs
4. **Performance Optimization**: Add caching (Redis), database connection pooling
5. **Monitoring**: Integrate Actuator for health checks and metrics

## License

Copyright © 2024 Smart Traffic Simulator. All rights reserved.

## Contact

For issues and support, please open a GitHub issue or contact the development team.
