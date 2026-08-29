import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

editor_code = """
      {showWeddingCraftModal && (
        <WeddingCraftEditor
          externalAPI={{
            getEventData: () => ({
              eventId: settings?.id || 'demo_event',
              coupleNames: [settings?.coupleNames?.split(' & ')[0] || 'Novio', settings?.coupleNames?.split(' & ')[1] || 'Novia'],
              eventDate: settings?.date || new Date().toISOString(),
              venueName: settings?.ceremonyVenue || 'Lugar',
            })
          }}
          onClose={() => setShowWeddingCraftModal(false)}
        />
      )}"""

# We'll insert it right after the FloorPlanDesignerModal
text = text.replace("onClose={() => setShowFloorPlanModal(false)}\n      />", "onClose={() => setShowFloorPlanModal(false)}\n      />" + editor_code)

with open('src/App.tsx', 'w') as f:
    f.write(text)

print("App patched!")
