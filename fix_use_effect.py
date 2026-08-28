import re

with open('src/context/WeddingContext.tsx', 'r') as f:
    code = f.read()

# Extract the useEffect block
regex = r"(  // Sync currentUser with systemUsers updates from Firestore\n  React\.useEffect\(\(\) => \{.*?\n  \}, \[systemUsers, currentUser\.id, currentUser\.isAuthenticated, currentUser\.level, currentUser\.assignedWeddingIds, currentUser\.createdWeddingIds\]\);\n)"

match = re.search(regex, code, re.DOTALL)
if match:
    effect_block = match.group(1)
    # Remove it from its current position
    code = code[:match.start()] + code[match.end():]
    
    # Find systemUsers declaration
    system_users_regex = r"(  // System Users state \(Admin & Anfitrión roles\)\n  const \[systemUsers, setSystemUsers\] = useState<SystemUser\[\]>\(INITIAL_SYSTEM_USERS\);\n)"
    system_users_match = re.search(system_users_regex, code)
    if system_users_match:
        # Insert after systemUsers declaration
        insert_pos = system_users_match.end()
        code = code[:insert_pos] + "\n" + effect_block + code[insert_pos:]
        with open('src/context/WeddingContext.tsx', 'w') as f:
            f.write(code)
        print("Successfully moved the useEffect block.")
    else:
        print("Could not find systemUsers declaration.")
else:
    print("Could not find useEffect block.")

