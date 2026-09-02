import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

import_statement = "import { CanvasInteractiveButton } from './CanvasInteractiveButton';"
if import_statement not in content:
    content = content.replace("import { CanvasCountdown } from './CanvasCountdown';", "import { CanvasCountdown } from './CanvasCountdown';\n" + import_statement)

old_loop = """                if (el.type === 'countdown-widget') {
                    return (
                        <CanvasCountdown key={el.id} el={el} commonProps={commonProps} />
                    );
                }

                return null;"""

new_loop = """                if (el.type === 'countdown-widget') {
                    return (
                        <CanvasCountdown key={el.id} el={el} commonProps={commonProps} theme={document.theme} />
                    );
                }
                
                if (el.type === 'interactive-button') {
                    return (
                        <CanvasInteractiveButton key={el.id} el={el} commonProps={commonProps} theme={document.theme} />
                    );
                }

                return null;"""

content = content.replace(old_loop, new_loop)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
