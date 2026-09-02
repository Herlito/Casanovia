import re

with open('src/WeddingCraft/components/ToolsPanel.tsx', 'r') as f:
    content = f.read()

old_countdown = """  const handleAddCountdown = () => {
    addElement({
      type: 'countdown-widget',
      content: { date: '2026-12-31' },
      style: {
        backgroundColor: '#FFFFFF',
        color: '#2D3748',
        variant: 'cards',
        opacity: 1
      },
      transform: { x: 50, y: 200, width: 280, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };"""

new_countdown = """  const handleAddCountdown = () => {
    addElement({
      type: 'countdown-widget',
      content: { 
        targetDate: '2026-12-31T00:00:00.000Z', 
        title: 'Faltan', 
        expiredMessage: '¡Llegó el gran día!' 
      },
      style: {
        backgroundColor: '#FFFFFF',
        numberColor: '#2D3748',
        titleColor: '#2D3748',
        labelColor: '#666666',
        variant: 'cards',
        opacity: 1
      },
      transform: { x: 50, y: 200, width: 280, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };"""

content = content.replace(old_countdown, new_countdown)

with open('src/WeddingCraft/components/ToolsPanel.tsx', 'w') as f:
    f.write(content)
