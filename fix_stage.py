import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

bad_pattern = re.compile(r'oconst handleKeyDown = \(e: KeyboardEvent\) => \{.*?\n const handleKeyDown = \(e: KeyboardEvent\) => \{', re.DOTALL)
content = bad_pattern.sub('const handleKeyDown = (e: KeyboardEvent) => {', content)

# Also need to remove all the other duplicated blocks if any
# Let's just find the first `const handleKeyDown = (e: KeyboardEvent) => {` and everything until the end of that useEffect, and rewrite it correctly.
