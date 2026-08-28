with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    text = f.read()

text = text.replace("import {\n  Circle,", "import {\n  ArrowUpToLine,\n  ArrowDownToLine,\n  Circle,")

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(text)
print("Patched imports!")
