import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ShieldAlert, CheckCircle, Video, Activity, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import DigitalTwin from '../components/DigitalTwin';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_violations: 0,
    unresolved_violations: 0,
    resolved_violations: 0,
    current_risk_score: 45,
    total_cameras: 4
  });

  const [workers, setWorkers] = useState([
    { id: '1', position: [-2, 0.3, 2], hasViolation: false },
    { id: '2', position: [3, 0.3, -3], hasViolation: true },
    { id: '3', position: [0, 0.3, 0], hasViolation: false }
  ]);

  const [recentViolations, setRecentViolations] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/violations/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(prev => ({ ...prev, ...response.data }));
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    
    const fetchRecent = async () => {
      try {
        const response = await axios.get('http://localhost:8000/violations/');
        // take first 5
        setRecentViolations(response.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch recent violations", err);
      }
    };

    fetchStats();
    fetchRecent();
  }, []);

  // Use mock if empty
  const displayViolations = recentViolations.length > 0 ? recentViolations : [
    { id: 101, camera_id: 2, timestamp: "2026-07-13T10:30:00Z", missing_ppe: "Helmet", status: "unresolved" },
    { id: 102, camera_id: 1, timestamp: "2026-07-13T09:15:00Z", missing_ppe: "Mask, Gloves", status: "resolved" },
    { id: 103, camera_id: 3, timestamp: "2026-07-13T08:00:00Z", missing_ppe: "Safety Vest", status: "unresolved" }
  ];

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Violations',
        data: [12, 19, 3, 5, 2, 3, 9],
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { dash: [4,4] } },
      x: { grid: { display: false } }
    }
  };

  const doughnutData = {
    labels: ['Resolved', 'Unresolved'],
    datasets: [
      {
        data: [stats.resolved_violations || 60, stats.unresolved_violations || 40],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const CardWrap = ({ children, className = "" }) => (
    <div className={`bg-slate-800/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="animate-fade-in w-full text-slate-100 pb-10">
      {/* Row 1: Header */}
      <div className="mb-6">
        <h1 className="text-[40px] font-bold text-white tracking-tight leading-tight">Dashboard Overview</h1>
        <p className="text-[16px] text-slate-400 mt-1">Monitor real-time safety compliance and factory digital twin.</p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        
        {/* Row 2: KPI Cards */}
        <CardWrap className="col-span-12 md:col-span-6 xl:col-span-3 h-[120px] flex flex-col justify-center px-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
            <ShieldAlert size={100} color="#ef4444" />
          </div>
          <div className="flex items-center space-x-4 z-10">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-[14px] text-slate-400 font-medium">Active Violations</p>
              <h3 className="text-[32px] font-bold text-white leading-none mt-1">{stats.unresolved_violations}</h3>
            </div>
          </div>
        </CardWrap>

        <CardWrap className="col-span-12 md:col-span-6 xl:col-span-3 h-[120px] flex flex-col justify-center px-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
            <Activity size={100} color="#f59e0b" />
          </div>
          <div className="flex items-center space-x-4 z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[14px] text-slate-400 font-medium">Factory Risk Score</p>
              <h3 className="text-[32px] font-bold text-white leading-none mt-1">{stats.current_risk_score}<span className="text-lg text-slate-500 font-normal">/100</span></h3>
            </div>
          </div>
        </CardWrap>

        <CardWrap className="col-span-12 md:col-span-6 xl:col-span-3 h-[120px] flex flex-col justify-center px-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle size={100} color="#22c55e" />
          </div>
          <div className="flex items-center space-x-4 z-10">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)] shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[14px] text-slate-400 font-medium">Resolved Today</p>
              <h3 className="text-[32px] font-bold text-white leading-none mt-1">{stats.resolved_violations}</h3>
            </div>
          </div>
        </CardWrap>

        <CardWrap className="col-span-12 md:col-span-6 xl:col-span-3 h-[120px] flex flex-col justify-center px-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
            <Video size={100} color="#3b82f6" />
          </div>
          <div className="flex items-center space-x-4 z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] shrink-0">
              <Video size={24} />
            </div>
            <div>
              <p className="text-[14px] text-slate-400 font-medium">Active Cameras</p>
              <h3 className="text-[32px] font-bold text-white leading-none mt-1">{stats.total_cameras}<span className="text-lg text-slate-500 font-normal">/4</span></h3>
            </div>
          </div>
        </CardWrap>

        {/* Row 3: Digital Twin & Status Stack */}
        <div className="col-span-12 xl:col-span-8 flex flex-col">
          <CardWrap className="flex-1 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[24px] font-semibold text-white tracking-tight">Digital Twin Live View</h2>
              <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> LIVE
              </span>
            </div>
            <div className="flex-1 min-h-[400px] bg-slate-900/50 rounded-xl overflow-hidden border border-white/5 relative">
              <DigitalTwin workers={workers} />
            </div>
          </CardWrap>
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-5">
          {/* Card: Recent Alerts */}
          <CardWrap className="p-6 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Recent Alerts
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <ShieldAlert size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] text-white font-medium">Missing Helmet Detected</p>
                  <p className="text-xs text-slate-400 mt-1">Cam-02 Loading Dock • 2 mins ago</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-3 bg-slate-700/30 rounded-xl border border-white/5 hover:bg-slate-700/50 transition-colors cursor-pointer">
                <Activity size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] text-white font-medium">New Worker Registered</p>
                  <p className="text-xs text-slate-400 mt-1">Zone A • 15 mins ago</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-3 bg-slate-700/30 rounded-xl border border-white/5 hover:bg-slate-700/50 transition-colors cursor-pointer">
                <Clock size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] text-white font-medium">System Update Scheduled</p>
                  <p className="text-xs text-slate-400 mt-1">Today • 11:00 PM</p>
                </div>
              </div>
            </div>
          </CardWrap>

          {/* Card: Factory Health */}
          <CardWrap className="p-6 flex-1">
            <h2 className="text-[18px] font-semibold text-white mb-4">Factory Health</h2>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Safety Compliance</span>
                  <span className="text-green-400 font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Camera Uptime</span>
                  <span className="text-blue-400 font-bold">99%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '99%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">PPE Stock Availability</span>
                  <span className="text-amber-400 font-bold">45%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </CardWrap>
        </div>

        {/* Row 4: Charts */}
        <CardWrap className="col-span-12 xl:col-span-6 p-6">
          <h2 className="text-[24px] font-semibold text-white mb-6">Weekly Violation Trend</h2>
          <div className="h-[280px] w-full">
            <Bar data={barData} options={chartOptions} />
          </div>
        </CardWrap>

        <CardWrap className="col-span-12 xl:col-span-6 p-6 flex flex-col">
          <h2 className="text-[24px] font-semibold text-white mb-6">Resolution Status</h2>
          <div className="flex-1 w-full flex justify-center items-center relative min-h-[280px]">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '78%', plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 14, family: "'Inter', sans-serif" }, padding: 24, usePointStyle: true } } } }} />
            <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-2 -ml-24">
              <span className="text-[32px] font-bold text-white leading-none">
                {Math.round((stats.resolved_violations || 60) / ((stats.resolved_violations || 60) + (stats.unresolved_violations || 40)) * 100)}%
              </span>
              <span className="text-sm text-slate-400 mt-1 font-medium">Resolved</span>
            </div>
          </div>
        </CardWrap>

        {/* Row 5: Table */}
        <CardWrap className="col-span-12 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[24px] font-semibold text-white">Recent Violations</h2>
            <Link to="/violations" className="text-blue-500 hover:text-blue-400 text-[16px] font-medium flex items-center gap-1.5 transition-colors bg-blue-500/10 px-4 py-2 rounded-lg hover:bg-blue-500/20">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-[14px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-4 font-semibold px-4">Time</th>
                  <th className="pb-4 font-semibold px-4">Worker / Camera</th>
                  <th className="pb-4 font-semibold px-4">Missing PPE</th>
                  <th className="pb-4 font-semibold px-4">Risk</th>
                  <th className="pb-4 font-semibold px-4">Status</th>
                  <th className="pb-4 font-semibold px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[14px] text-slate-200">
                {displayViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-4 whitespace-nowrap text-slate-300">
                      {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-300">#{v.id}</span>
                        <span className="inline-flex items-center gap-1.5 mt-1 text-slate-400 text-xs font-medium">
                          <Video size={12} /> Cam-{v.camera_id}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        {v.missing_ppe}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                         <span className="text-slate-300 font-medium">High</span>
                       </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {v.status === 'resolved' ? (
                        <span className="flex items-center text-green-400 font-medium text-sm">
                          <CheckCircle size={16} className="mr-1.5" /> Resolved
                        </span>
                      ) : (
                        <span className="flex items-center text-red-400 font-medium text-sm">
                          <AlertTriangle size={16} className="mr-1.5" /> Unresolved
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {v.status === 'unresolved' ? (
                        <button className="text-[16px] text-white bg-blue-600 hover:bg-blue-500 font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                          Resolve
                        </button>
                      ) : (
                        <span className="text-slate-500 font-medium bg-slate-800 px-4 py-2 rounded-lg border border-white/5">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardWrap>
        
      </div>
    </div>
  );
}
