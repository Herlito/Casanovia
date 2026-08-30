import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_destruct = """  const { 
    viewMode, 
    settings, 
    isFirebaseLoading, 
    isPublicHomeLanding,"""

new_destruct = """  const { 
    viewMode, 
    settings, 
    isFirebaseLoading, 
    isPublicHomeLanding,
    currentUser,"""

text = text.replace(old_destruct, new_destruct)

with open('src/App.tsx', 'w') as f:
    f.write(text)
