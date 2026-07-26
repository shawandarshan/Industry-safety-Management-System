import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { subscribeToViolations, resolveViolation } from '../services/violationService';

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToViolations(
      (data) => {
        setViolations(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching violations:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleResolve = async (id) => {
    try {
      await resolveViolation(id);
    } catch (error) {
      console.error("Error resolving violation:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white">Violation History</h1>
        <p className="text-slate-400 mt-1">Review and resolve safety non-compliance events.</p>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/10 text-sm font-medium text-slate-400 uppercase tracking-wider">
                <th className="p-4">Violation Details</th>
                <th className="p-4">Time & Location</th>
                <th className="p-4">Snapshot</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {violations.map((v) => {
                const timestamp = v.timestamp?.seconds 
                  ? new Date(v.timestamp.seconds * 1000).toLocaleString() 
                  : v.timestamp ? new Date(v.timestamp).toLocaleString() : 'Unknown Time';

                return (
                  <tr key={v.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4">
                      <p className="font-mono text-xs text-slate-500 mb-1">#{v.id}</p>
                      <p className="font-semibold text-white">{v.workerName || 'Unknown Worker'}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20 mt-1">
                        {v.missing_ppe || v.violationType}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-300">{timestamp}</p>
                      <p className="text-xs text-slate-500 mt-1">Cam: {v.camera_id || v.cameraId}</p>
                    </td>
                    <td className="p-4">
                      {v.imageUrl ? (
                        <a href={v.imageUrl} target="_blank" rel="noopener noreferrer" className="block relative w-16 h-12 rounded overflow-hidden border border-white/10 hover:border-blue-500 transition-colors group">
                          <img src={v.imageUrl} alt="Violation Snapshot" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon size={14} className="text-white" />
                          </div>
                        </a>
                      ) : (
                        <div className="w-16 h-12 rounded bg-slate-700 flex items-center justify-center border border-white/5 text-slate-500 text-xs">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {v.status === 'resolved' ? (
                        <span className="flex items-center text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-md w-fit">
                          <CheckCircle size={14} className="mr-1.5" /> Resolved
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-400 font-medium bg-amber-400/10 px-2 py-1 rounded-md w-fit">
                          <AlertCircle size={14} className="mr-1.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {v.status !== 'resolved' && (
                        <button 
                          onClick={() => handleResolve(v.id)}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors font-medium text-xs shadow-sm border border-blue-500"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {violations.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <CheckCircle size={40} className="text-green-500/50 mb-3" />
              <p className="text-lg font-medium text-slate-300">All Clear</p>
              <p className="text-sm">No safety violations recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
