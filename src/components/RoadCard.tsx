import { Car, Clock, AlertCircle, Activity } from 'lucide-react';
import type { Road } from '../lib/types';
import { TrafficLight } from './TrafficLight';
import { VideoFeed } from './VideoFeed';
import type { VideoAnalytics } from '../lib/vehicleDetection';

interface RoadCardProps {
  road: Road;
  position: 'north' | 'east' | 'south' | 'west';
  videoAnalytics?: VideoAnalytics;
}

export function RoadCard({ road, position, videoAnalytics }: RoadCardProps) {
  const positionClasses = {
    north: 'col-start-2 row-start-1',
    east: 'col-start-3 row-start-2',
    south: 'col-start-2 row-start-3',
    west: 'col-start-1 row-start-2'
  };

  const signalColor = road.light === 'red' ? 'text-red-500' : road.light === 'green' ? 'text-green-500' : 'text-yellow-500';

  // Use video analytics if available, otherwise use simulation data
  const displayVehicles = videoAnalytics?.vehicleCount ?? road.vehicles;
  const displayQueue = videoAnalytics?.queueLength ?? road.queue;
  const hasLiveData = !!videoAnalytics;

  return (
    <div className={`${positionClasses[position]} bg-card border border-primary/20 rounded-lg overflow-hidden shadow-sm`}>
      {/* Road Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 border-b border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="font-semibold text-sm">{road.direction} Road</h3>
              {hasLiveData && (
                <Activity className="w-3 h-3 text-success animate-pulse" title="Live AI Detection" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{road.name}</p>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${signalColor} bg-secondary/50`}>
            {road.light.charAt(0).toUpperCase() + road.light.slice(1)}
          </div>
        </div>
      </div>

      {/* Video Feed Section */}
      {videoAnalytics && (
        <div className="p-3 border-b border-primary/10">
          <VideoFeed
            roadName={road.name}
            detectedVehicles={videoAnalytics.detectedVehicles}
            vehicleCount={videoAnalytics.vehicleCount}
            queueLength={videoAnalytics.queueLength}
            averageSpeed={videoAnalytics.averageSpeed}
            flowRate={videoAnalytics.flowRate}
          />
        </div>
      )}

      {/* Road Stats Section */}
      <div className="p-4">
        <div className="flex justify-center mb-3">
          <TrafficLight signal={road.light} size="md" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Car className="w-3 h-3 text-primary" />
            <span className="font-medium text-foreground">{displayVehicles}</span>
            {hasLiveData && <span className="text-[10px] text-success">(AI)</span>}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3 text-yellow-500" />
            <span className="font-medium text-foreground">{displayQueue}</span>
            {hasLiveData && <span className="text-[10px] text-success">(AI)</span>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Queue Visual</span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(displayQueue, 10) }).map((_, i) => (
              <div key={i} className="h-2 flex-1 bg-primary rounded-sm" />
            ))}
            {displayQueue > 10 && (
              <span className="text-xs text-muted-foreground ml-1">+{displayQueue - 10}</span>
            )}
          </div>
        </div>

        {videoAnalytics && (
          <div className="mt-3 p-2 bg-success/10 rounded border border-success/20">
            <div className="text-xs text-success font-medium flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Avg Speed: {videoAnalytics.averageSpeed.toFixed(1)} km/h
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
