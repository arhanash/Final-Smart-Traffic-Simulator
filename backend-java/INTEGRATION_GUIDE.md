# Frontend-Backend Integration Guide

## Overview

This guide explains how to migrate your React frontend from Blink SDK to the Java Spring Boot backend.

## Architecture Change

**Before (Blink SDK):**
```
React Frontend → Blink SDK → Blink Cloud Services
```

**After (Java Backend):**
```
React Frontend → REST APIs + WebSocket → Java Spring Boot → PostgreSQL
```

## Step-by-Step Migration

### 1. Environment Setup

Create `.env` file in React project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

### 2. Create API Client

**File: `src/lib/apiClient.ts`**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = {
  // Simulation APIs
  async createSimulation(userId: string, speed: number) {
    const response = await fetch(`${API_BASE_URL}/simulation/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, speed })
    });
    return response.json();
  },

  async tick(simulationId: string, deltaTime: number = 1.0) {
    await fetch(`${API_BASE_URL}/simulation/${simulationId}/tick?deltaTime=${deltaTime}`, {
      method: 'POST'
    });
  },

  async getRoads(simulationId: string) {
    const response = await fetch(`${API_BASE_URL}/simulation/${simulationId}/roads`);
    return response.json();
  },

  async getStats(simulationId: string) {
    const response = await fetch(`${API_BASE_URL}/simulation/${simulationId}/stats`);
    return response.json();
  },

  async setEmergencyOverride(simulationId: string, override: EmergencyOverrideDTO) {
    await fetch(`${API_BASE_URL}/simulation/${simulationId}/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(override)
    });
  },

  async clearEmergencyOverride(simulationId: string) {
    await fetch(`${API_BASE_URL}/simulation/${simulationId}/emergency`, {
      method: 'DELETE'
    });
  },

  async updateRoadFromVideo(simulationId: string, roadName: string, videoData: any) {
    await fetch(`${API_BASE_URL}/simulation/${simulationId}/road/${roadName}/video-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoData)
    });
  },

  async pauseSimulation(simulationId: string) {
    await fetch(`${API_BASE_URL}/simulation/${simulationId}/pause`, { method: 'POST' });
  },

  async resumeSimulation(simulationId: string) {
    await fetch(`${API_BASE_URL}/simulation/${simulationId}/resume`, { method: 'POST' });
  },

  async stopSimulation(simulationId: string) {
    await fetch(`${API_BASE_URL}/simulation/${simulationId}/stop`, { method: 'POST' });
  },

  // Export APIs
  async exportPdf(analyticsData: any) {
    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsData)
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-report-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportExcel(analyticsData: any) {
    const response = await fetch(`${API_BASE_URL}/export/excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsData)
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-report-${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportCsv(analyticsData: any) {
    const response = await fetch(`${API_BASE_URL}/export/csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsData)
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
```

### 3. WebSocket Integration

**File: `src/lib/websocketClient.ts`**

```typescript
import SockJS from 'sockjs-client';
import { Stomp, CompatClient } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class WebSocketClient {
  private stompClient: CompatClient | null = null;
  private subscriptions: Map<string, any> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new SockJS(WS_URL);
      this.stompClient = Stomp.over(socket);
      
      this.stompClient.connect({}, 
        () => {
          console.log('WebSocket connected');
          resolve();
        },
        (error: any) => {
          console.error('WebSocket connection error:', error);
          reject(error);
        }
      );
    });
  }

  subscribeToRoadAnalytics(roadName: string, callback: (analytics: any) => void) {
    if (!this.stompClient) {
      throw new Error('WebSocket not connected');
    }

    const subscription = this.stompClient.subscribe(
      `/topic/video-analytics/${roadName}`,
      (message) => {
        const analytics = JSON.parse(message.body);
        callback(analytics);
      }
    );

    this.subscriptions.set(roadName, subscription);
  }

  startDetection(roadName: string) {
    if (!this.stompClient) {
      throw new Error('WebSocket not connected');
    }
    this.stompClient.send(`/app/start-detection/${roadName}`, {}, {});
  }

  stopDetection(roadName: string) {
    if (!this.stompClient) return;
    
    this.stompClient.send(`/app/stop-detection/${roadName}`, {}, {});
    
    const subscription = this.subscriptions.get(roadName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roadName);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.stompClient.disconnect();
    }
  }
}

export const wsClient = new WebSocketClient();
```

### 4. Update Dashboard Component

**File: `src/pages/Dashboard.tsx`**

Replace Blink SDK calls with API client:

```typescript
import { useEffect, useState, useRef } from 'react';
import { apiClient } from '../lib/apiClient';
import { wsClient } from '../lib/websocketClient';

function Dashboard() {
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [roads, setRoads] = useState([]);
  const [stats, setStats] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Initialize simulation
  useEffect(() => {
    const initSimulation = async () => {
      const simulation = await apiClient.createSimulation('user123', 1.0);
      setSimulationId(simulation.id);
      
      // Connect WebSocket
      await wsClient.connect();
      
      // Subscribe to video analytics for all roads
      ['Road A', 'Road B', 'Road C', 'Road D'].forEach(roadName => {
        wsClient.subscribeToRoadAnalytics(roadName, (analytics) => {
          // Update simulation with video data
          if (simulationId) {
            apiClient.updateRoadFromVideo(simulationId, roadName, analytics);
          }
        });
      });
    };

    initSimulation();

    return () => {
      if (simulationId) {
        apiClient.stopSimulation(simulationId);
      }
      wsClient.disconnect();
    };
  }, []);

  // Start simulation
  const startSimulation = () => {
    if (!simulationId) return;
    
    setIsRunning(true);
    
    // Start video detection
    ['Road A', 'Road B', 'Road C', 'Road D'].forEach(roadName => {
      wsClient.startDetection(roadName);
    });
    
    // Start simulation tick loop
    intervalRef.current = window.setInterval(async () => {
      await apiClient.tick(simulationId, 1.0);
      
      // Fetch updated state
      const updatedRoads = await apiClient.getRoads(simulationId);
      const updatedStats = await apiClient.getStats(simulationId);
      
      setRoads(updatedRoads);
      setStats(updatedStats);
    }, 1000);
  };

  // Pause simulation
  const pauseSimulation = () => {
    if (!simulationId || !intervalRef.current) return;
    
    setIsRunning(false);
    clearInterval(intervalRef.current);
    
    apiClient.pauseSimulation(simulationId);
    
    // Stop video detection
    ['Road A', 'Road B', 'Road C', 'Road D'].forEach(roadName => {
      wsClient.stopDetection(roadName);
    });
  };

  // Emergency override
  const handleEmergency = async (road: string, vehicleType: string) => {
    if (!simulationId) return;
    
    await apiClient.setEmergencyOverride(simulationId, {
      road,
      vehicleType,
      active: true
    });
  };

  // Export reports
  const handleExportPdf = async () => {
    const analyticsData = {
      systemEfficiency: stats.efficiency,
      avgWaitTime: stats.avgWaitTime,
      totalThroughput: stats.totalProcessed,
      emergencyEvents: 0,
      roadPerformance: roads.map(road => ({
        roadName: road.name,
        vehicles: road.vehicles,
        waitTime: road.waitTime,
        efficiency: road.performance,
        queueLength: road.queue,
        peakTraffic: '08:30'
      })),
      recommendations: []
    };
    
    await apiClient.exportPdf(analyticsData);
  };

  return (
    <div>
      {/* Your existing UI components */}
      <button onClick={isRunning ? pauseSimulation : startSimulation}>
        {isRunning ? 'Pause' : 'Start'} Simulation
      </button>
      
      <button onClick={handleExportPdf}>Export PDF</button>
      
      {/* Render roads and stats */}
    </div>
  );
}

export default Dashboard;
```

### 5. Install Required Dependencies

```bash
npm install sockjs-client @stomp/stompjs
npm install --save-dev @types/sockjs-client
```

### 6. Update Export Utilities

Replace the existing export functions in `src/utils/exportUtils.ts`:

```typescript
import { apiClient } from '../lib/apiClient';

export const exportToPDF = async (data: any) => {
  await apiClient.exportPdf(data);
};

export const exportToExcel = async (data: any) => {
  await apiClient.exportExcel(data);
};

export const exportToCSV = async (data: any) => {
  await apiClient.exportCsv(data);
};

export const exportToJSON = (data: any) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traffic-data-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

## API Mapping Reference

| Blink SDK | Java Backend API |
|-----------|------------------|
| `blink.db.simulationRuns.create()` | `POST /api/simulation/create` |
| `blink.db.trafficEvents.create()` | `POST /api/simulation/{id}/emergency` |
| `blink.db.roadPerformance.list()` | `GET /api/simulation/{id}/roads` |
| Export JSON | `POST /api/export/pdf\|excel\|csv` |

## Testing the Integration

### 1. Setup PostgreSQL Database

Follow the instructions in `backend-java/README.md` to install and configure PostgreSQL:

```bash
# Create the database using the provided script
sudo -u postgres psql < backend-java/database-setup-postgresql.sql

# Or manually:
sudo -u postgres psql
CREATE DATABASE smart_traffic_db
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;
\q
```

Update `backend-java/src/main/resources/application.yml` with your PostgreSQL credentials.

### 2. Start Java Backend

```bash
cd backend-java
mvn spring-boot:run
```

Verify: http://localhost:8080/api

### 2. Start React Frontend

```bash
npm run dev
```

Verify: http://localhost:5173

### 3. Test Flow

1. Open browser to http://localhost:5173
2. Open browser console
3. Click "Start Simulation"
4. Verify WebSocket messages: "WebSocket connected"
5. Check traffic lights changing
6. Test emergency override
7. Export PDF/Excel/CSV reports

## Common Issues

### CORS Error
- Ensure Java backend has CORS configured for frontend origin
- Check `application.yml` → `cors.allowed-origins`

### WebSocket Connection Failed
- Verify WebSocket URL is correct
- Check browser console for connection errors
- Ensure SockJS library is installed

### 404 Not Found
- Verify API base URL includes `/api` context path
- Check Java backend is running on port 8080

### Export Download Not Working
- Check Content-Type headers in response
- Verify blob creation and URL handling

## Production Deployment

### Environment Variables

**Frontend (.env.production):**
```env
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_WS_URL=https://api.your-domain.com/ws
```

**Backend (application-prod.yml):**
```yaml
cors:
  allowed-origins: https://your-frontend-domain.com
spring:
  datasource:
    url: jdbc:postgresql://production-db:5432/smart_traffic_db?ssl=true
    username: production_user
    password: ${DB_PASSWORD}  # Use environment variable
```

## Next Steps

1. **Authentication**: Add JWT authentication to secure APIs
2. **Real OpenCV**: Replace simulated detection with actual video processing
3. **Load Balancing**: Deploy multiple backend instances with load balancer
4. **Monitoring**: Add logging, metrics, and health checks
5. **Performance**: Implement caching (Redis) for frequently accessed data

## Support

For integration issues, check:
- Backend logs: `logs/smart-traffic.log`
- Frontend console: Browser DevTools → Console
- Network tab: Verify API calls and responses

---

**Migration Complete!** Your React frontend is now connected to the Java Spring Boot backend with full feature parity.
