const fs = require('fs');
let code = fs.readFileSync('src/context/WeddingContext.tsx', 'utf8');

const effectCode = \`
  // Sync currentUser with systemUsers updates from Firestore
  React.useEffect(() => {
    if (currentUser.isAuthenticated && currentUser.id) {
      const freshUser = systemUsers.find(u => u.id === currentUser.id);
      if (freshUser) {
        let hasChanges = false;
        
        const currentAssigned = currentUser.assignedWeddingIds || [];
        const freshAssigned = freshUser.assignedWeddingIds || [];
        if (currentAssigned.length !== freshAssigned.length || !currentAssigned.every(id => freshAssigned.includes(id))) {
          hasChanges = true;
        }
        
        const currentCreated = currentUser.createdWeddingIds || [];
        const freshCreated = freshUser.createdWeddingIds || [];
        if (currentCreated.length !== freshCreated.length || !currentCreated.every(id => freshCreated.includes(id))) {
          hasChanges = true;
        }

        if (currentUser.level !== freshUser.level) {
          hasChanges = true;
        }

        if (hasChanges) {
          const updatedAuth = {
            ...currentUser,
            level: freshUser.level,
            roleTitle: freshUser.roleTitle,
            assignedWeddingIds: freshAssigned,
            createdWeddingIds: freshCreated,
          };
          setCurrentUser(updatedAuth);
          try {
            sessionStorage.setItem('wedding_hub_auth', JSON.stringify(updatedAuth));
          } catch {
            // ignore
          }
        }
      }
    }
  }, [systemUsers, currentUser]);
\`;

// Insert the effect after the currentUser state definition
code = code.replace(
  "const [currentUser, setCurrentUser] = useState<AuthUser>(() => {",
  effectCode + "\n  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {"
);

fs.writeFileSync('src/context/WeddingContext.tsx', code);
