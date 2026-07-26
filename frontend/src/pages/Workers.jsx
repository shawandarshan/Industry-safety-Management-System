import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, MoreVertical, Eye, Edit2, Trash2, 
  Users, Trophy, AlertTriangle, TrendingUp, User, X, Check, Activity
} from 'lucide-react';

import { subscribeToWorkers, addWorker, updateWorker, deleteWorker } from '../services/workerService';
import AddWorkerModal from '../components/AddWorkerModal';
import EditWorkerModal from '../components/EditWorkerModal';
import DeleteDialog from '../components/DeleteDialog';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch Workers from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToWorkers(
      (workersData) => {
        setWorkers(workersData);
        setFirebaseError(null);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase Error: ", error);
        if (error.code === 'permission-denied') {
          setFirebaseError("Permission Denied: Your Firestore rules are set to 'allow read, write: if false;'. Please update them in the Firebase Console.");
        } else {
          setFirebaseError(error.message);
        }
        setWorkers([]); // Ensure empty state on error
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // CRUD Operations
  const handleAddWorker = async (formData) => {
    try {
      await addWorker(formData);
      setIsAddModalOpen(false);
      showToast('Worker successfully added!');
    } catch (error) {
      console.error("Error adding worker: ", error);
      setIsAddModalOpen(false);
      if (error.code === 'permission-denied') {
        showToast('❌ Firebase blocked save. Check Firestore Rules.');
      } else {
        showToast('❌ Failed to add worker: ' + error.message);
      }
    }
  };

  const handleEditWorker = async (formData) => {
    try {
      await updateWorker(selectedWorker.id, formData);
      setIsEditModalOpen(false);
      setSelectedWorker(null);
      showToast('Worker successfully updated!');
    } catch (error) {
      console.error("Error updating worker: ", error);
      setIsEditModalOpen(false);
      if (error.code === 'permission-denied') {
        showToast('❌ Firebase blocked update. Check Firestore Rules.');
      } else {
        showToast('❌ Failed to update worker: ' + error.message);
      }
      setSelectedWorker(null);
    }
  };

  const handleDeleteWorker = async () => {
    try {
      await deleteWorker(selectedWorker.id);
      setIsDeleteModalOpen(false);
      setSelectedWorker(null);
      showToast('Worker successfully deleted!');
    } catch (error) {
      console.error("Error deleting worker: ", error);
      setIsDeleteModalOpen(false);
      if (error.code === 'permission-denied') {
        showToast('❌ Firebase blocked deletion. Check Firestore Rules.');
      } else {
        showToast('❌ Failed to delete worker: ' + error.message);
      }
      setSelectedWorker(null);
    }
  };

  const openEditModal = (worker) => {
    setSelectedWorker(worker);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (worker) => {
    setSelectedWorker(worker);
    setIsDeleteModalOpen(true);
  };

  // Filtering
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name?.toLowerCase().includes(searchTerm.toLowerCase()) || w.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || w.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusColor = (status, score) => {
    if (status === 'Excellent' || score >= 90) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (status === 'Warning' || score < 75) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (status === 'Suspended' || score < 50) return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20'; // Active
  };

  const avgSafety = workers.length ? Math.round(workers.reduce((acc, curr) => acc + (Number(curr.safetyScore) || 0), 0) / workers.length) : 0;
  const needsAttention = workers.filter(w => w.safetyScore < 75).length;
  const topPerformer = workers.length ? [...workers].sort((a,b) => b.safetyScore - a.safetyScore)[0] : null;

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Worker Tracking</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage employees, track safety scores, and update profiles.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <Plus size={16} className="mr-2" />
          Add Worker
        </button>
      </div>

      {firebaseError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-bold text-red-400">Database Connection Issue</h3>
            <p className="text-sm text-slate-300 mt-1">{firebaseError}</p>
            <p className="text-sm text-slate-400 mt-2">Currently showing simulated local data. Changes won't be saved to the cloud.</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Workers</p>
            <p className="text-2xl font-bold text-white mt-1">{workers.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Users size={24} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Top Performer</p>
            <p className="text-xl font-bold text-green-400 mt-1">{topPerformer ? topPerformer.name.split(' ')[0] : '-'}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <Trophy size={24} className="text-green-500" />
          </div>
        </div>
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Needs Attention</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{needsAttention}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-slate-800 border border-white/5 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Average Safety</p>
            <div className="flex items-center mt-1">
              <p className="text-2xl font-bold text-white mr-2">{avgSafety}%</p>
              <TrendingUp size={16} className="text-green-500" />
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Activity size={24} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-800 border border-white/5 rounded-xl overflow-hidden shadow-sm flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/50">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-slate-500"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-auto"
            >
              <option value="All">All Departments</option>
              <option value="Assembly">Assembly</option>
              <option value="Loading Dock">Loading Dock</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Warning">Warning</option>
              <option value="Excellent">Excellent</option>
            </select>
            <button 
              onClick={() => { setSearchTerm(''); setDepartmentFilter('All'); setStatusFilter('All'); }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium text-center">Score</th>
                <th className="p-4 font-medium text-center">Violations</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">Loading workers...</td>
                </tr>
              ) : filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">No workers found.</td>
                </tr>
              ) : (
                filteredWorkers.map(worker => (
                  <tr key={worker.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center">
                        {worker.imageUrl ? (
                          <img src={worker.imageUrl} alt={worker.name} className="w-8 h-8 rounded-full mr-3 object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-3 border border-white/10">
                            {worker.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{worker.name}</p>
                          <p className="text-xs text-slate-400">{worker.employeeId || worker.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{worker.department}</td>
                    <td className="p-4 text-sm text-slate-300">{worker.role}</td>
                    <td className="p-4 text-center">
                      <span className={`text-sm font-bold ${Number(worker.safetyScore) >= 90 ? 'text-green-400' : Number(worker.safetyScore) >= 75 ? 'text-white' : 'text-amber-400'}`}>
                        {worker.safetyScore}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-sm font-medium ${Number(worker.violations) > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {worker.violations || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(worker.status, worker.safetyScore)} flex items-center w-fit`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {worker.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEditModal(worker)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(worker)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddWorkerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddWorker} 
      />

      <EditWorkerModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setSelectedWorker(null); }} 
        onSave={handleEditWorker} 
        worker={selectedWorker} 
      />

      <DeleteDialog 
        isOpen={isDeleteModalOpen} 
        onClose={() => { setIsDeleteModalOpen(false); setSelectedWorker(null); }} 
        onConfirm={handleDeleteWorker} 
        workerName={selectedWorker?.name} 
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-800 border border-green-500/30 shadow-xl rounded-lg px-4 py-3 flex items-center space-x-3">
            <div className="bg-green-500/20 rounded-full p-1">
              <Check size={16} className="text-green-500" />
            </div>
            <p className="text-sm font-medium text-white">{toastMessage}</p>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white transition-colors ml-4">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
