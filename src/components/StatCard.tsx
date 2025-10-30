import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
}

export function StatCard({ icon: Icon, label, value, trend, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
