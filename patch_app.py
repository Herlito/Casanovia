with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace("eventId: settings?.id || 'demo_event',", "eventId: activeWedding?.id || 'demo_event',")
text = text.replace("eventDate: settings?.date || new Date().toISOString(),", "eventDate: settings?.weddingDate || new Date().toISOString(),")
text = text.replace("venueName: settings?.ceremonyVenue || 'Lugar',", "venueName: settings?.ceremonyVenue?.name || 'Lugar',")

with open('src/App.tsx', 'w') as f:
    f.write(text)
