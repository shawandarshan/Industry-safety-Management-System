import { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, Play, Square, X } from 'lucide-react';

export default function LiveCamera() {
  const [isTesting, setIsTesting] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [violationActive, setViolationActive] = useState(false);
  // Using a standard warning beep sound
  const audioRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));

  const handleStartTest = async () => {
    setIsTesting(true);
    setServerReady(false);
    setViolationActive(false);
    try {
      // Auto-start the camera subprocess on the backend
      await fetch("http://localhost:8000/camera/start", { method: "POST" });
    } catch (e) {
      console.error("Failed to start camera subprocess", e);
    }
  };

  const handleStopTest = async () => {
    setIsTesting(false);
    setServerReady(false);
    setViolationActive(false);
    try {
      // Stop the camera subprocess
      await fetch("http://localhost:8000/camera/stop", { method: "POST" });
    } catch (e) {
      console.error("Failed to stop camera subprocess", e);
    }
  };

  // Poll the stream server for violation status and readiness
  useEffect(() => {
    let interval;
    if (isTesting) {
      interval = setInterval(async () => {
        try {
          const res = await fetch("http://localhost:8001/status");
          if (res.ok) {
            setServerReady(true);
            const data = await res.json();
            setViolationActive(data.violation);
            
            // Play alert sound if a violation is active
            if (data.violation) {
              audioRef.current.play().catch(e => console.log("Audio play prevented by browser:", e));
            }
          }
        } catch (e) {
          // Stream server might be offline or starting up
          setServerReady(false);
        }
      }, 1000); // Check every second
    }
    return () => clearInterval(interval);
  }, [isTesting]);

  // Ensure camera is stopped when component unmounts
  useEffect(() => {
    return () => {
      fetch("http://localhost:8000/camera/stop", { method: "POST" }).catch(e => console.error(e));
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Camera Feeds</h1>
          <p className="text-gray-500 mt-1">Real-time AI monitoring of the factory floor.</p>
        </div>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-400 cursor-pointer transition-colors">
            <option>All Zones</option>
            <option>Assembly Line A</option>
            <option>Loading Dock</option>
            <option>Warehouse</option>
          </select>
        </div>
      </div>

      {/* Pop-up Modal for Live Test */}
      {isTesting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white">
              <h3 className="font-semibold flex items-center text-lg">
                <Camera size={20} className="mr-2 text-blue-400" /> SafetyHub Monitor - Live Test
              </h3>
              <button 
                onClick={handleStopTest}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row h-[70vh] bg-gray-950">
              {/* Video Feed Area */}
              <div className="flex-1 relative flex items-center justify-center bg-black">
                {serverReady ? (
                  <img 
                    // Cache-busting query param ensures fresh load when restarting test
                    src={`http://localhost:8001/video_feed?t=${Date.now()}`} 
                    alt="Live Camera Feed"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 w-full h-full">
                    <AlertCircle size={48} className="text-yellow-500 animate-pulse mb-4" />
                    <p className="text-white text-xl font-medium">Starting AI Camera Feed...</p>
                    <p className="text-gray-400 mt-2">Connecting to the webcam and loading YOLOv8 models.</p>
                    <div className="mt-8 flex items-center text-sm text-gray-500">
                       <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-bounce"></span>
                       Auto-start requested via backend
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Stats Area */}
              <div className="w-full lg:w-80 bg-gray-900 p-6 border-l border-gray-800 flex flex-col">
                <h4 className="text-gray-400 font-medium uppercase tracking-wider text-xs mb-4">Live Analysis</h4>
                
                <div className="space-y-4 flex-1">
                  <div className={`bg-gray-800 p-4 rounded-lg border ${violationActive ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-gray-700'} shadow-inner transition-colors duration-300`}>
                     <p className="text-sm text-gray-400 mb-1">Status</p>
                     {violationActive ? (
                       <p className="text-red-500 font-mono flex items-center font-bold">
                          <AlertCircle size={16} className="mr-2 animate-pulse" />
                          PPE VIOLATION DETECTED
                       </p>
                     ) : (
                       <p className="text-green-400 font-mono flex items-center font-medium">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                          Scanning for Workers...
                       </p>
                     )}
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-inner">
                     <p className="text-sm text-gray-400 mb-3">PPE Checklist Requirements</p>
                     <ul className={`space-y-3 text-sm ${violationActive ? 'text-red-300' : 'text-gray-300'}`}>
                        <li className="flex items-center">
                          <span className={`w-5 h-5 rounded border ${violationActive ? 'border-red-500 bg-red-900/30 text-red-500' : 'border-gray-600 bg-gray-900'} mr-3 flex items-center justify-center font-bold`}>
                            {violationActive && '✗'}
                          </span> 
                          Safety Helmet
                        </li>
                        <li className="flex items-center">
                          <span className={`w-5 h-5 rounded border ${violationActive ? 'border-red-500 bg-red-900/30 text-red-500' : 'border-gray-600 bg-gray-900'} mr-3 flex items-center justify-center font-bold`}>
                            {violationActive && '✗'}
                          </span> 
                          High-Vis Vest
                        </li>
                        <li className="flex items-center">
                          <span className={`w-5 h-5 rounded border ${violationActive ? 'border-red-500 bg-red-900/30 text-red-500' : 'border-gray-600 bg-gray-900'} mr-3 flex items-center justify-center font-bold`}>
                            {violationActive && '✗'}
                          </span> 
                          Safety Shoes
                        </li>
                     </ul>
                     <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">Model: YOLOv8 (yolov8n.pt)</p>
                  </div>
                </div>

                <button 
                  onClick={handleStopTest}
                  className="w-full bg-red-600/90 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center shadow-lg"
                >
                  <Square size={18} className="mr-2" fill="currentColor" /> Stop Live Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mock Camera Feed 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Camera size={18} className="mr-2 text-gray-500" /> Cam-01: Assembly Line A
            </h3>
            <button
              onClick={handleStartTest}
              className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Play size={16} className="mr-2" fill="currentColor" /> Start Test
            </button>
          </div>
          <div className="relative bg-gray-900 aspect-video flex items-center justify-center overflow-hidden group">
            <p className="text-gray-400 font-mono text-sm z-10">System Idle. Awaiting Start.</p>
            <div className="absolute inset-0 bg-gray-800/50 group-hover:bg-gray-800/30 transition-colors"></div>
          </div>
        </div>

        {/* Mock Camera Feed 2 (Showing Violation) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ring-2 ring-red-500 ring-opacity-50">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
            <h3 className="font-semibold text-red-800 flex items-center">
              <Camera size={18} className="mr-2 text-red-500" /> Cam-02: Loading Dock
            </h3>
            <span className="flex items-center text-xs font-medium text-red-600 bg-red-100 px-2.5 py-1 rounded-full shadow-sm">
              <AlertCircle size={14} className="mr-1" />
              VIOLATION DETECTED
            </span>
          </div>
          <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
             <p className="text-gray-400 font-mono text-sm">Offline...</p>
             
             {/* Mock Bounding Box - Violation */}
             <div className="absolute border-2 border-blue-500 w-40 h-72 top-1/5 right-1/4">
              <span className="bg-blue-500 text-white text-xs px-1 absolute -top-4 left-0">Person 0.92</span>
              <div className="absolute border-2 border-red-500 w-20 h-20 top-2 left-10 animate-pulse">
                <span className="bg-red-500 text-white text-[10px] px-1 absolute -top-4 left-0 font-bold tracking-wide">MISSING: Helmet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
