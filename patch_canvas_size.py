import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

new_empty_state = """
  if (!selectedElement) {
    const canvasConfig = document.canvas;
    return (
      <div className="flex flex-col h-full wc-properties overflow-y-auto">
        <div className="p-3 border-b border-gray-200/50 bg-[#EBEBEB]/50 backdrop-blur-md sticky top-0 z-10">
          <h3 className="text-[11px] font-semibold text-gray-800 flex items-center space-x-1.5 uppercase tracking-wide">
            <Settings2 className="w-4 h-4 text-gray-800" />
            <span>Propiedades del Lienzo</span>
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-xs text-[#8C8276] mb-4">Selecciona un elemento para editarlo, o configura la tarjeta base:</p>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Ancho (px)</label>
            <input 
              type="number"
              className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
              value={canvasConfig.width}
              onChange={(e) => {
                 const state = useEditorStore.getState();
                 state.document.canvas.width = parseInt(e.target.value) || 375;
                 useEditorStore.setState({ document: { ...state.document } });
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Alto (px)</label>
            <input 
              type="number"
              className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
              value={canvasConfig.height}
              onChange={(e) => {
                 const state = useEditorStore.getState();
                 state.document.canvas.height = parseInt(e.target.value) || 812;
                 useEditorStore.setState({ document: { ...state.document } });
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color de Fondo</label>
            <input 
              type="color"
              className="w-full h-8 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
              value={canvasConfig.backgroundColor}
              onChange={(e) => {
                 const state = useEditorStore.getState();
                 state.document.canvas.backgroundColor = e.target.value;
                 useEditorStore.setState({ document: { ...state.document } });
              }}
            />
          </div>
        </div>
      </div>
    );
  }
"""

content = re.sub(r'  if \(\!selectedElement\) \{\s*return \(\s*<div className="flex flex-col h-full items-center justify-center wc-properties p-6 text-center">\s*<p className="text-xs text-\[\#8C8276\]">Selecciona un elemento en el lienzo para editar sus propiedades\.<\/p>\s*<\/div>\s*\);\s*\}', new_empty_state, content)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)

