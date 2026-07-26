import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditWorkerModal({ isOpen, onClose, onSave, worker }) {
  const [formData, setFormData] = useState({
    name: '', employeeId: '', department: 'Assembly', role: '', 
    email: '', phone: '', shift: 'Morning', status: 'Active', safetyScore: 100, imageUrl: ''
  });

  useEffect(() => {
    if (worker) {
      setFormData(worker);
    }
  }, [worker]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-slate-800/80">
          <h2 className="text-lg font-bold text-white">Update Worker</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Employee ID</label>
              <input required type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 outline-none">
                <option value="Assembly">Assembly</option>
                <option value="Loading Dock">Loading Dock</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
              <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 outline-none">
                <option value="Active">Active</option>
                <option value="Excellent">Excellent</option>
                <option value="Warning">Warning</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Safety Score</label>
              <input type="number" min="0" max="100" value={formData.safetyScore} onChange={e => setFormData({...formData, safetyScore: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 outline-none" />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-white/5 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
