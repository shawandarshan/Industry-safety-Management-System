import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query } from "firebase/firestore";
import { db } from "../firebase/firebase";

const camerasRef = collection(db, "cameras");

export const subscribeToCameras = (onData, onError) => {
  const q = query(camerasRef);
  return onSnapshot(
    q,
    (snapshot) => {
      const cameras = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onData(cameras);
    },
    (error) => {
      console.error("Error in cameras subscription: ", error);
      if (onError) onError(error);
    }
  );
};

export const addCamera = async (cameraData) => {
  try {
    const docRef = await addDoc(camerasRef, {
      ...cameraData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding camera: ", error);
    throw error;
  }
};

export const updateCamera = async (id, data) => {
  try {
    const docRef = doc(db, "cameras", id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating camera: ", error);
    throw error;
  }
};

export const deleteCamera = async (id) => {
  try {
    const docRef = doc(db, "cameras", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting camera: ", error);
    throw error;
  }
};
