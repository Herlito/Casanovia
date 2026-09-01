import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_code = "guides.push({ type: 'line', points: [centerX, 0, centerX, canvasConfig.height * scale] });"
new_code = "guides.push({ type: 'line', points: [canvasConfig.width / 2, -1000, canvasConfig.width / 2, canvasConfig.height + 1000] });"

content = content.replace(old_code, new_code)

old_stroke = "strokeWidth={1}"
new_stroke = "strokeWidth={1 / scale}"

# Only replace the one in Guidelines
# It's inside {guidelines.map...}
old_map = """            {/* Guidelines */}
            {guidelines.map((g, i) => (
                <Line key={`guide-${i}`} name="guideline" points={g.points} stroke="#00d2ff" strokeWidth={1} dash={[4, 4]} />
            ))}"""

new_map = """            {/* Guidelines */}
            {guidelines.map((g, i) => (
                <Line key={`guide-${i}`} name="guideline" points={g.points} stroke="#ec4899" strokeWidth={1.5 / scale} dash={[4 / scale, 4 / scale]} />
            ))}"""

content = content.replace(old_map, new_map)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
