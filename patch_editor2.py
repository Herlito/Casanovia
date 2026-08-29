import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    text = f.read()

# Add import
text = text.replace("import { MobileNavigation } from './MobileNavigation';", "import { MobileNavigation } from './MobileNavigation';\nimport { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';")

# Add hook call
# Inside export const WeddingCraftEditor: React.FC<WeddingCraftEditorProps> = ({ externalAPI, onClose, initialDocument }) => {
text = text.replace("const { setEventData, initializeDocument } = useEditorStore();", "const { setEventData, initializeDocument } = useEditorStore();\n  useKeyboardShortcuts();")

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(text)
