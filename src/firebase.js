import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  getDocs,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyO1gpyHCufb4mSnp-nZ0vEnrhzJDmTvE",
  authDomain: "art-image-search-hub.firebaseapp.com",
  projectId: "art-image-search-hub",
  storageBucket: "art-image-search-hub.appspot.com",
  messagingSenderId: "1048386328290",
  appId: "1:1048386328290:web:194ba724553541474a70bb",
  measurementId: "G-LVT9RSRX51",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Export Firebase authentication and Firestore methods
const loginWithGoogle = () => signInWithPopup(auth, provider);
const logout = () => signOut(auth);

export {
  auth,
  loginWithGoogle,
  logout,
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  getDocs,
};
