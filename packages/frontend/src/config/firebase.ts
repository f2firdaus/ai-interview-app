import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "EXPO_PUBLIC_FIREBASE_API_KEY",
  authDomain: "ai-interview-app-5e8db.firebaseapp.com",
  projectId: "ai-interview-app-5e8db",
  storageBucket: "ai-interview-app-5e8db.appspot.com",
  messagingSenderId: "123456789", 
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
