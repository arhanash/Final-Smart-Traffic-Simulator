import type { AnalyticsData } from '../types/traffic';

export const exportToPDF = async (data: AnalyticsData) => {
  // Create PDF content
  const content = `
Traffic Analytics Report
Generated: ${new Date().toLocaleString()}

System Efficiency: ${data.systemEfficiency}%
Average Wait Time: ${data.avgWaitTime}s
Total Throughput: ${data.totalThroughput} vehicles
Emergency Events: ${data.emergencyEvents}

Road Performance:
${data.roadPerformance.map(road => `
${road.roadName}:
  - Vehicles: ${road.vehicles}
  - Wait Time: ${road.waitTime}s
  - Efficiency: ${road.efficiency}%
  - Queue Length: ${road.queueLength}m
`).join('\n')}

Recommendations:
${data.recommendations.map(r => `- [${r.severity}] ${r.roadName}: ${r.recommendation}`).join('\n')}
  `;

  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traffic-report-${Date.now()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToExcel = (data: AnalyticsData) => {
  // Convert to CSV format (Excel-compatible)
  const csvContent = `Traffic Analytics Report
Generated,${new Date().toLocaleString()}

Summary Metrics
Metric,Value
System Efficiency,${data.systemEfficiency}%
Average Wait Time,${data.avgWaitTime}s
Total Throughput,${data.totalThroughput}
Emergency Events,${data.emergencyEvents}

Road Performance
Road,Vehicles,Wait Time (s),Efficiency (%),Queue Length (m),Peak Traffic
${data.roadPerformance.map(road => 
  `${road.roadName},${road.vehicles},${road.waitTime},${road.efficiency},${road.queueLength},${road.peakTraffic}`
).join('\n')}

Recommendations
Road,Severity,Recommendation,Impact
${data.recommendations.map(r => 
  `${r.roadName},${r.severity},${r.recommendation},${r.estimatedImpact}`
).join('\n')}
`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traffic-report-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: AnalyticsData) => {
  const csvRows = [
    ['Road', 'Vehicles', 'Wait Time', 'Efficiency', 'Queue Length', 'Peak Traffic'],
    ...data.roadPerformance.map(road => [
      road.roadName,
      road.vehicles.toString(),
      road.waitTime.toString(),
      road.efficiency.toString(),
      road.queueLength.toString(),
      road.peakTraffic
    ])
  ];

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traffic-data-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: AnalyticsData) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traffic-data-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
