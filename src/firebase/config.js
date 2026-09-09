import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBO51WE4PNUwbZ1vdvIRMiI1eGUbmO5sdk",
  authDomain: "grocery-pos-af0d1.firebaseapp.com",
  projectId: "grocery-pos-af0d1",
  storageBucket: "grocery-pos-af0d1.firebasestorage.app",
  messagingSenderId: "88967261402",
  appId: "1:88967261402:web:ea78a90d72371b1b83c9e3",
};

const app = initializeApp(firebaseConfig);

// experimentalForceLongPolling works around networks (proxies, antivirus SSL
// inspection, some corporate/ISP setups) that block Firestore's normal
// streaming connection but allow plain HTTP requests through.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
