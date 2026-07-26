import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA8lt7L2XyKH5NrYK3t7JVT2H22YjPntkE",
  authDomain: "industry-management-syst-ec017.firebaseapp.com",
  databaseURL: "https://industry-management-syst-ec017-default-rtdb.firebaseio.com",
  projectId: "industry-management-syst-ec017",
  storageBucket: "industry-management-syst-ec017.firebasestorage.app",
  messagingSenderId: "124919303096",
  appId: "1:124919303096:web:216a4012711c0922775d4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  client_id: '124919303096-8eit76nldolcnk3ae3va5g2mblikfful.apps.googleusercontent.com'
});

// Initialize Storage
export const storage = getStorage(app);
