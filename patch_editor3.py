import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    text = f.read()

# Let's add load templates at init.
init_pattern = r'const draftKey = `wedding_design_draft_\$\{eventData\.eventId\}`;'
init_replacement = """
          // Load templates
          const savedTemplates = await get('wedding_craft_templates');
          if (savedTemplates) {
             useEditorStore.getState().loadTemplates(savedTemplates);
          }
          
          const draftKey = `wedding_design_draft_${eventData.eventId}`;
"""
text = re.sub(init_pattern, init_replacement.strip(), text)

# Now let's add the Preview Modal at the end of the return statement
import_html = "import { exportToHTML } from '../lib/exportHTML';"
if "import { exportToHTML" not in text:
    text = text.replace("import { X } from 'lucide-react';", "import { X } from 'lucide-react';\n" + import_html)

modal_jsx = """
      <MobileNavigation />
      {/* Preview Modal */}
      {useEditorStore((state) => state.isPreviewModalOpen) && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-md md:max-w-4xl flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Previsualización (Animaciones)</h3>
              <button 
                onClick={() => useEditorStore.getState().setPreviewModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 flex items-center justify-center relative overflow-hidden">
               <iframe 
                  srcDoc={exportToHTML(useEditorStore.getState().document)} 
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin"
               />
            </div>
          </div>
        </div>
      )}
      
      {/* Close button float */}
"""
text = text.replace('<MobileNavigation />\n      {/* Close button float */}', modal_jsx.strip())

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(text)
