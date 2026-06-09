// This configuration has been updated with the correct values from your Firebase project.
// The app should now connect to your Firebase services correctly.

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAUnmo1FRReKnMpHqHB1jVJD5CdfGA4x2E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "video-hub-1aabc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "video-hub-1aabc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "video-hub-1aabc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1017358933371",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1017358933371:web:7ea24fae4b72aab06771de",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-439MDT7ETH"
};
