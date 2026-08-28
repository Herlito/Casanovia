import re
with open('src/components/floorplan/FurniturePaths.ts', 'r') as f:
    text = f.read()

# Replace any occurrence of } }, armchair_luis_xv: {
text = re.sub(r'\}\s*\}\s*,\s*armchair_luis_xv:\s*\{', '},\n  armchair_luis_xv: {', text)

with open('src/components/floorplan/FurniturePaths.ts', 'w') as f:
    f.write(text)
print("Fixed!")
