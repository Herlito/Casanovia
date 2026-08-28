import re

with open('src/lib/firebase.ts', 'r') as f:
    code = f.read()

code = code.replace(
    "import { getFirestore, initializeFirestore, doc, getDoc } from 'firebase/firestore';",
    "import { getFirestore, initializeFirestore, doc, getDoc, setLogLevel } from 'firebase/firestore';\n\nsetLogLevel('error');"
)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(code)

print("Patched firebase.ts to silence warnings")
