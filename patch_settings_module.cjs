const fs = require('fs');
let code = fs.readFileSync('src/components/private/SettingsModule.tsx', 'utf8');

code = code.replace(
  "weddings,",
  "weddings,\n    accessibleWeddings,"
);

code = code.replace(
  "const sortedWeddings: Wedding[] = sortWeddingsByDate(weddings);",
  "const sortedWeddings: Wedding[] = sortWeddingsByDate(accessibleWeddings);"
);

fs.writeFileSync('src/components/private/SettingsModule.tsx', code);
