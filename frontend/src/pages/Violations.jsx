import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/violations/');
      setViolations(response.data);
    } catch (error) {
      console.error("Error fetching violations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(`http://localhost:8000/violations/${id}`);
      fetchViolations(); // Refresh list
    } catch (error) {
      console.error("Error resolving violation:", error);
    }
  };

  // Mock data for display if backend is empty
  const mockViolations = [
    { id: 101, camera_id: 2, timestamp: "2026-07-13T10:30:00Z", missing_ppe: "Helmet", status: "unresolved", image_path: "mock_path" },
    { id: 102, camera_id: 1, timestamp: "2026-07-13T09:15:00Z", missing_ppe: "Mask, Gloves", status: "resolved", image_path: "mock_path" },
  ];

  const displayData = violations.length > 0 ? violations : mockViolations;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Violation History</h1>
        <p className="text-gray-500 mt-1">Review and resolve safety non-compliance events.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="p-4">Violation ID</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Camera</th>
                <th className="p-4">Missing PPE</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {displayData.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono">#{v.id}</td>
                  <td className="p-4">{new Date(v.timestamp).toLocaleString()}</td>
                  <td className="p-4">Cam-{v.camera_id}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {v.missing_ppe}
                    </span>
                  </td>
                  <td className="p-4">
                    {v.status === 'resolved' ? (
                      <span className="flex items-center text-green-600 font-medium">
                        <CheckCircle size={16} className="mr-1" /> Resolved
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 font-medium">
                        <AlertCircle size={16} className="mr-1" /> Unresolved
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {v.status === 'unresolved' && (
                      <button 
                        onClick={() => handleResolve(v.id)}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors font-medium text-xs shadow-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayData.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              No violations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
