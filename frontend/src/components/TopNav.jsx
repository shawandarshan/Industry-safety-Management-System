import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, ChevronDown, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopNav() {
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl relative hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-500" />
        </div>
        <input 
          type="text" 
          placeholder="Search dashboard..." 
          className="bg-slate-800/50 border border-white/10 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 transition-colors placeholder-slate-500 hover:bg-slate-800"
        />
      </div>
      
      <div className="flex items-center space-x-6 ml-auto">
        {/* Clock */}
        <div className="hidden lg:flex items-center text-slate-400 text-sm font-medium">
          <Clock size={16} className="mr-2 text-slate-500" />
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none rounded-lg hover:bg-slate-800"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full font-medium">5 New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-white/5">
                  <p className="text-sm text-slate-200 font-medium flex items-center"><AlertTriangle size={14} className="text-amber-500 mr-2" /> Helmet Missing</p>
                  <p className="text-xs text-slate-400 mt-1 pl-5.5">Worker: Bob Johnson</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 pl-5.5">2 mins ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-white/5">
                  <p className="text-sm text-slate-200 font-medium flex items-center"><ShieldAlert size={14} className="text-red-500 mr-2" /> Restricted Area</p>
                  <p className="text-xs text-slate-400 mt-1 pl-5.5">Worker: Alice Smith</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 pl-5.5">5 mins ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <p className="text-sm text-slate-200 font-medium flex items-center"><AlertTriangle size={14} className="text-amber-500 mr-2" /> Machine Too Close</p>
                  <p className="text-[10px] text-slate-500 mt-1 pl-5.5">10 mins ago</p>
                </div>
              </div>
              <div className="px-4 pt-2 border-t border-white/5">
                <Link to="/violations" onClick={() => setShowNotifications(false)} className="text-xs text-blue-400 hover:text-blue-300 font-medium text-center block w-full py-1 transition-colors">
                  View All Alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center cursor-pointer group hover:bg-slate-800 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-white/5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md text-sm">
            M
          </div>
          <div className="ml-3 mr-1">
            <p className="text-sm font-semibold text-white leading-tight">{localStorage.getItem('user') || 'Manager'}</p>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Admin</p>
          </div>
          <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 ml-1 transition-colors" />
        </div>
      </div>
    </div>
  );
}
