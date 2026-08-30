import re

with open('src/components/CasanoviaLoadingScreen.tsx', 'r') as f:
    text = f.read()

new_shadow = "shadow-[15px_15px_35px_rgba(0,0,0,0.15),-5px_-5px_15px_rgba(255,255,255,1),inset_10px_10px_20px_rgba(0,0,0,0.1),inset_-10px_-10px_20px_rgba(255,255,255,1)]"
old_shadow = "shadow-[15px_15px_35px_rgba(0,0,0,0.12),-15px_-15px_35px_rgba(255,255,255,0.9),inset_8px_8px_20px_rgba(0,0,0,0.08),inset_-8px_-8px_20px_rgba(255,255,255,1)]"

text = text.replace(old_shadow, new_shadow)

with open('src/components/CasanoviaLoadingScreen.tsx', 'w') as f:
    f.write(text)
