with open('src/components/floorplan/FurniturePaths.ts', 'r') as f:
    text = f.read()

# The incorrect part is:
#     height: 4818
#   }
#   },
#   armchair_luis_xv: {

text = text.replace("    height: 4818\n  }\n  },\n  armchair_luis_xv: {", "    height: 4818\n  },\n  armchair_luis_xv: {")

with open('src/components/floorplan/FurniturePaths.ts', 'w') as f:
    f.write(text)
print("Fixed!")
