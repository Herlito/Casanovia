import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  const snapshot = await getDocs(collection(db, 'weddings'));
  snapshot.forEach(doc => {
    console.log(doc.id, '=> createdByUserId:', doc.data().createdByUserId, 'createdByUserName:', doc.data().createdByUserName);
  });
  process.exit(0);
}
main();
