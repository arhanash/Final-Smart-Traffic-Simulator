import type { Road, RoadDirection, TrafficStats, EmergencyOverride, LightStatus } from './types';

export class TrafficSimulationEngine {
  private roads: Road[];
  private currentCycle: number = 0;
  private cycleLength: number = 60; // seconds per full cycle
  private emergencyOverride: EmergencyOverride | null = null;
  private totalProcessed: number = 0;
  private stats: TrafficStats;

  constructor() {
    this.roads = this.initializeRoads();
    this.stats = {
      totalProcessed: 0,
      avgWaitTime: 0,
      throughput: 20,
      efficiency: 84
    };
  }

  private initializeRoads(): Road[] {
    const roadConfigs: { name: string; direction: RoadDirection }[] = [
      { name: 'Road A', direction: 'North' },
      { name: 'Road B', direction: 'East' },
      { name: 'Road C', direction: 'South' },
      { name: 'Road D', direction: 'West' }
    ];

    return roadConfigs.map(config => ({
      name: config.name,
      direction: config.direction,
      light: 'red' as LightStatus,
      vehicles: Math.floor(Math.random() * 10) + 10,
      queue: Math.floor(Math.random() * 10) + 10,
      waitTime: Math.floor(Math.random() * 30) + 30,
      performance: Math.floor(Math.random() * 20) + 75
    }));
  }

  tick(deltaTime: number): void {
    this.currentCycle += deltaTime;

    if (this.emergencyOverride?.active) {
      this.handleEmergencyOverride();
    } else {
      this.updateTrafficLights();
    }

    this.simulateTraffic();
    this.updateStats();
  }

  private handleEmergencyOverride(): void {
    if (!this.emergencyOverride) return;

    this.roads.forEach(road => {
      if (road.direction === this.emergencyOverride!.road) {
        road.light = 'green';
        // Clear emergency road faster
        if (road.vehicles > 0) {
          road.vehicles = Math.max(0, road.vehicles - 2);
        }
        if (road.queue > 0) {
          road.queue = Math.max(0, road.queue - 2);
        }
      } else {
        road.light = 'red';
        // Build up other roads
        if (Math.random() > 0.7) {
          road.vehicles += 1;
          road.queue += 1;
        }
      }
    });
  }

  private updateTrafficLights(): void {
    const cyclePosition = this.currentCycle % this.cycleLength;
    const quarterCycle = this.cycleLength / 4;

    this.roads.forEach((road, index) => {
      const roadStart = index * quarterCycle;
      const roadEnd = roadStart + quarterCycle;
      const transitionTime = 3; // seconds for yellow light

      if (cyclePosition >= roadStart && cyclePosition < roadEnd - transitionTime) {
        road.light = 'green';
      } else if (cyclePosition >= roadEnd - transitionTime && cyclePosition < roadEnd) {
        road.light = 'yellow';
      } else {
        road.light = 'red';
      }
    });
  }

  private simulateTraffic(): void {
    this.roads.forEach(road => {
      if (road.light === 'green') {
        // Process vehicles
        if (road.queue > 0) {
          const processed = Math.min(Math.floor(Math.random() * 3) + 1, road.queue);
          road.queue -= processed;
          road.vehicles = Math.max(0, road.vehicles - processed);
          this.totalProcessed += processed;
        }
        
        // Reduce wait time
        road.waitTime = Math.max(20, road.waitTime - Math.floor(Math.random() * 5));
      } else {
        // Add new vehicles
        if (Math.random() > 0.5) {
          road.vehicles += Math.floor(Math.random() * 2);
          road.queue += Math.floor(Math.random() * 2);
        }
        
        // Increase wait time
        road.waitTime = Math.min(80, road.waitTime + Math.floor(Math.random() * 3));
      }

      // Update performance based on queue and wait time
      const queuePenalty = Math.min(road.queue * 2, 30);
      const waitPenalty = Math.min((road.waitTime - 30) / 2, 20);
      road.performance = Math.max(50, Math.min(98, 100 - queuePenalty - waitPenalty));
    });
  }

  private updateStats(): void {
    const totalWaitTime = this.roads.reduce((sum, road) => sum + road.waitTime, 0);
    const avgWaitTime = totalWaitTime / this.roads.length;
    const avgPerformance = this.roads.reduce((sum, road) => sum + road.performance, 0) / this.roads.length;

    this.stats = {
      totalProcessed: this.totalProcessed,
      avgWaitTime: Math.round(avgWaitTime),
      throughput: Math.floor(this.totalProcessed / (this.currentCycle / 60) || 20),
      efficiency: Math.round(avgPerformance)
    };
  }

  setEmergencyOverride(override: EmergencyOverride): void {
    this.emergencyOverride = override;
  }

  clearEmergencyOverride(): void {
    this.emergencyOverride = null;
  }

  getRoads(): Road[] {
    return this.roads;
  }

  getStats(): TrafficStats {
    return this.stats;
  }

  // Update road data from video analytics for adaptive signal timing
  updateRoadFromVideo(roadName: string, videoData: {
    vehicleCount: number;
    queueLength: number;
    recommendedGreenTime: number;
  }): void {
    const road = this.roads.find(r => r.name === roadName);
    if (!road) return;

    // Use AI-detected vehicle and queue data
    road.vehicles = videoData.vehicleCount;
    road.queue = videoData.queueLength;

    // Dynamically adjust cycle length based on traffic density
    // High traffic → longer green time for that road
    const trafficDensity = videoData.vehicleCount + (videoData.queueLength * 2);
    
    if (trafficDensity > 20) {
      // Critical density - extend cycle
      this.cycleLength = Math.min(90, this.cycleLength + 1);
    } else if (trafficDensity < 10) {
      // Low density - reduce cycle
      this.cycleLength = Math.max(45, this.cycleLength - 1);
    }

    // Update performance based on real-time data
    const queuePenalty = Math.min(videoData.queueLength * 2, 30);
    const densityPenalty = Math.min(videoData.vehicleCount, 20);
    road.performance = Math.max(50, Math.min(98, 100 - queuePenalty - densityPenalty));
  }
}
