import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWM61R6NME4LULGcOQEDEzWG1Jcd1hrGw",
  authDomain: "desk-17e4d.firebaseapp.com",
  projectId: "desk-17e4d",
  storageBucket: "desk-17e4d.appspot.com",
  messagingSenderId: "903420238410",
  appId: "1:903420238410:web:8cde33d5a3062397c6a4b3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const database = getFirestore(app);
