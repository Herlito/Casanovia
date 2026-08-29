import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

# We need to find the specific div that wraps the buttons, which starts with:
# <div className="flex items-center space-x-2">
#          <button onClick={handleAddText}
pattern = r'<div className="flex items-center space-x-2">\s*<button onClick=\{handleAddText\}'
replacement = '<div className="hidden md:flex items-center space-x-2">\n          <button onClick={handleAddText}'

text = re.sub(pattern, replacement, text)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
