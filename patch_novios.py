import re

with open('src/components/private/NoviosOverviewPanel.tsx', 'r') as f:
    text = f.read()

# Add import
import_statement = "import { FloorPlanPreviewCard } from './FloorPlanPreviewCard';\\n"
if "FloorPlanPreviewCard" not in text:
    text = text.replace("import { FloralBouquet }", import_statement + "import { FloralBouquet }")

# Replace CARD 2
card2_start_pattern = r'          \{\/\* CARD 2: Últimas Confirmaciones \(RSVP\) \*\/\}'
card2_end_pattern = r'          \{\/\* CARD 3: Control de Presupuesto \*\/\}'

start_idx = re.search(card2_start_pattern, text).start()
end_idx = re.search(card2_end_pattern, text).start()

replacement = """          {/* CARD 2: Vista previa del Plano */}
          <FloorPlanPreviewCard />

"""

text = text[:start_idx] + replacement + text[end_idx:]

with open('src/components/private/NoviosOverviewPanel.tsx', 'w') as f:
    f.write(text)
