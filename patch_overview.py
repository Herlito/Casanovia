import re

with open('src/components/private/NoviosOverviewPanel.tsx', 'r') as f:
    text = f.read()

text = text.replace("'guests' | 'seating' | 'vendors' | 'budget' | 'timeline' | 'checklist' | 'settings' | 'invitations'", "'guests' | 'seating' | 'vendors' | 'budget' | 'timeline' | 'checklist' | 'settings'")
text = text.replace("onNavigateTab('invitations')", "onNavigateTab('guests')")

with open('src/components/private/NoviosOverviewPanel.tsx', 'w') as f:
    f.write(text)
