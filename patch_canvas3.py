import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    text = f.read()

imports_to_add = """import { CanvasImage } from './CanvasImage';\n"""
text = text.replace("import { Stage, Layer, Text, Rect, Transformer, Circle } from 'react-konva';", "import { Stage, Layer, Text, Rect, Transformer, Circle } from 'react-konva';\n" + imports_to_add)

image_render = """                if (el.type === 'svg-shape') {
                  return (
                    <Rect
                      key={el.id}
                      {...commonProps}
                      fill={el.style.fill || '#cccccc'}
                    />
                  );
                }
                
                if (el.type === 'image') {
                  return (
                    <CanvasImage 
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                      themePrimaryColor={document.theme.palette.primary}
                    />
                  );
                }"""

text = text.replace("""                if (el.type === 'svg-shape') {
                  return (
                    <Rect
                      key={el.id}
                      {...commonProps}
                      fill={el.style.fill || '#cccccc'}
                    />
                  );
                }""", image_render)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(text)
