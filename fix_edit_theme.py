import re

with open('src/WeddingCraft/components/ThemeSelector.tsx', 'r') as f:
    content = f.read()

# Make the pencil and trash visible for all. But trash only works for custom.
# For pencil, if not custom, clone it.

replacement = """
                <div className="absolute top-2 right-2 flex space-x-1 opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (isCustom) {
                        setEditingThemeId(theme.id); 
                        setEditedTheme(theme); 
                      } else {
                        // Clone it
                        const newTheme = { ...theme, id: 'custom_' + Date.now().toString(), name: theme.name + ' (Copia)' };
                        addCustomTheme(newTheme);
                        setEditingThemeId(newTheme.id);
                        setEditedTheme(newTheme);
                      }
                    }}
                    className="p-1 bg-[#EBEBEB] rounded shadow text-[#2D3748] hover:bg-gray-50"
                    title="Editar"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {isCustom && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('¿Borrar tema?')) deleteCustomTheme(theme.id); }}
                      className="p-1 bg-[#EBEBEB] rounded shadow text-red-600 hover:bg-red-50"
                      title="Borrar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
"""

content = re.sub(r'\{isCustom && \(\s*<div className="absolute top-2 right-2 flex space-x-1 opacity-100 transition-opacity">.*?</div>\s*\)\}', replacement, content, flags=re.DOTALL)

with open('src/WeddingCraft/components/ThemeSelector.tsx', 'w') as f:
    f.write(content)
