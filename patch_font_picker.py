import re

with open('src/WeddingCraft/components/FontPicker.tsx', 'r') as f:
    content = f.read()

content = content.replace('w-full bg-[#EBEBEB] border border-transparent rounded-lg px-3 py-2 text-sm text-left', 'w-full bg-[#EBEBEB] border border-transparent rounded-lg px-3 py-2 text-sm text-gray-900 text-left')
content = content.replace('text-sm bg-transparent', 'text-sm bg-transparent text-gray-900')

with open('src/WeddingCraft/components/FontPicker.tsx', 'w') as f:
    f.write(content)

