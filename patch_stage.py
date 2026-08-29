import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    text = f.read()

# Add imports
text = text.replace("import { CanvasImage } from './CanvasImage';", "import { CanvasImage } from './CanvasImage';\nimport { CanvasCountdown } from './CanvasCountdown';\nimport { CanvasInteractiveButton } from './CanvasInteractiveButton';")

render_logic_old = """                if (el.type === 'image') {
                  return (
                    <CanvasImage 
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                      themePrimaryColor={document.theme.palette.primary}
                    />
                  );
                }"""

render_logic_new = """                if (el.type === 'image') {
                  return (
                    <CanvasImage 
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                      themePrimaryColor={document.theme.palette.primary}
                    />
                  );
                }
                
                if (el.type === 'countdown-widget') {
                  return (
                    <CanvasCountdown
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                    />
                  );
                }
                
                if (el.type === 'interactive-button') {
                  return (
                    <CanvasInteractiveButton
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                    />
                  );
                }"""

text = text.replace(render_logic_old, render_logic_new)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(text)
