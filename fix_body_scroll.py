import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    content = f.read()

effect_code = """  useEffect(() => {
    // Prevent body scroll when editor is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {"""

content = content.replace("  useEffect(() => {", effect_code, 1)

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(content)
