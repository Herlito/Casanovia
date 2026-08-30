import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_bg = '<div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2A26] font-sans antialiased selection:bg-[#8B3A4A]/20 selection:text-[#8B3A4A]">'
new_bg = '{/* Conditionally update background based on unauthenticated home landing */}\n    <div className={`min-h-screen flex flex-col ${isPublicHomeLanding && !currentUser?.isAuthenticated ? "bg-[#EBEBEB]" : "bg-[#FDFBF7]"} text-[#2D2A26] font-sans antialiased selection:bg-[#8B3A4A]/20 selection:text-[#8B3A4A]`}>'

text = text.replace(old_bg, new_bg)

with open('src/App.tsx', 'w') as f:
    f.write(text)
