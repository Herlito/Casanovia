const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  "export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);",
  "export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);"
);

fs.writeFileSync('src/lib/firebase.ts', code);
