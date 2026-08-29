import re

with open('src/WeddingCraft/components/AnimationPanel.tsx', 'r') as f:
    text = f.read()

btn = """
        <button 
          onClick={() => useEditorStore.getState().setPreviewModalOpen(true)}
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-semibold text-xs mt-2"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Aplicar y Previsualizar</span>
        </button>
"""

# add it at the top of the properties list, under the header.
# The header is:
#      <div className="p-3 border-b border-gray-200/50 bg-white/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
#        <h3 className="text-[11px] font-semibold text-gray-800 flex items-center space-x-1.5 uppercase tracking-wide">
#          <Wand2 className="w-4 h-4 text-gray-800" />
#          <span>Animar Objeto</span>
#        </h3>
#      </div>
#      <div className="p-3 space-y-4">
text = text.replace('<div className="p-3 space-y-4">', '<div className="p-3 space-y-4">\n' + btn)

with open('src/WeddingCraft/components/AnimationPanel.tsx', 'w') as f:
    f.write(text)
