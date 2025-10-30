import type { SignalState } from '../lib/types';

interface TrafficLightProps {
  signal: SignalState;
  size?: 'sm' | 'md' | 'lg';
}

export function TrafficLight({ signal, size = 'md' }: TrafficLightProps) {
  const sizeClasses = {
    sm: 'w-8 h-16',
    md: 'w-12 h-24',
    lg: 'w-16 h-32'
  };

  const lightSize = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-around shadow-lg`}>
      <div className={`${lightSize[size]} rounded-full ${signal === 'red' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-red-900'}`} />
      <div className={`${lightSize[size]} rounded-full ${signal === 'yellow' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-yellow-900'}`} />
      <div className={`${lightSize[size]} rounded-full ${signal === 'green' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-900'}`} />
    </div>
  );
}
