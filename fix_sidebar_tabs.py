import re

with open('src/WeddingCraft/components/RightSidebar.tsx', 'r') as f:
    text = f.read()

# Let's just use regex to replace the entire Tabs Header block
tabs_start = text.find("{/* Tabs Header */}")
tabs_end = text.find("{/* Tab Content */}")

if tabs_start != -1 and tabs_end != -1:
    new_tabs = """{/* Tabs Header */}
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
      </div>
      """
    
    text = text[:tabs_start] + new_tabs + text[tabs_end:]

with open('src/WeddingCraft/components/RightSidebar.tsx', 'w') as f:
    f.write(text)
