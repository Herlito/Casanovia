import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    content = f.read()

# Make sure we add Music icon from lucide-react if not present
if 'Music' not in content:
    content = content.replace("import { ", "import { Music, ")

new_button = """
          <button onClick={() => {
            addElement({
              type: 'audio-player',
              content: { src: '', title: 'Canción' },
              style: { backgroundColor: '#EBEBEB', color: '#2D3748', borderRadius: 24 },
              transform: { x: 50, y: 150, width: 250, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
              zIndex: 25,
              locked: false,
              visible: true
            });
          }} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Music className="w-3.5 h-3.5 text-[#2D3748]" />
            <span>Audio</span>
          </button>
"""

content = content.replace(
    '<button onClick={handleAddButton}',
    new_button + '\n          <button onClick={handleAddButton}'
)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(content)

