with open('src/components/private/NoviosOverviewPanel.tsx', 'r') as f:
    text = f.read()

text = text.replace("import { FloorPlanPreviewCard } from './FloorPlanPreviewCard';\\nimport { FloralBouquet } from './FloralBouquet';", "import { FloorPlanPreviewCard } from './FloorPlanPreviewCard';\nimport { FloralBouquet } from './FloralBouquet';")

with open('src/components/private/NoviosOverviewPanel.tsx', 'w') as f:
    f.write(text)
