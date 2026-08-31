import re

with open('src/components/modals/AuthModal.tsx', 'r') as f:
    content = f.read()

regex = re.compile(
    r'if\s*\(res\.success\)\s*\{\s*setSuccessMsg\(res\.message\);\s*setTimeout\(\(\)\s*=>\s*\{\s*setSuccessMsg\(\'\'\);\s*setShowAuthModal\(false\);\s*setViewMode\(\'private\'\);\s*// Navigate directly to dashboard on login\s*\},\s*1500\);\s*\}',
    re.DOTALL
)

replacement = """if (res.success) {
      setSuccessMsg('');
      setShowAuthModal(false);
      setViewMode('private');
    }"""

content = regex.sub(replacement, content)

with open('src/components/modals/AuthModal.tsx', 'w') as f:
    f.write(content)
