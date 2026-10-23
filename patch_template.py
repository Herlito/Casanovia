import re

with open('src/WeddingCraft/lib/defaultWebTemplate.ts', 'r') as f:
    content = f.read()

# Replace elements array
elements_match = re.search(r'const elements: CanvasElement\[\] = \[\s*// 1\..*?\];', content, re.DOTALL)
if elements_match:
    new_elements = """const elements: CanvasElement[] = [
    // Nombre del Evento (Hero)
    {
      id: uuidv4(),
      type: 'text',
      content: { text: `${couple1} & ${couple2}` },
      style: {
        fontFamily: 'Playfair Display',
        fontSize: canvasWidth < 500 ? 32 : 44,
        color: '#2D2A26',
        align: 'center',
        lineHeight: 1.15,
        opacity: 1
      },
      transform: { x: centerX(heroWidth), y: 72, width: heroWidth, height: 64, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 1,
      locked: false,
      visible: true,
      dataBinding: { field: 'coupleNames', format: '{{0}} & {{1}}' }
    },
    // Fecha
    {
      id: uuidv4(),
      type: 'text',
      content: { text: dateFormatted },
      style: {
        fontFamily: 'Montserrat',
        fontSize: 13,
        color: '#2D3748',
        align: 'center',
        letterSpacing: 2,
        opacity: 1
      },
      transform: { x: centerX(detailsWidth), y: 150, width: detailsWidth, height: 24, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 2,
      locked: false,
      visible: true,
      dataBinding: { field: 'eventDate' }
    },
    // Lugar
    {
      id: uuidv4(),
      type: 'text',
      content: { text: venue },
      style: {
        fontFamily: 'Playfair Display',
        fontSize: 20,
        color: '#2D2A26',
        align: 'center',
        opacity: 1
      },
      transform: { x: centerX(detailsWidth), y: 180, width: detailsWidth, height: 32, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 3,
      locked: false,
      visible: true,
      dataBinding: { field: 'venueName' }
    },
    // Cuenta Regresiva
    {
      id: uuidv4(),
      type: 'countdown-widget',
      content: {
        targetDate: targetIsoDate,
        title: 'CUENTA REGRESIVA',
        expiredMessage: '¡Llegó el gran día!',
        labels: { days: 'días', hours: 'hrs', minutes: 'min' }
      },
      style: {
        backgroundColor: '#EBEBEB',
        borderColor: '#CBD5E1',
        titleColor: '#8C8276',
        numberColor: '#2D3748',
        labelColor: '#718096',
        numberFont: 'Montserrat',
        numberSize: 24,
        labelSize: 10,
        variant: 'cards',
        borderRadius: 14,
        gap: 12,
        opacity: 1
      },
      transform: { x: centerX(countdownWidth), y: 250, width: countdownWidth, height: 90, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 4,
      locked: false,
      visible: true
    },
    // Confirmar Asistencia
    {
      id: uuidv4(),
      type: 'interactive-button',
      content: {
        text: '✉️ Confirmar Asistencia',
        actionType: 'scroll-to-section',
        linkUrl: '#rsvp-section'
      },
      style: {
        backgroundColor: '#2D3748',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 16,
        fontSize: 14,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: centerX(btnWidth), y: 380, width: btnWidth, height: 46, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 5,
      locked: false,
      visible: true
    }
  ];"""
    content = content[:elements_match.start()] + new_elements + content[elements_match.end():]
else:
    print("Could not find elements array!")

with open('src/WeddingCraft/lib/defaultWebTemplate.ts', 'w') as f:
    f.write(content)
