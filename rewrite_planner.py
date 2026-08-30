import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    text = f.read()

# Add appTheme to useWedding extraction
if "appTheme," not in text and "appTheme " not in text:
    text = text.replace("    currentUser,", "    currentUser,\n    appTheme,")

# Define isNeumorphic
if "const isNeumorphic" not in text:
    text = text.replace("const [activeTab, setActiveTab]", "const isNeumorphic = appTheme === 'neumorphic';\n  const [activeTab, setActiveTab]")

with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(text)
