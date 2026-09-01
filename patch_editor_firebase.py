import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'import { db } from' not in content:
    content = content.replace("import { useEditorStore } from '../store/useEditorStore';", "import { useEditorStore } from '../store/useEditorStore';\nimport { db } from '../../lib/firebase';\nimport { collection, getDocs } from 'firebase/firestore';")

init_firebase = """        setIsLoading(false);
        // Load templates from Firebase
        try {
           const snap = await getDocs(collection(db, 'weddingcraft_templates'));
           const templates = snap.docs.map(d => d.data());
           useEditorStore.getState().loadTemplates(templates);
        } catch (e) {
           console.error("Error loading templates", e);
        }
      } catch (err: any) {"""

content = content.replace("""        setIsLoading(false);
      } catch (err: any) {""", init_firebase)

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(content)
