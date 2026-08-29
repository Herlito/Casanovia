import re

with open('vite.config.ts', 'r') as f:
    text = f.read()

dedupe = """    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {"""
text = text.replace("    resolve: {\n      alias: {", dedupe)

with open('vite.config.ts', 'w') as f:
    f.write(text)

print("Vite config patched!")
