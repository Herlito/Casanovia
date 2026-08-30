import re

with open('src/components/private/NoviosOverviewPanel.tsx', 'r') as f:
    text = f.read()

start_str = "      {/* Public Wedding Link Sharing Bar */}"
end_str = "      {/* Main 2-Column Responsive Layout */}"

if start_str in text and end_str in text:
    start_idx = text.find(start_str)
    end_idx = text.find(end_str)
    text = text[:start_idx] + text[end_idx:]
    with open('src/components/private/NoviosOverviewPanel.tsx', 'w') as f:
        f.write(text)
else:
    print("NOT FOUND")
    import sys
    sys.exit(1)
