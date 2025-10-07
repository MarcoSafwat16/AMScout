import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjEKW28alJWb1WGXuGWzm9a1FKmTi5-N0",
  authDomain: "amscout-6bcda.firebaseapp.com",
  projectId: "amscout-6bcda",
  storageBucket: "amscout-6bcda.appspot.com",
  messagingSenderId: "552100885737",
  appId: "1:552100885737:web:dcc198b0e186f7719f2c78",
  measurementId: "G-K39VKBJD00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);