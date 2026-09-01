import re

with open('src/WeddingCraft/components/RightSidebar.tsx', 'r') as f:
    content = f.read()

if 'LibraryPanel' not in content:
    content = content.replace("import { TemplatesPanel } from './TemplatesPanel';", "import { TemplatesPanel } from './TemplatesPanel';\nimport { LibraryPanel } from './LibraryPanel';\nimport { Library } from 'lucide-react';")
    content = content.replace("useState<'properties' | 'themes' | 'animations' | 'templates'>('properties');", "useState<'properties' | 'themes' | 'animations' | 'templates' | 'library'>('properties');")
    
    # Add tab button
    tab_btn = """        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'library' 
              ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('library')}
        >
          <Library className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Librería</span>
        </button>"""
    
    content = content.replace("</div>\n      {/* Tab Content */}", tab_btn + "\n      </div>\n      {/* Tab Content */}")
    
    # Add tab content
    tab_content = """        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'library' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <LibraryPanel />
        </div>"""
        
    content = content.replace("      </div>\n    </div>", tab_content + "\n      </div>\n    </div>")

with open('src/WeddingCraft/components/RightSidebar.tsx', 'w') as f:
    f.write(content)
