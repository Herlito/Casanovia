import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    content = f.read()

# Remove floorplan tab
content = re.sub(r"\{\s*id:\s*'floorplan',\s*label:\s*'Plano',\s*icon:\s*Map\s*\},?\n?", "", content)

# Remove Dropdown entirely and replace button with div
regex = re.compile(
    r'<div className="relative shrink-0" ref=\{weddingDropdownRef\}>\s*<button.*?onClick=\{.*?setWeddingDropdownOpen.*?\}.*?>\s*(.*?)\s*<ChevronDown.*?>\s*</div>\s*</button>.*?\{/\* Dropdown Menu for Multi-Weddings \*/\}.*?\{weddingDropdownOpen && \(.*?\)\}\s*</div>',
    re.DOTALL
)

replacement = """<div className="relative shrink-0">
                    <div
                      className={isNeumorphic ? "flex items-center space-x-2.5 text-left bg-[#EBEBEB] rounded-2xl px-3.5 py-1.5 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff]" : "flex items-center space-x-2.5 text-left bg-[#EBEBEB]/90 border border-transparent rounded-2xl px-3.5 py-1.5 shadow-xs"}
                    >
                      \\1
                      </div>
                    </div>
                  </div>"""

content = regex.sub(replacement, content)

with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(content)

