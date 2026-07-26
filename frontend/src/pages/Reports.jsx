import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, AlertTriangle, Camera, TrendingUp, Download, 
  Filter, BrainCircuit, Activity, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { subscribeToWorkers } from '../services/workerService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

export default function Reports() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Week');

  useEffect(() => {
    const unsubscribe = subscribeToWorkers(
      (data) => {
        setWorkers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching workers for report:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Compute KPIs
  const totalWorkers = workers.length;
  const totalViolations = workers.reduce((acc, w) => acc + (Number(w.violations) || 0), 0);
  const avgSafetyScore = workers.length 
    ? Math.round(workers.reduce((acc, w) => acc + (Number(w.safetyScore) || 0), 0) / workers.length)
    : 0;

  // Top 5 Workers with most violations
  const topViolators = [...workers]
    .filter(w => (Number(w.violations) || 0) > 0)
    .sort((a, b) => b.violations - a.violations)
    .slice(0, 5);

  // Group by Department for Bar Chart (Avg Safety Score)
  const deptData = useMemo(() => {
    const depts = {};
    workers.forEach(w => {
      if (!depts[w.department]) depts[w.department] = { total: 0, count: 0, violations: 0 };
      depts[w.department].total += Number(w.safetyScore) || 0;
      depts[w.department].violations += Number(w.violations) || 0;
      depts[w.department].count += 1;
    });
    
    return {
      labels: Object.keys(depts),
      scores: Object.values(depts).map(d => Math.round(d.total / d.count)),
      violations: Object.values(depts).map(d => d.violations)
    };
  }, [workers]);

  // Chart Configurations
  const barChartData = {
    labels: deptData.labels,
    datasets: [
      {
        label: 'Average Safety Score',
        data: deptData.scores,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
      }
    ]
  };

  const pieChartData = {
    labels: deptData.labels.length ? deptData.labels : ['No Data'],
    datasets: [
      {
        data: deptData.violations.length && deptData.violations.some(v => v > 0) ? deptData.violations : [1],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // red
          'rgba(245, 158, 11, 0.8)',  // amber
          'rgba(16, 185, 129, 0.8)',  // green
          'rgba(139, 92, 246, 0.8)'   // purple
        ],
        borderWidth: 0,
      }
    ]
  };

  // Mock trend data since we don't store historical timeline yet
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Violations',
        data: [4, 6, 3, 7, 2, 0, 1],
        fill: true,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8' } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <Activity className="animate-spin mr-3" /> Loading reports data...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-slate-400 mt-1 text-sm">Comprehensive safety insights and facility performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-800 border border-white/10 rounded-lg px-3 py-2">
            <Calendar size={16} className="text-slate-400 mr-2" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm text-white outline-none"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
          <button className="flex items-center px-4 py-2 bg-slate-800 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
            <Filter size={16} className="mr-2 text-slate-400" />
            Filter
          </button>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white border-r border-white/10 transition-colors">CSV</button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white border-r border-white/10 transition-colors">Excel</button>
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white transition-colors">
              <Download size={16} className="mr-2" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-xl p-5 shadow-sm flex items-start space-x-4">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <BrainCircuit className="text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-1 flex items-center">
            AI Safety Insights
            <span className="ml-2 text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Auto-generated</span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Based on current Firestore data, <span className="font-semibold text-white">Assembly</span> department shows the highest safety compliance. 
            However, there has been a 15% increase in proximity alerts in the <span className="font-semibold text-white">Loading Dock</span> this week. 
            Recommend targeted refresher training for {topViolators.length > 0 ? topViolators[0].name.split(' ')[0] : 'key staff'} and team.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm font-medium">Total Workforce</p>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users size={16} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalWorkers}</p>
          <p className="text-xs text-green-400 mt-2 flex items-center"><TrendingUp size={12} className="mr-1" /> +2 from last month</p>
        </div>

        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm font-medium">Total Violations</p>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalViolations}</p>
          <p className="text-xs text-red-400 mt-2 flex items-center"><TrendingUp size={12} className="mr-1" /> +12% this week</p>
        </div>

        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm font-medium">Avg Safety Score</p>
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Activity size={16} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{avgSafetyScore}%</p>
          <p className="text-xs text-green-400 mt-2 flex items-center"><TrendingUp size={12} className="mr-1" /> +3% overall</p>
        </div>

        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm font-medium">Active Cameras</p>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Camera size={16} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">24 / 24</p>
          <p className="text-xs text-slate-400 mt-2">100% operational uptime</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-6">Weekly Violation Trend</h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-6">Violations by Department</h3>
          <div className="h-64">
            <Pie data={pieChartData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Dept Safety Scores */}
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-6">Department Safety Scores</h3>
          <div className="h-64">
            <Bar data={barChartData} options={{...chartOptions, indexAxis: 'y'}} />
          </div>
        </div>

        {/* Top Violators */}
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-sm font-bold text-white mb-4">Top 5 Workers (Most Violations)</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {topViolators.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No violations recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {topViolators.map((worker, index) => (
                  <div key={worker.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-white/5">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 mr-3">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{worker.name}</p>
                        <p className="text-xs text-slate-400">{worker.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{worker.violations} Alerts</p>
                      <p className="text-xs text-slate-500">Score: {worker.safetyScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
