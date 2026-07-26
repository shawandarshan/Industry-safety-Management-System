import React, { useState, useEffect } from 'react';
import { Bell, Palette, Cpu, Camera, User, Shield, Check } from 'lucide-react';

const ToggleSwitch = ({ enabled, onChange, label }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm font-medium text-slate-300">{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-blue-600' : 'bg-slate-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const SettingsCard = ({ icon: Icon, title, children }) => (
  <div className="bg-slate-800 border border-white/10 rounded-xl overflow-hidden">
    <div className="px-5 py-4 border-b border-white/5 flex items-center bg-slate-800/50">
      <Icon size={18} className="text-slate-400 mr-3" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <div className="p-5 space-y-2">
      {children}
    </div>
  </div>
);

export default function Settings() {
  const [settings, setSettings] = useState({
    browserAlerts: true,
    emailAlerts: true,
    smsAlerts: false,
    alarmSound: true,
    darkTheme: true,
    animations: true,
    cameraFps: '30'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('safetyhub_settings_new');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('safetyhub_settings_new', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your preferences and system configuration.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {saved ? <Check size={16} className="mr-2" /> : null}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Notifications */}
        <SettingsCard icon={Bell} title="Notifications">
          <ToggleSwitch 
            label="Browser Alerts" 
            enabled={settings.browserAlerts} 
            onChange={(v) => handleChange('browserAlerts', v)} 
          />
          <ToggleSwitch 
            label="Email Alerts" 
            enabled={settings.emailAlerts} 
            onChange={(v) => handleChange('emailAlerts', v)} 
          />
          <ToggleSwitch 
            label="SMS Alerts" 
            enabled={settings.smsAlerts} 
            onChange={(v) => handleChange('smsAlerts', v)} 
          />
          <ToggleSwitch 
            label="Alarm Sound" 
            enabled={settings.alarmSound} 
            onChange={(v) => handleChange('alarmSound', v)} 
          />
        </SettingsCard>

        {/* Appearance */}
        <SettingsCard icon={Palette} title="Appearance">
          <ToggleSwitch 
            label="Dark Theme" 
            enabled={settings.darkTheme} 
            onChange={(v) => handleChange('darkTheme', v)} 
          />
          <ToggleSwitch 
            label="UI Animations" 
            enabled={settings.animations} 
            onChange={(v) => handleChange('animations', v)} 
          />
          <div className="pt-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
            <div className="flex space-x-3">
              {['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map((color) => (
                <button key={color} className={`w-6 h-6 rounded-full ${color} ring-2 ring-offset-2 ring-offset-slate-800 ${color === 'bg-blue-500' ? 'ring-white' : 'ring-transparent'}`}></button>
              ))}
            </div>
          </div>
        </SettingsCard>

        {/* Camera */}
        <SettingsCard icon={Camera} title="Camera">
          <div className="py-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Camera Refresh Rate (FPS)</label>
            <select 
              value={settings.cameraFps}
              onChange={(e) => handleChange('cameraFps', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-white bg-slate-700/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm rounded-lg"
            >
              <option value="15">15 FPS (Resource Saving)</option>
              <option value="30">30 FPS (Standard)</option>
              <option value="60">60 FPS (Ultra Smooth)</option>
            </select>
          </div>
          <ToggleSwitch 
            label="Auto-Reconnect" 
            enabled={true} 
            onChange={() => {}} 
          />
        </SettingsCard>

        {/* AI Settings */}
        <SettingsCard icon={Cpu} title="AI Settings">
           <ToggleSwitch 
            label="PPE Detection" 
            enabled={true} 
            onChange={() => {}} 
          />
          <ToggleSwitch 
            label="Proximity Alerts" 
            enabled={true} 
            onChange={() => {}} 
          />
          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Confidence Threshold</label>
            <input type="range" min="50" max="99" defaultValue="85" className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Low (More False Positives)</span>
              <span>85%</span>
            </div>
          </div>
        </SettingsCard>

        {/* Account */}
        <SettingsCard icon={User} title="Account">
          <div className="py-2 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input type="text" defaultValue="Manager" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input type="email" defaultValue="admin@safetyhub.ai" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </SettingsCard>

        {/* Security */}
        <SettingsCard icon={Shield} title="Security">
          <div className="py-2 space-y-4">
             <button className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-lg transition-colors">
               Change Password
             </button>
             <ToggleSwitch 
              label="Two-Factor Auth" 
              enabled={false} 
              onChange={() => {}} 
            />
             <button className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium py-2 rounded-lg transition-colors border border-red-500/20">
               Sign Out All Devices
             </button>
          </div>
        </SettingsCard>

      </div>
    </div>
  );
}
