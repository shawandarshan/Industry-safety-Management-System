import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ShieldAlert, CheckCircle, Video } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_violations: 0,
    unresolved_violations: 0,
    resolved_violations: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/violations/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
    // In a real app, you might poll this or use WebSockets
  }, []);

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Violations',
        data: [12, 19, 3, 5, 2, 3, 9], // Mock data for demo
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Resolved', 'Unresolved'],
    datasets: [
      {
        data: [stats.resolved_violations || 45, stats.unresolved_violations || 12], // Fallback to mock data if API is down
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Monitor real-time safety compliance across the facility.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Unresolved Violations</h2>
            <p className="text-2xl font-bold text-gray-900">{stats.unresolved_violations}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Resolved Violations</h2>
            <p className="text-2xl font-bold text-gray-900">{stats.resolved_violations}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Video size={24} />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Active Cameras</h2>
            <p className="text-2xl font-bold text-gray-900">12 / 12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Violation Trends</h3>
          <div className="h-64">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resolution Status</h3>
          <div className="h-64 flex justify-center pb-4">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
