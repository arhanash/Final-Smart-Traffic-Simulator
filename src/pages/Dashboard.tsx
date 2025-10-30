import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Download, Gauge, Clock, TrendingUp, AlertTriangle, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { RoadCard } from '../components/RoadCard';
import { EmergencyControl } from '../components/EmergencyControl';
import { StatCard } from '../components/StatCard';
import { TrafficSimulationEngine } from '../lib/simulationEngine';
import type { RoadDirection, VehicleType, SimulationStatus } from '../lib/types';
import { db } from '../lib/supabase';
import { vehicleDetectionService, type VideoAnalytics } from '../lib/vehicleDetection';

export function Dashboard() {
  const engineRef = useRef<TrafficSimulationEngine>(new TrafficSimulationEngine());
  const [status, setStatus] = useState<SimulationStatus>('inactive');
  const [speed, setSpeed] = useState(1);
  const [cyclesCompleted, setcyclesCompleted] = useState(0);
  const [roads, setRoads] = useState(engineRef.current.getRoads());
  const [stats, setStats] = useState(engineRef.current.getStats());
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyRoad, setEmergencyRoad] = useState<RoadDirection | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Video detection state
  const [videoDetectionEnabled, setVideoDetectionEnabled] = useState(true);
  const [videoAnalytics, setVideoAnalytics] = useState<Map<string, VideoAnalytics>>(new Map());

  // Start/stop video detection based on simulation status
  useEffect(() => {
    if (status === 'running' && videoDetectionEnabled) {
      // Start AI detection for all roads
      roads.forEach((road) => {
        vehicleDetectionService.startDetection(road.name, (analytics) => {
          setVideoAnalytics(prev => new Map(prev).set(road.name, analytics));
          
          // Apply AI-detected data to simulation engine for adaptive signal timing
          const densityAnalysis = vehicleDetectionService.analyzeTrafficDensity(analytics);
          
          // Update simulation with real-time data
          engineRef.current.updateRoadFromVideo(road.name, {
            vehicleCount: analytics.vehicleCount,
            queueLength: analytics.queueLength,
            recommendedGreenTime: densityAnalysis.recommendedGreenTime
          });
        });
      });
    } else {
      // Stop all detections when paused/inactive
      vehicleDetectionService.stopAllDetections();
    }

    return () => {
      vehicleDetectionService.stopAllDetections();
    };
  }, [status, videoDetectionEnabled, roads.length]);

  useEffect(() => {
    if (status !== 'running') return;

    const interval = setInterval(() => {
      engineRef.current.tick(1 * speed);
      setRoads([...engineRef.current.getRoads()]);
      setStats(engineRef.current.getStats());
      setcyclesCompleted(prev => prev + 1);
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [status, speed]);

  const handleStart = () => {
    setStatus('running');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleReset = () => {
    engineRef.current = new TrafficSimulationEngine();
    setStatus('inactive');
    setSpeed(1);
    setcyclesCompleted(0);
    setRoads(engineRef.current.getRoads());
    setStats(engineRef.current.getStats());
    setEmergencyActive(false);
    setEmergencyRoad(null);
  };

  const handleEmergencyActivate = async (road: RoadDirection, vehicleType: VehicleType) => {
    engineRef.current.setEmergencyOverride({ road, vehicleType, active: true });
    setEmergencyActive(true);
    setEmergencyRoad(road);
    
    // Save emergency event to Supabase database
    try {
      await db.trafficEvents.create({
        type: 'emergency',
        roadName: road,
        vehicleType: vehicleType,
        description: `Emergency override activated for ${vehicleType} on ${road} Road`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save emergency event:', error);
    }
  };

  const handleEmergencyClear = () => {
    engineRef.current.clearEmergencyOverride();
    setEmergencyActive(false);
    setEmergencyRoad(null);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const handleExportData = async () => {
    const data = {
      timestamp: new Date().toISOString(),
      roads: roads,
      stats: stats,
      cyclesCompleted: cyclesCompleted
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-data-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Smart Traffic Simulator</h1>
            <p className="text-muted-foreground">Traffic Management & Analysis Platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={videoDetectionEnabled ? "default" : "outline"} 
              size="sm" 
              onClick={() => setVideoDetectionEnabled(!videoDetectionEnabled)}
            >
              <Video className="w-4 h-4 mr-2" />
              AI Detection {videoDetectionEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Simulation Controls</h2>
          <p className="text-sm text-muted-foreground mb-4">Manage traffic simulation parameters</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Simulation State</label>
              <div className="flex gap-2">
                {status === 'inactive' || status === 'paused' ? (
                  <Button onClick={handleStart} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Simulation
                  </Button>
                ) : (
                  <Button onClick={handlePause} variant="secondary" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="text-lg font-bold capitalize">{status}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Simulation Speed</label>
              <div className="flex gap-2">
                {[0.5, 1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`flex-1 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      speed === s
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs text-muted-foreground">Speed</div>
                <div className="text-lg font-bold">{speed}x</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Reset Simulation</label>
              <Button onClick={handleReset} variant="outline" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
              <div className="mt-3 text-center">
                <div className="text-xs text-muted-foreground">Cycles</div>
                <div className="text-lg font-bold">{cyclesCompleted}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intersection Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Intersection Overview</h2>
                  <p className="text-sm text-muted-foreground">Real-time traffic light status</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">{status === 'running' ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              {/* Traffic Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <RoadCard 
                  road={roads[0]} 
                  position="north" 
                  videoAnalytics={videoDetectionEnabled ? videoAnalytics.get(roads[0].name) : undefined}
                />
                <RoadCard 
                  road={roads[1]} 
                  position="east" 
                  videoAnalytics={videoDetectionEnabled ? videoAnalytics.get(roads[1].name) : undefined}
                />
                <RoadCard 
                  road={roads[2]} 
                  position="south" 
                  videoAnalytics={videoDetectionEnabled ? videoAnalytics.get(roads[2].name) : undefined}
                />
                <RoadCard 
                  road={roads[3]} 
                  position="west" 
                  videoAnalytics={videoDetectionEnabled ? videoAnalytics.get(roads[3].name) : undefined}
                />
                
                {/* Center Intersection */}
                <div className="col-start-2 row-start-2 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-border bg-secondary flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Intersection</div>
                      <Gauge className="w-8 h-8 mx-auto mt-1 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Stop</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span>Caution</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Go</span>
                </div>
              </div>

              <div className="text-xs text-center text-muted-foreground mt-4">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Emergency Control */}
          <div className="lg:col-span-1">
            <EmergencyControl onActivate={handleEmergencyActivate} isActive={emergencyActive} />
            
            {emergencyActive && (
              <div className="mt-4">
                <Button onClick={handleEmergencyClear} variant="destructive" className="w-full">
                  Clear Emergency Override
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Emergency active on {emergencyRoad} Road
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Traffic Statistics */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Traffic Statistics</h2>
          <p className="text-sm text-muted-foreground mb-4">Real-time performance metrics</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Total Processed"
              value={stats.totalProcessed}
              iconColor="text-blue-500"
            />
            <StatCard
              icon={Clock}
              label="Average Wait Time"
              value={`${stats.avgWaitTime}s`}
              iconColor="text-yellow-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Throughput"
              value={`${stats.throughput}/min`}
              iconColor="text-green-500"
            />
            <StatCard
              icon={Gauge}
              label="Efficiency"
              value={`${stats.efficiency}%`}
              iconColor="text-purple-500"
            />
          </div>
        </div>

        {/* Road Performance */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Road Performance</h2>
          
          <div className="space-y-4">
            {roads.map((road, index) => {
              const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
              const textColors = ['text-blue-500', 'text-yellow-500', 'text-red-500', 'text-purple-500'];
              
              return (
                <div key={road.name} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                      <div>
                        <h3 className="font-semibold text-sm">{road.direction} Road</h3>
                        <p className="text-xs text-muted-foreground">{road.name}</p>
                      </div>
                    </div>
                    <div className={`text-right ${textColors[index]}`}>
                      <div className="text-sm font-bold">{road.performance}%</div>
                      <div className="text-xs">Performance</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Vehicles</div>
                      <div className="font-semibold">{road.vehicles}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Wait Time</div>
                      <div className="font-semibold">{road.waitTime}s</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Queue</div>
                      <div className="font-semibold">{road.queue}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`${colors[index]} h-2 rounded-full transition-all`}
                        style={{ width: `${road.performance}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
