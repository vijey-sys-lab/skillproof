import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIJJGi7d_oND9sE3aEVtgxmAkFfmf9-30",
  authDomain: "skillproof-dc2fb.firebaseapp.com",
  projectId: "skillproof-dc2fb",
  storageBucket: "skillproof-dc2fb.firebasestorage.app",
  messagingSenderId: "553755137472",
  appId: "1:553755137472:web:e9eff7983975f99c4a2425",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;