import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

gradient_comp = """
const GradientEditor = ({ style, onChange }: any) => {
  return (
    <div className="mt-3 p-3 bg-white/50 rounded-xl border border-[#D9CEBF] space-y-3">
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={style.gradientEnabled || false} 
          onChange={(e) => onChange('gradientEnabled', e.target.checked)}
          className="rounded border-gray-300 text-[#2D3748]"
        />
        <label className="text-[10px] font-semibold text-gray-700 uppercase">Usar Degradado</label>
      </div>
      {style.gradientEnabled && (
        <>
          <div className="flex items-center space-x-2">
            <select 
              className="text-xs p-1.5 border border-[#D9CEBF] rounded bg-white w-full"
              value={style.gradientType || 'linear'}
              onChange={(e) => onChange('gradientType', e.target.value)}
            >
              <option value="linear">Lineal</option>
              <option value="radial">Radial</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex-1 text-[10px] text-gray-500 font-semibold uppercase">Color 1</div>
            <input type="color" value={(style.gradientColors || ['#ff0000', '#0000ff'])[0]} onChange={(e) => {
               const newC = [...(style.gradientColors || ['#ff0000', '#0000ff'])];
               newC[0] = e.target.value;
               onChange('gradientColors', newC);
            }} className="w-8 h-8 rounded border-0 p-0 cursor-pointer" />
            <div className="flex-1 text-[10px] text-gray-500 font-semibold uppercase text-right">Color 2</div>
            <input type="color" value={(style.gradientColors || ['#ff0000', '#0000ff'])[1]} onChange={(e) => {
               const newC = [...(style.gradientColors || ['#ff0000', '#0000ff'])];
               newC[1] = e.target.value;
               onChange('gradientColors', newC);
            }} className="w-8 h-8 rounded border-0 p-0 cursor-pointer" />
          </div>
        </>
      )}
    </div>
  );
};
"""

# Insert gradient comp after imports
content = content.replace("export const PropertiesPanel: React.FC = () => {", gradient_comp + "\nexport const PropertiesPanel: React.FC = () => {")

# Find where to add GradientEditor for elements.
# Usually at the end of the element specific options.
# For example, before the "Opacidad Global" which is universal.

opacidad_html = """        <div className="p-4 border-t border-gray-200/50 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Opacidad Global</label>"""

new_opacidad = """        {['svg-shape', 'text', 'interactive-button', 'countdown-widget'].includes(selectedElement.type) && (
          <div className="px-4 pb-2">
            <GradientEditor style={selectedElement.style} onChange={(k: string, v: any) => {
              handleUpdateStyle(k, v);
              handleUpdateStyle('isDefaultStyle', false);
            }} />
          </div>
        )}
        <div className="p-4 border-t border-gray-200/50 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Opacidad Global</label>"""

content = content.replace(opacidad_html, new_opacidad)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
