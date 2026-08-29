with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace("eventId: activeWedding?.id || 'demo_event',", "eventId: settings?.id || 'demo_event',")
text = text.replace("settings?.id", "(settings as any)?.id")

with open('src/App.tsx', 'w') as f:
    f.write(text)
