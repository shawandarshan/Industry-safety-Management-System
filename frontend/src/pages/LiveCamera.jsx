import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Video, Monitor, AlertCircle, Settings, Trash2, X, Play, Square, Activity, Bell, AlertTriangle } from 'lucide-react';
import { subscribeToCameras, addCamera, deleteCamera, updateCamera } from '../services/cameraService';
import { subscribeToViolations } from '../services/violationService';
import CameraStream from '../components/CameraStream';

export default function LiveCamera() {
  const [cameras, setCameras] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Camera Form State
  const [newCamera, setNewCamera] = useState({
    cameraName: '',
    cameraType: 'Laptop Webcam',
    zone: 'Assembly',
    url: '',
    fps: 30,
    resolution: '1920x1080',
    confidence: 0.45,
    status: 'Online'
  });

  // Global Audio Reference
  const alarmAudioRef = useRef(null);
  const [globalAIStatus, setGlobalAIStatus] = useState('Running 🟢');

  useEffect(() => {
    // Create alarm audio element
    alarmAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    alarmAudioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    const unsubscribeCameras = subscribeToCameras(
      (data) => {
        setCameras(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    const unsubscribeViolations = subscribeToViolations((data) => {
      setViolations(data);
    });

    return () => {
      unsubscribeCameras();
      unsubscribeViolations();
    };
  }, []);

  const handleAddCamera = async (e) => {
    e.preventDefault();
    try {
      await addCamera(newCamera);
      setShowAddModal(false);
      setNewCamera({
        ...newCamera,
        cameraName: '',
        url: ''
      });
    } catch (error) {
      console.error("Error adding camera", error);
    }
  };

  const toggleCameraStatus = async (cam) => {
    const newStatus = cam.status === 'Online' ? 'Offline' : 'Online';
    try {
      await updateCamera(cam.id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAlarm = (camera, stats) => {
    if (alarmAudioRef.current) {
      // Play sound if not already playing
      alarmAudioRef.current.play().catch(e => console.log("Audio play prevented by browser", e));
    }
  };

  // Stats
  const onlineCount = cameras.filter(c => c.status === 'Online').length;
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const violationsToday = violations.filter(v => {
    const vDate = v.timestamp?.seconds ? new Date(v.timestamp.seconds * 1000) : new Date(v.timestamp);
    return vDate >= todayStart;
  }).length;

  return (
    <div className="max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            Live AI Camera Monitoring
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} className="mr-2" /> Add Camera
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="bg-slate-800 border border-white/5 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex space-x-8">
          <div>
            <span className="text-slate-400 text-sm">Cameras:</span>
            <span className="text-white font-bold ml-2">{cameras.length}</span>
          </div>
          <div>
            <span className="text-slate-400 text-sm">Online:</span>
            <span className="text-green-400 font-bold ml-2">{onlineCount}</span>
          </div>
          <div>
            <span className="text-slate-400 text-sm">Violations Today:</span>
            <span className="text-amber-400 font-bold ml-2">{violationsToday}</span>
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-sm mr-2">AI Status:</span>
          <span className="font-bold text-white bg-slate-900 px-3 py-1 rounded-full border border-white/10">{globalAIStatus}</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Camera Grid */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400">Loading cameras...</div>
            ) : cameras.length === 0 ? (
              <div className="col-span-full py-12 bg-slate-800/50 rounded-xl border border-white/5 text-center text-slate-400 flex flex-col items-center">
                <Video size={48} className="mb-4 opacity-30" />
                <p>No cameras configured.</p>
                <button onClick={() => setShowAddModal(true)} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">Add your first camera</button>
              </div>
            ) : (
              cameras.map(cam => (
                <div key={cam.id} className="flex flex-col">
                  {/* Camera Header */}
                  <div className="bg-slate-800 rounded-t-xl border border-b-0 border-white/10 p-3 flex justify-between items-center group">
                    <div>
                      <h3 className="font-bold text-white text-sm">{cam.cameraName} - {cam.zone}</h3>
                      <p className="text-xs text-slate-400">AI: Running 🟢 • {cam.status}</p>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteCamera(cam.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded bg-slate-700/50 hover:bg-slate-700" title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Camera Stream Component */}
                  {cam.status === 'Online' ? (
                    <CameraStream camera={cam} onAlarm={handleAlarm} />
                  ) : (
                    <div className="aspect-video bg-black flex flex-col items-center justify-center border-2 border-slate-800">
                      <Video size={32} className="text-slate-600 mb-2" />
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Offline</span>
                    </div>
                  )}

                  {/* Camera Action Bar */}
                  <div className="bg-slate-800 rounded-b-xl border border-t-0 border-white/10 p-2 flex justify-between items-center text-xs">
                    <span className="text-slate-400">FPS: 30</span>
                    <button 
                      onClick={() => toggleCameraStatus(cam)}
                      className="text-slate-300 hover:text-white"
                    >
                      {cam.status === 'Online' ? 'Stop Stream' : 'Start Stream'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Recent Violations Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-slate-800 border border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col h-[800px]">
            <div className="p-4 border-b border-white/5 bg-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center">
                <Bell size={16} className="mr-2 text-red-400" />
                Live Violations
              </h3>
              <span className="text-xs text-slate-400">Last {violations.slice(0, 20).length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {violations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center mt-10">No violations detected today.</p>
              ) : (
                violations.slice(0, 20).map(v => (
                  <div key={v.id} className="bg-slate-900 border border-white/5 rounded-lg p-3 hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-red-400 font-bold text-sm flex items-center">
                        <AlertTriangle size={14} className="mr-1" />
                        {v.missing_ppe || v.violationType}
                      </span>
                      <span className="text-xs text-slate-500">
                        {v.timestamp?.seconds ? new Date(v.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                      </span>
                    </div>
                    
                    <div className="flex space-x-3 mt-2">
                      <div className="w-16 h-16 rounded overflow-hidden bg-black border border-white/10 flex-shrink-0">
                        {v.imageUrl ? (
                          <img src={v.imageUrl} alt="Violation" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video size={16} className="text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex flex-col justify-center space-y-1">
                        <p><span className="text-slate-500">Worker:</span> {v.workerName || 'Unknown'}</p>
                        <p><span className="text-slate-500">Confidence:</span> {v.confidence || 95}%</p>
                        <p className="text-red-400 font-semibold">{v.status || 'High Risk'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-800">
              <h3 className="font-semibold text-white flex items-center">
                <Video size={18} className="mr-2 text-blue-400" /> Add New Camera
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCamera} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Camera Name</label>
                <input 
                  type="text" 
                  required
                  value={newCamera.cameraName}
                  onChange={e => setNewCamera({...newCamera, cameraName: e.target.value})}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Main Entrance Cam"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                  <select 
                    value={newCamera.cameraType}
                    onChange={e => setNewCamera({...newCamera, cameraType: e.target.value})}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Laptop Webcam">Laptop Webcam (0)</option>
                    <option value="RTSP">RTSP / IP Camera</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Zone</label>
                  <select 
                    value={newCamera.zone}
                    onChange={e => setNewCamera({...newCamera, zone: e.target.value})}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Assembly">Assembly</option>
                    <option value="Loading Dock">Loading Dock</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Entrance">Entrance</option>
                  </select>
                </div>
              </div>

              {newCamera.cameraType === 'RTSP' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Stream URL</label>
                  <input 
                    type="text"
                    required
                    value={newCamera.url}
                    onChange={e => setNewCamera({...newCamera, url: e.target.value})}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="rtsp://username:password@ip_address:port"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg"
                >
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
