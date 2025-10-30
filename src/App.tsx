import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Activity, BarChart3 } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'analytics'>('dashboard');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Smart Traffic Simulator</h1>
              <p className="text-xs text-muted-foreground">Traffic Management & Analysis Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Activity className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentPage === 'analytics'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentPage === 'dashboard' ? <Dashboard /> : <Analytics />}
    </div>
  );
}

export default App; 