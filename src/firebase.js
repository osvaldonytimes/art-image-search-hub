import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

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

// Export Firebase authentication methods
const loginWithGoogle = () => signInWithPopup(auth, provider);
const logout = () => signOut(auth);

export { auth, loginWithGoogle, logout };
