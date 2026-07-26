import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteDialog({ isOpen, onClose, onConfirm, workerName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-white/10 rounded-xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Delete Worker?</h3>
        <p className="text-sm text-slate-400 mb-1">{workerName}</p>
        <p className="text-xs text-slate-500 mb-6">This action cannot be undone.</p>
        
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
