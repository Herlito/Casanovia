import re

with open('src/components/Navbar.tsx', 'r') as f:
    text = f.read()

# 1. Update header background based on isPublicHomeLanding && !currentUser.isAuthenticated
old_header = '<header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADDCE] shadow-xs">'
new_header = '{/* Updated Header Background */}\n      <header className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-xs ${isPublicHomeLanding && !currentUser.isAuthenticated ? "bg-[#EBEBEB] border-[#D4D4D4]" : "bg-[#FDFBF7]/95 border-[#EADDCE]"}`}>'

text = text.replace(old_header, new_header)

# 2. Update the sandwich button in the center
old_center_button = """                    className={`p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs ${
                      sandwichMenuOpen
                        ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] shadow-md ring-2 ring-[#8B3A4A]/30'
                        : 'bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#2D2A26] border-[#D9CEBF]'
                    }`}"""

new_center_button = """                    className={
                      (!currentUser.isAuthenticated && isPublicHomeLanding)
                        ? "p-3 sm:p-4 rounded-full bg-[#F5F5F5] text-gray-500 shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,1),inset_3px_3px_6px_rgba(0,0,0,0.05),inset_-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[inset_5px_5px_15px_rgba(0,0,0,0.1),inset_-5px_-5px_15px_rgba(255,255,255,1)] transition-all duration-200 cursor-pointer border-none"
                        : `p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs ${
                            sandwichMenuOpen
                              ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] shadow-md ring-2 ring-[#8B3A4A]/30'
                              : 'bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#2D2A26] border-[#D9CEBF]'
                          }`
                    }"""

text = text.replace(old_center_button, new_center_button)

# 3. Update the icon color for the neomorphic button
old_center_icon = """                    {sandwichMenuOpen ? (
                      <X className="w-5 h-5 transition-transform" />
                    ) : (
                      <Menu className="w-5 h-5 text-[#8B3A4A] transition-transform" />
                    )}"""
new_center_icon = """                    {sandwichMenuOpen ? (
                      <X className={!currentUser.isAuthenticated && isPublicHomeLanding ? "w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" : "w-5 h-5 transition-transform"} />
                    ) : (
                      <Menu className={!currentUser.isAuthenticated && isPublicHomeLanding ? "w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" : "w-5 h-5 text-[#8B3A4A] transition-transform"} />
                    )}"""

text = text.replace(old_center_icon, new_center_icon)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(text)
