import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAubzHKVz3_b14M2Mdea-qd9DP6CEgn6wE",
  authDomain: "utc-hardware-pos.firebaseapp.com",
  projectId: "utc-hardware-pos",
  storageBucket: "utc-hardware-pos.appspot.com",
  messagingSenderId: "1885261795128",
  appId: "1:1885261795128:web:41e9b58bdc3eb475d2bbcd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);