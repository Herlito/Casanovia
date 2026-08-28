import re

with open('src/context/WeddingContext.tsx', 'r') as f:
    code = f.read()

effectCode = """
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
  }, [systemUsers, currentUser.id, currentUser.isAuthenticated, currentUser.level, currentUser.assignedWeddingIds, currentUser.createdWeddingIds]);
"""

code = code.replace(
    "const [currentUser, setCurrentUser] = useState<AuthUser>(() => {",
    "const [currentUser, setCurrentUser] = useState<AuthUser>(() => {"
)

# Insert after the end of the useState block
match = re.search(r"const \[currentUser, setCurrentUser\] = useState<AuthUser>\(\(\) => \{.*?\n  \}\);\n", code, re.DOTALL)
if match:
    code = code[:match.end()] + effectCode + code[match.end():]

with open('src/context/WeddingContext.tsx', 'w') as f:
    f.write(code)
