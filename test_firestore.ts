import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
console.log("db is:", typeof db, db !== undefined);
