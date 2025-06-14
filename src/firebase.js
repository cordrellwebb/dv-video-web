import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAkVF2K1BlDtW250a3IEHAY6arsGKb0YY",
  authDomain: "testvideodv.firebaseapp.com",
  projectId: "testvideodv",
  storageBucket: "testvideodv.firebasestorage.app",
  messagingSenderId: "780912840085",
  appId: "1:780912840085:web:25a57bb66fd3c72aabba9c",
  measurementId: "G-WPSMFJWGNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
// Optionally export analytics if you want to use it elsewhere:
export { analytics };