import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    content = f.read()

regex = re.compile(
    r'if \(!currentUser\.isAuthenticated\) \{\s*// Instead of rendering a separate login window.*?\s*// The user requested: "no manejes ventanas diferentes para loguearse\."\s*setTimeout\(\(\) => \{\s*if \(!showAuthModal\) setShowAuthModal\(true\);\s*setViewMode\(\'public\'\);\s*\}, 100\);\s*return null;\s*\}',
    re.DOTALL
)

replacement = """if (!currentUser.isAuthenticated) {
    setTimeout(() => {
      setViewMode('public');
    }, 0);
    return null;
  }"""

content = regex.sub(replacement, content)

with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(content)
