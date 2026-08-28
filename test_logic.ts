import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  const snapshot = await getDocs(collection(db, 'weddings'));
  const weddings: any[] = [];
  snapshot.forEach(doc => {
    weddings.push({ id: doc.id, ...doc.data() });
  });

  const user = {
    isAuthenticated: true,
    level: 3,
    username: 'M21',
    id: 'user-1787935045057',
    createdWeddingIds: [ 'boda-auna-clinica-7021' ],
    assignedWeddingIds: [ 'boda-auna-clinica-7021' ]
  };

  const isWeddingAccessibleByPlanner = (wedding: any, user: any): boolean => {
    if (!wedding || !user.isAuthenticated || user.level !== 3) return false;
    const uName = (user.username || '').trim().toLowerCase();
    const uId = user.id;
    const createdIds = user.createdWeddingIds || [];
    const assignedIds = user.assignedWeddingIds || [];

    if (createdIds.includes(wedding.id)) return true;
    if (assignedIds.includes(wedding.id)) return true;
    if (wedding.createdByUserId && (wedding.createdByUserId === uId || wedding.createdByUserId === user.username)) return true;
    if (wedding.createdByUserName && wedding.createdByUserName.trim().toLowerCase() === uName) return true;

    return false;
  };

  const accessibleWeddings = weddings.filter(w => isWeddingAccessibleByPlanner(w, user));
  console.log('Total weddings:', weddings.length);
  console.log('Accessible weddings:', accessibleWeddings.map(w => w.id));

  process.exit(0);
}
main();
