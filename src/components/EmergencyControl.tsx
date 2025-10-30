import { useState } from 'react';
import { AlertTriangle, Ambulance, Flame, Shield, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import type { RoadDirection, VehicleType } from '../lib/types';

interface EmergencyControlProps {
  onActivate: (road: RoadDirection, vehicleType: VehicleType) => void;
  isActive: boolean;
}

export function EmergencyControl({ onActivate, isActive }: EmergencyControlProps) {
  const [selectedRoad, setSelectedRoad] = useState<RoadDirection | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);

  const roads: { direction: RoadDirection; label: string; icon: string }[] = [
    { direction: 'North', label: 'Road A\nNorth Road', icon: '↑' },
    { direction: 'East', label: 'Road B\nEast Road', icon: '→' },
    { direction: 'South', label: 'Road C\nSouth Road', icon: '↓' },
    { direction: 'West', label: 'Road D\nWest Road', icon: '←' }
  ];

  const vehicles: { type: VehicleType; icon: typeof Ambulance; label: string }[] = [
    { type: 'Ambulance', icon: Ambulance, label: 'Ambulance' },
    { type: 'Fire Truck', icon: Flame, label: 'Fire Truck' },
    { type: 'Police', icon: Shield, label: 'Police' }
  ];

  const handleActivate = () => {
    if (selectedRoad && selectedVehicle) {
      onActivate(selectedRoad, selectedVehicle);
    }
  };

  return (
    <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Emergency Override</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Priority vehicle signal control</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Emergency Road</label>
          <div className="grid grid-cols-2 gap-2">
            {roads.map((road) => (
              <button
                key={road.direction}
                onClick={() => setSelectedRoad(road.direction)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  selectedRoad === road.direction
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <div className="text-2xl mb-1">{road.icon}</div>
                <div className="whitespace-pre-line text-xs">{road.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Emergency Vehicle Type</label>
          <div className="grid grid-cols-3 gap-2">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.type}
                onClick={() => setSelectedVehicle(vehicle.type)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-2 ${
                  selectedVehicle === vehicle.type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <vehicle.icon className="w-6 h-6" />
                <span className="text-xs">{vehicle.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleActivate}
          disabled={!selectedRoad || !selectedVehicle || isActive}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          {isActive ? 'Emergency Active' : 'Activate Emergency Override'}
        </Button>

        {isActive && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div className="text-xs text-red-700">
                <p className="font-medium mb-1">This will immediately give green light to Road {selectedRoad} and stop all other traffic.</p>
                <ul className="list-disc list-inside space-y-0.5 text-red-600">
                  <li>Selected road gets immediate green light</li>
                  <li>All other roads to red immediately</li>
                  <li>Normal cycle resumes after clearing override</li>
                  <li>Emergency vehicles have absolute priority</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Emergency Protocol</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Selected road gets immediate green light</li>
                <li>All other roads to red immediately</li>
                <li>Normal cycle resumes after clearing override</li>
                <li>Emergency vehicles have absolute priority</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
