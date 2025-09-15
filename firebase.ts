// FIX: Corrected Firebase imports to use the compat library for v8 syntax compatibility.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
// FIX: Updated configuration to match the user's correct Firebase project ID.
export const firebaseConfig = {
  apiKey: "AIzaSyAUnmo1FRReKnMpHqHB1jVJD5CdfGA4x2E",
  authDomain: "youtube-video-hub-1017358933371.firebaseapp.com",
  projectId: "youtube-video-hub-1017358933371",
  storageBucket: "youtube-video-hub-1017358933371.appspot.com",
  messagingSenderId: "1017358933371",
  appId: "1:1017358933371:web:7ea24fae4b72aab06771de",
  measurementId: "G-439MDT7ETH"
};

// Initialize Firebase using v8 syntax, preventing re-initialization.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize and export Firebase services using v8 syntax.
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, db, googleProvider };