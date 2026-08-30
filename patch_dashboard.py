import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    text = f.read()

# Hide labels in mobile for navTabs
text = text.replace(
    '<span>{tab.label}</span>',
    '<span className="hidden sm:inline">{tab.label}</span>'
)

# Remove padding from main container for 100% width on mobile
text = text.replace(
    '<div className="flex-1 flex max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-6 gap-4 sm:gap-6">',
    '<div className="flex-1 flex max-w-7xl w-full mx-auto px-0 sm:px-6 lg:px-8 py-2 sm:py-6 gap-0 sm:gap-6">'
)

with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(text)
