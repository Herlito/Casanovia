import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    text = f.read()

# Add import
text = text.replace("import { useEditorStore } from '../store/useEditorStore';", "import { useEditorStore } from '../store/useEditorStore';\nimport { get, set } from 'idb-keyval';")

# Update loading draft
load_draft_old = """        } else {
          // Check local storage for draft
          const draftKey = `wedding_design_draft_${eventData.eventId}`;
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            initializeDocument(JSON.parse(savedDraft));
          }
          // Else relies on the store's default document
        }

        setIsLoading(false);"""

load_draft_new = """        } else {
          // Check IndexedDB for draft
          const draftKey = `wedding_design_draft_${eventData.eventId}`;
          const savedDraft = await get(draftKey);
          if (savedDraft) {
            // Support both stringified and plain objects depending on how it was saved
            try {
               const parsed = typeof savedDraft === 'string' ? JSON.parse(savedDraft) : savedDraft;
               initializeDocument(parsed);
            } catch (e) {
               console.warn("Failed to parse saved draft", e);
            }
          }
          // Else relies on the store's default document
        }

        setIsLoading(false);"""

text = text.replace(load_draft_old, load_draft_new)

# Update autosave
autosave_old = """    // Auto-save effect logic could go here or in the store
    const saveInterval = setInterval(() => {
      const state = useEditorStore.getState();
      if (state.eventData) {
        const draftKey = `wedding_design_draft_${state.eventData.eventId}`;
        localStorage.setItem(draftKey, JSON.stringify(state.document));
      }
    }, 30000); // 30s autosave"""

autosave_new = """    // Auto-save effect logic using IndexedDB
    const saveInterval = setInterval(() => {
      const state = useEditorStore.getState();
      if (state.eventData) {
        const draftKey = `wedding_design_draft_${state.eventData.eventId}`;
        set(draftKey, JSON.stringify(state.document)).catch(e => {
            console.warn('Failed to save draft to IndexedDB:', e);
        });
      }
    }, 30000); // 30s autosave"""

text = text.replace(autosave_old, autosave_new)

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(text)
