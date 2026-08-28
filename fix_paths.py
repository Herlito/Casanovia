with open('src/components/floorplan/FurniturePaths.ts', 'r') as f:
    text = f.read()

text = text.replace("};\n  ,\n  armchair_luis_xv", "  },\n  armchair_luis_xv")

with open('src/components/floorplan/FurniturePaths.ts', 'w') as f:
    f.write(text)
print("Fixed!")
