import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

# Let's find the places where we could inject the GradientEditor component
print("Line 1:", content[:100])
