import re

with open('src/WeddingCraft/components/RightSidebar.tsx', 'r') as f:
    text = f.read()

# Add import
text = text.replace("import { ThemeSelector } from './ThemeSelector';", "import { ThemeSelector } from './ThemeSelector';\nimport { AnimationPanel } from './AnimationPanel';\nimport { Wand2 } from 'lucide-react';")

# Update state type
text = text.replace("useState<'properties' | 'themes'>('properties')", "useState<'properties' | 'themes' | 'animations'>('properties')")

# Add the new button
button_html = """        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'animations' 
              ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('animations')}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Animar</span>
        </button>
      </div>"""

# I need to completely replace the tabs container to fix the style and add the 3rd tab
old_tabs = """      {/* Tabs Header */}
      <div className="flex border-b border-[#E8DCCF] bg-[#FAF8F5]">
        <button 
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'properties' 
              ? 'border-[#8B3A4A] text-[#8B3A4A] bg-white' 
              : 'border-transparent text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA]'
          }`}
          onClick={() => setActiveTab('properties')}
        >
          <Settings2 className="w-4 h-4" />
          <span>Propiedades</span>
        </button>
        <button 
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'themes' 
              ? 'border-[#8B3A4A] text-[#8B3A4A] bg-white' 
              : 'border-transparent text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA]'
          }`}
          onClick={() => setActiveTab('themes')}
        >
          <Palette className="w-4 h-4" />
          <span>Estilos</span>
        </button>
      </div>"""

new_tabs = """      {/* Tabs Header */}
      <div className="flex border-b border-gray-200/50 bg-white/50 backdrop-blur-xl shrink-0 p-1.5 gap-1">
        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'properties' 
              ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('properties')}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Props</span>
        </button>
        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'animations' 
              ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('animations')}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Animar</span>
        </button>
        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'themes' 
              ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('themes')}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Estilos</span>
        </button>
      </div>"""

text = text.replace(old_tabs, new_tabs)

# Add the content panel
old_content = """        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'themes' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <ThemeSelector />
        </div>"""

new_content = """        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'themes' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <ThemeSelector />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'animations' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <AnimationPanel />
        </div>"""

text = text.replace(old_content, new_content)

# Update sidebar container
text = re.sub(
    r'<div className="w-80 bg-white border-l border-\[#E8DCCF\] flex flex-col h-full wc-right-sidebar">',
    r'<div className="w-80 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl flex flex-col h-full wc-right-sidebar shadow-sm overflow-hidden m-3 ml-0">',
    text
)

with open('src/WeddingCraft/components/RightSidebar.tsx', 'w') as f:
    f.write(text)
