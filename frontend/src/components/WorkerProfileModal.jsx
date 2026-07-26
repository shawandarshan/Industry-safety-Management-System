import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { subscribeToViolations } from '../services/violationService';

export default function WorkerProfileModal({ isOpen, onClose, worker }) {
  const [violations, setViolations] = useState([]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Subscribe to all violations and filter locally for now 
    // (since workerId is currently "Unknown" in the YOLO detection, we match by name if possible, or just show all for demo)
    const unsubscribe = subscribeToViolations((data) => {
      // For a real production app, we would query by workerId
      // const workerViolations = data.filter(v => v.workerId === worker.id);
      
      // For demo purposes, we will just show the latest 3 violations if the worker has a low score, else none
      if (worker && Number(worker.safetyScore) < 90) {
        setViolations(data.slice(0, 3));
      } else {
        setViolations([]);
      }
    });
    
    return () => unsubscribe();
  }, [isOpen, worker]);

  if (!isOpen || !worker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-start bg-slate-800">
          <div className="flex items-center">
            {worker.imageUrl ? (
              <img src={worker.imageUrl} alt={worker.name} className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-slate-700" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold mr-4 border-2 border-slate-700">
                {worker.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-white text-lg">{worker.name}</h3>
              <p className="text-slate-400 text-sm">{worker.department} • {worker.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Safety Score</p>
              <p className={`text-2xl font-bold ${Number(worker.safetyScore) >= 90 ? 'text-green-400' : Number(worker.safetyScore) >= 75 ? 'text-white' : 'text-amber-400'}`}>
                {worker.safetyScore}/100
              </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <p className="text-lg font-medium text-white">{worker.status}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <ShieldAlert size={16} className="mr-2 text-slate-400" /> Recent Violations
            </h4>
            
            {violations.length === 0 ? (
              <p className="text-sm text-slate-400 italic bg-slate-800/50 p-4 rounded-lg border border-white/5 text-center">
                No recent violations recorded for this worker.
              </p>
            ) : (
              <div className="space-y-3">
                {violations.map(v => (
                  <div key={v.id} className="flex items-center p-3 bg-slate-800 rounded-lg border border-white/5 group">
                    <div className="w-12 h-12 rounded bg-slate-900 border border-white/10 flex-shrink-0 mr-3 overflow-hidden flex items-center justify-center relative">
                      {v.imageUrl ? (
                        <>
                          <img src={v.imageUrl} alt="Violation" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon size={12} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <ImageIcon size={16} className="text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-400">{v.missing_ppe || v.violationType}</p>
                      <p className="text-xs text-slate-400">
                        {v.timestamp?.seconds 
                          ? new Date(v.timestamp.seconds * 1000).toLocaleString() 
                          : new Date(v.timestamp).toLocaleString()}
                      </p>
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
