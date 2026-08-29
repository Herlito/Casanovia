import re

with open('src/WeddingCraft/components/RightSidebar.tsx', 'r') as f:
    text = f.read()

text = text.replace("import { AnimationPanel } from './AnimationPanel';", "import { AnimationPanel } from './AnimationPanel';\nimport { TemplatesPanel } from './TemplatesPanel';\nimport { LayoutTemplate } from 'lucide-react';")

# Add to state: 'properties' | 'themes' | 'animations' | 'templates'
text = text.replace(
    "useState<'properties' | 'themes' | 'animations'>('properties')",
    "useState<'properties' | 'themes' | 'animations' | 'templates'>('properties')"
)

# Add Tab Button
tab = """
        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'templates' 
              ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Plantillas</span>
        </button>
"""

# I need to shorten the text on tabs maybe, let's keep it but just add the tab.
text = text.replace(
    "<span>Estilos</span>\n        </button>",
    "<span>Estilos</span>\n        </button>\n" + tab
)

# Add Content
content = """
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'templates' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <TemplatesPanel />
        </div>
"""
text = text.replace(
    "<AnimationPanel />\n        </div>",
    "<AnimationPanel />\n        </div>\n" + content
)

with open('src/WeddingCraft/components/RightSidebar.tsx', 'w') as f:
    f.write(text)
