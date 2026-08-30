import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace('{/* Conditionally update background based on unauthenticated home landing */}\\n', '')
text = text.replace('{/* Conditionally update background based on unauthenticated home landing */}\\n    <div', '<div')
text = text.replace('{/* Conditionally update background based on unauthenticated home landing */}\n', '')

with open('src/App.tsx', 'w') as f:
    f.write(text)
