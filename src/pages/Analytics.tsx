import { useState, useEffect } from 'react';
import { TrendingUp, Clock, AlertTriangle, Download, RefreshCw, FileText, FileSpreadsheet, FileJson, CheckSquare, BarChart3, Activity, Lightbulb } from 'lucide-react';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../lib/supabase';

export function Analytics() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [activeTab, setActiveTab] = useState<'metrics' | 'performance' | 'export'>('metrics');
  const [selectedRoads, setSelectedRoads] = useState<string[]>(['Road A', 'Road B', 'Road C', 'Road D']);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [includeData, setIncludeData] = useState({
    throughput: true,
    performance: true,
    insights: true,
    charts: true
  });
  const [optimizationTab, setOptimizationTab] = useState<'optimization' | 'bottlenecks' | 'emergency'>('optimization');

  // Mock data for charts
  const throughputData = [
    { time: '00:00', 'Road A': 45, 'Road B': 38, 'Road C': 42, 'Road D': 40 },
    { time: '04:00', 'Road A': 52, 'Road B': 45, 'Road C': 48, 'Road D': 46 },
    { time: '08:00', 'Road A': 48, 'Road B': 52, 'Road C': 45, 'Road D': 50 },
    { time: '12:00', 'Road A': 55, 'Road B': 48, 'Road C': 52, 'Road D': 47 },
    { time: '16:00', 'Road A': 58, 'Road B': 55, 'Road C': 50, 'Road D': 53 },
    { time: '20:00', 'Road A': 42, 'Road B': 40, 'Road C': 38, 'Road D': 44 }
  ];

  const roadStats = [
    {
      name: 'Road A',
      direction: 'North',
      avgWaitTime: '45.2s',
      efficiency: '87.2%',
      queueLength: '32.3',
      totalVehicles: '1,247',
      peakTraffic: '10:00-16:00',
      emergency: 3,
      color: 'bg-blue-500',
      performance: 87
    },
    {
      name: 'Road B',
      direction: 'East',
      avgWaitTime: '52.8s',
      efficiency: '82.3%',
      queueLength: '15.7',
      totalVehicles: '1,089',
      peakTraffic: '14:30-19:30',
      emergency: 1,
      color: 'bg-yellow-500',
      performance: 82
    },
    {
      name: 'Road C',
      direction: 'South',
      avgWaitTime: '38.9s',
      efficiency: '91.3%',
      queueLength: '9.8',
      totalVehicles: '1,156',
      peakTraffic: '15:30-18:15',
      emergency: 2,
      color: 'bg-red-500',
      performance: 91
    },
    {
      name: 'Road D',
      direction: 'West',
      avgWaitTime: '41.6s',
      efficiency: '89.7%',
      queueLength: '31.2',
      totalVehicles: '1,198',
      peakTraffic: '14:45-19:45',
      emergency: 4,
      color: 'bg-purple-500',
      performance: 89
    }
  ];

  const optimizations = [
    {
      road: 'Road B',
      priority: 'HIGH',
      issue: 'Extended red times during peak hours',
      recommendation: 'Increase green light duration by 15 seconds during 14:30-19:30',
      impact: '+12% efficiency improvement',
      color: 'text-red-500'
    },
    {
      road: 'Road A',
      priority: 'MEDIUM',
      issue: 'Underutilized green time during off-peak',
      recommendation: 'Implement adaptive timing based on vehicle detection',
      impact: '+8% overall throughput',
      color: 'text-yellow-500'
    },
    {
      road: 'Road D',
      priority: 'HIGH',
      issue: 'Frequent emergency vehicle conflicts',
      recommendation: 'Install advanced emergency vehicle detection system',
      impact: '-25% emergency response delay',
      color: 'text-red-500'
    }
  ];

  const handleExport = async () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      dateRange: dateRange,
      format: exportFormat,
      roadStats: roadStats,
      throughputData: throughputData,
      optimizations: optimizations,
      includeData: includeData,
      summary: {
        systemEfficiency: 87.7,
        avgWaitTime: 44.6,
        totalThroughput: 4898,
        emergencyEvents: 10
      }
    };

    const filename = `traffic-analytics-${dateRange}-${Date.now()}`;
    
    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
    } else if (exportFormat === 'csv') {
      let csv = 'Road,Direction,Avg Wait Time,Efficiency,Queue Length,Total Vehicles,Peak Traffic,Emergency Events\n';
      roadStats.forEach(road => {
        csv += `${road.name},${road.direction},${road.avgWaitTime},${road.efficiency},${road.queueLength},${road.totalVehicles},${road.peakTraffic},${road.emergency}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
    } else {
      alert(`Export as ${exportFormat.toUpperCase()} would generate a formatted report with all selected data`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Traffic Analytics Reports</h1>
            <p className="text-muted-foreground">Comprehensive performance analysis and traffic pattern insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Auto Refresh
            </Button>
            <span className="text-xs text-muted-foreground">Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="System Efficiency"
            value="87.7%"
            trend={{ value: 3.2, isPositive: true }}
            iconColor="text-green-500"
          />
          <StatCard
            icon={Clock}
            label="Average Wait Time"
            value="44.6s"
            trend={{ value: 0.81, isPositive: false }}
            iconColor="text-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Throughput"
            value="4,898"
            trend={{ value: 12.3, isPositive: true }}
            iconColor="text-purple-500"
          />
          <StatCard
            icon={AlertTriangle}
            label="Emergency Events"
            value="10"
            trend={{ value: 16.4, isPositive: false }}
            iconColor="text-yellow-500"
          />
        </div>

        {/* Vehicle Throughput Analysis */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Vehicle Throughput Analysis</h2>
              <p className="text-sm text-muted-foreground">Real-time traffic flow across all intersections</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={dateRange === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('today')}
              >
                1 Hour
              </Button>
              <Button
                variant={dateRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('week')}
              >
                4 Hours
              </Button>
              <Button
                variant={dateRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('month')}
              >
                1 Day
              </Button>
            </div>
          </div>

          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Road A" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="Road B" stroke="#EAB308" strokeWidth={2} />
                <Line type="monotone" dataKey="Road C" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="Road D" stroke="#A855F7" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-muted-foreground mb-1">Peak Hour</div>
              <div className="font-bold">15:00</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground mb-1">Avg Throughput</div>
              <div className="font-bold">48.5</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground mb-1">Total Vehicles</div>
              <div className="font-bold">1,164</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground mb-1">Efficiency</div>
              <div className="font-bold text-green-500">87.2%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Analytics Data */}
          <div className="lg:col-span-1 bg-white border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Export Analytics Data</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Download reports and data for external analysis</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Export Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'pdf', icon: FileText, label: 'PDF Report' },
                    { value: 'excel', icon: FileSpreadsheet, label: 'Excel Spreadsheet' },
                    { value: 'csv', icon: FileSpreadsheet, label: 'CSV Data' },
                    { value: 'json', icon: FileJson, label: 'JSON Export' }
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setExportFormat(format.value as any)}
                      className={`p-3 border rounded-lg text-xs font-medium transition-colors flex flex-col items-center gap-2 ${
                        exportFormat === format.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      <format.icon className="w-4 h-4" />
                      <span>{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Include Data ({Object.values(includeData).filter(Boolean).length}/4 selected)</label>
                <div className="space-y-2">
                  {[
                    { key: 'throughput', label: 'Throughput Charts', desc: 'Vehicle flow data and visualizations' },
                    { key: 'performance', label: 'Performance Statistics', desc: 'Detailed metrics by road' },
                    { key: 'insights', label: 'All Insights', desc: 'Recommendations and analysis' },
                    { key: 'charts', label: 'Chart Images', desc: 'High-resolution chart exports' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setIncludeData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof includeData] }))}
                      className="w-full flex items-start gap-2 p-2 border border-border rounded-lg hover:bg-secondary/50 text-left transition-colors"
                    >
                      <CheckSquare className={`w-4 h-4 mt-0.5 ${includeData[item.key as keyof typeof includeData] ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="grid grid-cols-3 gap-2">
                  {['today', 'week', 'month'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range as any)}
                      className={`py-2 border rounded-lg text-xs font-medium transition-colors ${
                        dateRange === range
                          ? 'border-primary bg-primary text-white'
                          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      {range === 'today' ? 'Today Only' : range === 'week' ? 'Past Week' : 'Past Month'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-3 text-xs">
                <div className="font-medium mb-1">Export Summary</div>
                <div className="text-muted-foreground space-y-1">
                  <div>Format: <span className="font-medium text-foreground">{exportFormat.toUpperCase()} Report</span></div>
                  <div>Date Range: <span className="font-medium text-foreground">{dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'Past Week' : 'Past Month'}</span></div>
                  <div>File Size: <span className="font-medium text-foreground">~2.4 MB</span></div>
                </div>
              </div>

              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="lg:col-span-2 bg-white border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Detailed Statistics</h2>
                <p className="text-sm text-muted-foreground">Comprehensive performance metrics by road</p>
              </div>
              <div className="flex gap-2">
                <Button variant={activeTab === 'metrics' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('metrics')}>
                  All Metrics
                </Button>
                <Button variant={activeTab === 'performance' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('performance')}>
                  Performance
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {roadStats.map((road) => (
                <div key={road.name} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${road.color}`} />
                      <div>
                        <h3 className="font-semibold text-sm">{road.name}</h3>
                        <p className="text-xs text-muted-foreground">{road.direction}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${road.performance > 85 ? 'text-green-500' : road.performance > 75 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {road.efficiency}
                      </div>
                      <div className="text-xs text-muted-foreground">Efficiency</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <div className="text-muted-foreground mb-1">Avg Wait Time</div>
                      <div className="font-semibold">{road.avgWaitTime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Queue Length</div>
                      <div className="font-semibold">{road.queueLength}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Total Vehicles</div>
                      <div className="font-semibold">{road.totalVehicles}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-1">Peak Traffic</div>
                      <div className="font-semibold">{road.peakTraffic}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Emergency</div>
                      <div className="font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        {road.emergency}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <div className="text-xs text-muted-foreground mb-2">Overall System Performance</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-muted-foreground text-xs">Avg Wait Time</div>
                  <div className="font-bold text-lg">44.6s</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Overall Efficiency</div>
                  <div className="font-bold text-lg text-green-500">87.7%</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Total Throughput</div>
                  <div className="font-bold text-lg">4,898</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights & Recommendations */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Performance Insights & Recommendations</h2>
              <p className="text-sm text-muted-foreground">AI-powered analysis and optimization suggestions</p>
            </div>
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant={optimizationTab === 'optimization' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOptimizationTab('optimization')}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Optimization
            </Button>
            <Button
              variant={optimizationTab === 'bottlenecks' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOptimizationTab('bottlenecks')}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Bottlenecks
            </Button>
            <Button
              variant={optimizationTab === 'emergency' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOptimizationTab('emergency')}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency
            </Button>
          </div>

          <div className="space-y-4">
            {optimizations.map((opt, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Signal Timing Optimization</h3>
                      <p className="text-xs text-muted-foreground">3 recommendations found</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${opt.color} bg-secondary`}>
                      {opt.priority}
                    </span>
                    <h4 className="font-semibold text-sm">{opt.road}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{opt.issue}</p>
                  <div className="text-sm">
                    <div className="font-medium mb-1">Recommendation:</div>
                    <p className="text-muted-foreground">{opt.recommendation}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">{opt.impact}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  Apply
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">+18.5%</div>
              <div className="text-xs text-green-700">Potential Efficiency Gain</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">12.3s</div>
              <div className="text-xs text-blue-700">Estimated Time Savings</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">High</div>
              <div className="text-xs text-purple-700">Implementation Priority</div>
            </div>
          </div>
        </div>

        <div className="bg-secondary/50 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>Analytics Information</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Data collected from real-time traffic simulation • Updated every 24 seconds • Resolution Time: 10:36:13 • Data Points: 1,247 • © 2025 Smart Traffic Simulator
          </p>
        </div>
      </div>
    </div>
  );
}
