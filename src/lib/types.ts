export type LightStatus = 'red' | 'yellow' | 'green';
export type RoadDirection = 'North' | 'East' | 'South' | 'West';
export type VehicleType = 'ambulance' | 'fire_truck' | 'police';
export type SimulationStatus = 'inactive' | 'running' | 'paused';

export interface Road {
  name: string;
  direction: RoadDirection;
  light: LightStatus;
  vehicles: number;
  queue: number;
  waitTime: number;
  performance: number;
}

export interface TrafficStats {
  totalProcessed: number;
  avgWaitTime: number;
  throughput: number;
  efficiency: number;
}

export interface EmergencyOverride {
  road: RoadDirection;
  vehicleType: VehicleType;
  active: boolean;
}
