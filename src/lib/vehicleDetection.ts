// AI-powered vehicle detection using computer vision (YOLO simulation)
// In production, this would integrate with OpenCV + YOLO model via backend API

export interface DetectedVehicle {
  id: string;
  type: 'car' | 'truck' | 'bus' | 'motorcycle' | 'bicycle';
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  speed: number; // km/h
  timestamp: number;
}

export interface VideoAnalytics {
  roadName: string;
  vehicleCount: number;
  queueLength: number;
  averageSpeed: number;
  detectedVehicles: DetectedVehicle[];
  timestamp: number;
  flowRate: number; // vehicles per minute
}

// Simulates YOLO object detection on video frames
class VehicleDetectionService {
  private detectionIntervals: Map<string, number> = new Map();
  private callbacks: Map<string, (analytics: VideoAnalytics) => void> = new Map();

  // Vehicle type probabilities
  private vehicleTypes: ('car' | 'truck' | 'bus' | 'motorcycle' | 'bicycle')[] = [
    'car', 'car', 'car', 'car', 'car', // 50% cars
    'truck', 'truck', // 20% trucks
    'bus', // 10% bus
    'motorcycle', 'bicycle' // 20% motorcycle/bicycle
  ];

  // Simulate real-time vehicle detection for a road
  startDetection(roadName: string, callback: (analytics: VideoAnalytics) => void): void {
    // Stop existing detection if running
    this.stopDetection(roadName);

    this.callbacks.set(roadName, callback);

    // Run detection every 500ms (simulating 2 FPS processing)
    const intervalId = window.setInterval(() => {
      const analytics = this.detectVehicles(roadName);
      callback(analytics);
    }, 500);

    this.detectionIntervals.set(roadName, intervalId);
  }

  stopDetection(roadName: string): void {
    const intervalId = this.detectionIntervals.get(roadName);
    if (intervalId) {
      clearInterval(intervalId);
      this.detectionIntervals.delete(roadName);
      this.callbacks.delete(roadName);
    }
  }

  stopAllDetections(): void {
    this.detectionIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.detectionIntervals.clear();
    this.callbacks.clear();
  }

  // Simulate YOLO detection on current video frame
  private detectVehicles(roadName: string): VideoAnalytics {
    const timestamp = Date.now();
    
    // Simulate varying traffic density (0-15 vehicles per frame)
    const vehicleCount = Math.floor(Math.random() * 16);
    
    const detectedVehicles: DetectedVehicle[] = [];
    
    for (let i = 0; i < vehicleCount; i++) {
      // Random vehicle type
      const type = this.vehicleTypes[Math.floor(Math.random() * this.vehicleTypes.length)];
      
      // Random bounding box (normalized coordinates 0-1)
      const bbox = {
        x: Math.random() * 0.8,
        y: Math.random() * 0.8,
        width: 0.05 + Math.random() * 0.15, // 5-20% of frame width
        height: 0.05 + Math.random() * 0.15, // 5-20% of frame height
      };
      
      // YOLO confidence score (0.5-0.99)
      const confidence = 0.5 + Math.random() * 0.49;
      
      // Simulated speed (0-80 km/h)
      const speed = Math.random() * 80;
      
      detectedVehicles.push({
        id: `${roadName}-vehicle-${timestamp}-${i}`,
        type,
        confidence,
        bbox,
        speed,
        timestamp,
      });
    }

    // Calculate queue length (vehicles with low speed < 10 km/h)
    const queueLength = detectedVehicles.filter(v => v.speed < 10).length;
    
    // Calculate average speed
    const averageSpeed = vehicleCount > 0
      ? detectedVehicles.reduce((sum, v) => sum + v.speed, 0) / vehicleCount
      : 0;
    
    // Flow rate: vehicles per minute (extrapolate from current detection)
    const flowRate = vehicleCount * 2 * 60; // 2 detections per second * 60 seconds

    return {
      roadName,
      vehicleCount,
      queueLength,
      averageSpeed,
      detectedVehicles,
      timestamp,
      flowRate,
    };
  }

  // Analyze traffic density and recommend signal timing
  analyzeTrafficDensity(analytics: VideoAnalytics): {
    density: 'low' | 'medium' | 'high' | 'critical';
    recommendedGreenTime: number; // seconds
    urgency: number; // 0-100
  } {
    const { vehicleCount, queueLength, averageSpeed } = analytics;
    
    // Calculate traffic density score
    const densityScore = (vehicleCount * 2) + (queueLength * 3) + ((50 - averageSpeed) / 10);
    
    let density: 'low' | 'medium' | 'high' | 'critical';
    let recommendedGreenTime: number;
    let urgency: number;
    
    if (densityScore < 10) {
      density = 'low';
      recommendedGreenTime = 15;
      urgency = 20;
    } else if (densityScore < 25) {
      density = 'medium';
      recommendedGreenTime = 25;
      urgency = 50;
    } else if (densityScore < 40) {
      density = 'high';
      recommendedGreenTime = 35;
      urgency = 75;
    } else {
      density = 'critical';
      recommendedGreenTime = 45;
      urgency = 95;
    }
    
    return { density, recommendedGreenTime, urgency };
  }
}

// Singleton instance
export const vehicleDetectionService = new VehicleDetectionService();
