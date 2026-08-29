import re

with open('src/WeddingCraft/components/CanvasCountdown.tsx', 'r') as f:
    text = f.read()

old_group = """  return (
    <Group {...commonProps} ref={groupRef}>
      {/* Title */}"""

new_group = """  return (
    <Group {...commonProps} ref={groupRef}>
      {/* Container Background */}
      {(el.style.containerOpacity ?? 0) > 0 && (
        <Rect
          width={el.transform.width}
          height={el.transform.height}
          fill={el.style.containerBackgroundColor || '#ffffff'}
          opacity={el.style.containerOpacity ?? 0}
          cornerRadius={8}
        />
      )}
      {/* Title */}"""
      
text = text.replace(old_group, new_group)

with open('src/WeddingCraft/components/CanvasCountdown.tsx', 'w') as f:
    f.write(text)
