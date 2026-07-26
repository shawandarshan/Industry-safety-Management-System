import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const WORKERS_COLLECTION = 'workers';

/**
 * Subscribes to the workers collection for real-time updates.
 * @param {Function} callback - Function called with the fetched data
 * @param {Function} errorCallback - Function called on error
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToWorkers = (callback, errorCallback) => {
  const workersCol = collection(db, WORKERS_COLLECTION);
  
  return onSnapshot(workersCol, (snapshot) => {
    const workersData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(workersData);
  }, (error) => {
    if (errorCallback) errorCallback(error);
  });
};

/**
 * Adds a new worker to Firestore
 * @param {Object} workerData 
 */
export const addWorker = async (workerData) => {
  return await addDoc(collection(db, WORKERS_COLLECTION), {
    ...workerData,
    violations: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

/**
 * Updates an existing worker in Firestore
 * @param {string} workerId 
 * @param {Object} workerData 
 */
export const updateWorker = async (workerId, workerData) => {
  const workerRef = doc(db, WORKERS_COLLECTION, workerId);
  return await updateDoc(workerRef, {
    ...workerData,
    updatedAt: serverTimestamp()
  });
};

/**
 * Deletes a worker from Firestore
 * @param {string} workerId 
 */
export const deleteWorker = async (workerId) => {
  const workerRef = doc(db, WORKERS_COLLECTION, workerId);
  return await deleteDoc(workerRef);
};
