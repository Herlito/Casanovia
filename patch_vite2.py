import re

with open('vite.config.ts', 'r') as f:
    text = f.read()

text = text.replace("dedupe: ['react', 'react-dom']", "dedupe: ['react', 'react-dom', 'firebase', 'zustand']")

with open('vite.config.ts', 'w') as f:
    f.write(text)

print("Vite config patched again!")
