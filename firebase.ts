import { firebaseConfig } from './firebaseConfig';

// Add type declaration for the global firebase object created by the script tags
declare global {
  interface Window {
    firebase: any; 
  }
}

// Access the firebase object from the global window scope
const firebase = window.firebase;


// Initialize Firebase using v8 syntax, preventing re-initialization.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize and export Firebase services using v8 syntax.
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, db, googleProvider, firebase, firebaseConfig };