import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const violationsRef = collection(db, "violations");

export const subscribeToViolations = (callback, errorCallback) => {
  const q = query(violationsRef, orderBy("timestamp", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const violations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(violations);
    },
    (error) => {
      if (errorCallback) errorCallback(error);
    }
  );
};

export const subscribeToNewViolations = (callback) => {
  const q = query(violationsRef, orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        // Only trigger for recent violations (e.g., within the last minute)
        // to prevent firing notifications for all historical data on mount.
        const data = change.doc.data();
        const timestamp = new Date(data.timestamp).getTime();
        const now = Date.now();
        if (now - timestamp < 60000) {
           callback({ id: change.doc.id, ...data });
        }
      }
    });
  });
};

export const resolveViolation = async (violationId) => {
  const violationRef = doc(db, "violations", violationId);
  return updateDoc(violationRef, { status: "resolved" });
};
