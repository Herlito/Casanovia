import re

with open('src/components/private/SettingsModule.tsx', 'r') as f:
    text = f.read()

text = text.replace("value={formData.ceremonyVenue.googleMapsUrl || formData.ceremonyVenue.mapUrl || ''}", "value={formData.ceremonyVenue.googleMapsUrl || ''}")
text = text.replace("ceremonyVenue: { ...formData.ceremonyVenue, googleMapsUrl: e.target.value, mapUrl: e.target.value }", "ceremonyVenue: { ...formData.ceremonyVenue, googleMapsUrl: e.target.value }")
text = text.replace("value={formData.receptionVenue.mapUrl}", "value={formData.receptionVenue.googleMapsUrl || ''}")
text = text.replace("receptionVenue: { ...formData.receptionVenue, mapUrl: e.target.value }", "receptionVenue: { ...formData.receptionVenue, googleMapsUrl: e.target.value }")

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(text)
