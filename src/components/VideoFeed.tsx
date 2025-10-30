import { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { VideoIcon, Camera, Activity } from 'lucide-react';
import type { DetectedVehicle } from '../lib/vehicleDetection';

interface VideoFeedProps {
  roadName: string;
  detectedVehicles: DetectedVehicle[];
  vehicleCount: number;
  queueLength: number;
  averageSpeed: number;
  flowRate: number;
}

export function VideoFeed({
  roadName,
  detectedVehicles,
  vehicleCount,
  queueLength,
  averageSpeed,
  flowRate,
}: VideoFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLive, setIsLive] = useState(true);

  // Simulate video feed with detected vehicles overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw simulated video frame (traffic camera view)
    const drawFrame = () => {
      // Background (road scene)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road lanes
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.5);
      ctx.lineTo(canvas.width, canvas.height * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw detected vehicles with bounding boxes
      detectedVehicles.forEach((vehicle) => {
        const x = vehicle.bbox.x * canvas.width;
        const y = vehicle.bbox.y * canvas.height;
        const w = vehicle.bbox.width * canvas.width;
        const h = vehicle.bbox.height * canvas.height;

        // Vehicle representation (filled rectangle)
        ctx.fillStyle = getVehicleColor(vehicle.type);
        ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

        // Bounding box (YOLO style)
        ctx.strokeStyle = vehicle.speed < 10 ? '#ef4444' : '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Label background
        const label = `${vehicle.type} ${(vehicle.confidence * 100).toFixed(0)}%`;
        const labelWidth = ctx.measureText(label).width + 8;
        ctx.fillStyle = vehicle.speed < 10 ? '#ef4444' : '#22c55e';
        ctx.fillRect(x, y - 20, labelWidth, 20);

        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.fillText(label, x + 4, y - 6);

        // Speed indicator
        if (vehicle.speed > 0) {
          const speedLabel = `${vehicle.speed.toFixed(0)} km/h`;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(x, y + h, 70, 18);
          ctx.fillStyle = '#fbbf24';
          ctx.font = '11px monospace';
          ctx.fillText(speedLabel, x + 4, y + h + 13);
        }
      });

      // Live indicator
      ctx.fillStyle = isLive ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.arc(15, 15, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('LIVE', 28, 20);

      // Timestamp
      const time = new Date().toLocaleTimeString();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(canvas.width - 100, 5, 95, 20);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '12px monospace';
      ctx.fillText(time, canvas.width - 95, 18);
    };

    drawFrame();

    // Animate at 30 FPS
    const animationId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationId);
  }, [detectedVehicles, isLive]);

  return (
    <Card className="overflow-hidden bg-card border-primary/20">
      {/* Video Feed Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">AI Camera - {roadName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? 'default' : 'destructive'} className="text-xs">
            <Activity className="w-3 h-3 mr-1" />
            {isLive ? 'LIVE' : 'OFFLINE'}
          </Badge>
        </div>
      </div>

      {/* Video Canvas */}
      <div className="relative bg-background-dark">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-auto"
        />
        
        {/* Detection Overlay Info */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-2">
          <div className="flex-1 bg-background/90 backdrop-blur-sm rounded-lg p-2 border border-primary/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Vehicles</span>
              <span className="font-bold text-primary">{vehicleCount}</span>
            </div>
          </div>
          <div className="flex-1 bg-background/90 backdrop-blur-sm rounded-lg p-2 border border-warning/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Queue</span>
              <span className="font-bold text-warning">{queueLength}</span>
            </div>
          </div>
          <div className="flex-1 bg-background/90 backdrop-blur-sm rounded-lg p-2 border border-success/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Speed</span>
              <span className="font-bold text-success">{averageSpeed.toFixed(0)} km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Footer */}
      <div className="bg-muted/30 p-2 border-t border-primary/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <VideoIcon className="w-3 h-3" />
          <span>YOLO v8 Detection</span>
        </div>
        <div className="font-mono text-primary">
          {flowRate.toFixed(0)} veh/min
        </div>
      </div>
    </Card>
  );
}

function getVehicleColor(type: string): string {
  const colors: Record<string, string> = {
    car: '#3b82f6',
    truck: '#f59e0b',
    bus: '#10b981',
    motorcycle: '#8b5cf6',
    bicycle: '#ec4899',
  };
  return colors[type] || '#6b7280';
}
