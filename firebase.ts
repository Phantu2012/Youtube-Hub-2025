// FIX: Corrected Firebase imports to use the compat library for v8 syntax compatibility.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase using v8 syntax, preventing re-initialization.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize and export Firebase services using v8 syntax.
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, db, googleProvider, firebaseConfig };
