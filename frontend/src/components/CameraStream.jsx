import React, { useState, useEffect, useRef } from 'react';
import { Camera as CameraIcon, AlertTriangle, User, HardHat, AlertCircle, ShieldAlert, Maximize } from 'lucide-react';

export default function CameraStream({ camera, onAlarm }) {
  const [stats, setStats] = useState({
    person: false,
    helmet: true,
    vest: true,
    confidence: 0,
    risk_score: 0,
    status: 'Connecting...',
    fps: 0
  });
  
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const alarmPlayedRef = useRef(false);
  const personAudioRef = useRef(null);
  const prevPersonState = useRef(false);

  // Initialize sounds
  useEffect(() => {
    personAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3');
    personAudioRef.current.volume = 0.3; // Softer sound for person detection
  }, []);

  // Backend Stream URL
  const backendUrl = 'http://localhost:8001';
  // Use "0" for Laptop Webcam, otherwise pass the stream URL (e.g. RTSP or USB index)
  const streamQuery = camera.type === 'Laptop Webcam' ? '0' : encodeURIComponent(camera.url || '0');
  
  // Use state for the feed URL so it only generates once per mount, but is unique per mount
  const [videoFeedUrl] = useState(`${backendUrl}/video_feed?url=${streamQuery}&camera_id=${camera.id}&t=${Date.now()}`);

  useEffect(() => {
    // Poll for live stats
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/status?url=${streamQuery}`);
        const data = await res.json();
        setStats(data);

        // Play person detection sound when person appears
        if (data.person && !prevPersonState.current) {
          if (personAudioRef.current) {
            personAudioRef.current.play().catch(e => console.log("Audio play prevented", e));
          }
        }
        prevPersonState.current = data.person;

        if (data.risk_score >= 40) {
          if (!alarmPlayedRef.current) {
            onAlarm && onAlarm(camera, data);
            alarmPlayedRef.current = true;
          }
        } else {
          alarmPlayedRef.current = false;
        }

      } catch (err) {
        console.error("Failed to fetch camera stats:", err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [streamQuery, camera, onAlarm]);

  const hasViolation = stats.risk_score >= 40;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col h-full bg-slate-900 border-2 transition-colors duration-300 ${hasViolation ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-slate-800'}`}>
      
      {/* Video Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
        
        {/* Fullscreen Button */}
        <button 
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Fullscreen"
        >
          <Maximize size={16} />
        </button>

        {hasViolation && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg animate-pulse">
            <AlertTriangle size={14} className="mr-1" /> VIOLATION DETECTED
          </div>
        )}
        
        {/* The MJPEG feed */}
        <img 
          ref={imgRef}
          src={videoFeedUrl}
          alt={`Stream from ${camera.name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // e.target.style.display = 'none'; // Fallback logic handled visually by missing src
          }}
        />
      </div>

      {/* Live AI Detection Panel */}
      <div className="p-3 bg-slate-800 flex-grow flex flex-col justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Detection</h4>
          {/* Stats Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className={`p-2 rounded flex flex-col items-center justify-center ${stats.person ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-800' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
              <User size={18} className="mb-1" />
              <span className="text-xs font-semibold">{stats.person ? 'DETECTED' : 'NO PERSON'}</span>
            </div>
            <div className={`p-2 rounded flex flex-col items-center justify-center ${!stats.helmet ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-green-900/40 text-green-400 border border-green-800'}`}>
              <HardHat size={18} className="mb-1" />
              <span className="text-xs font-semibold">{stats.helmet ? 'HELMET OK' : 'NO HELMET'}</span>
            </div>
            <div className={`p-2 rounded flex flex-col items-center justify-center ${!stats.vest ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-green-900/40 text-green-400 border border-green-800'}`}>
              <ShieldAlert size={18} className="mb-1" />
              <span className="text-xs font-semibold">{stats.vest ? 'VEST OK' : 'NO VEST'}</span>
            </div>
            <div className={`p-2 rounded flex flex-col items-center justify-center ${(!stats.gloves || !stats.shoes) ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-green-900/40 text-green-400 border border-green-800'}`}>
              <AlertCircle size={18} className="mb-1" />
              <span className="text-xs font-semibold text-center">{stats.gloves && stats.shoes ? 'OTHER OK' : (!stats.gloves ? 'NO GLOVES' : 'NO SHOES')}</span>
            </div>
          </div>

        {/* Confidence Status */}
        <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-white/5">
            <span className="flex items-center text-slate-300">
              <AlertCircle size={14} className="mr-2" /> Confidence
            </span>
            <span className="font-bold text-white">
              {stats.confidence}%
            </span>
          </div>

        {/* Risk Level Footer */}
        <div className={`mt-3 p-2 rounded flex items-center justify-between ${hasViolation ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Risk Level</span>
          <span className={`text-sm font-bold ${hasViolation ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
            {stats.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
