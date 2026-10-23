import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const snap = await getDoc(doc(db, 'weddingcraft_published', 'boda-erika-yemar-6398'));
  console.log('Exists?', snap.exists());
  if (snap.exists()) {
    console.log('Keys:', Object.keys(snap.data() || {}));
  }
}
check().catch(console.error);
