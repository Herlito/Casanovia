import re

with open('src/WeddingCraft/components/ThemeSelector.tsx', 'r') as f:
    text = f.read()

import_str = "import React, { useState } from 'react';\nimport { predefinedThemes, ThemePreset } from '../themes';\nimport { useThemeFonts } from '../hooks/useThemeFonts';\nimport { useEditorStore } from '../store/useEditorStore';\nimport { v4 as uuidv4 } from 'uuid';\nimport { FontPicker } from './FontPicker';\nimport { Pencil, Trash2, Plus } from 'lucide-react';"

text = text.replace("import React from 'react';\nimport { predefinedThemes, ThemePreset } from '../themes';\nimport { useThemeFonts } from '../hooks/useThemeFonts';\nimport { useEditorStore } from '../store/useEditorStore';", import_str)

body = """export const ThemeSelector: React.FC = () => {
  const { document, setTheme, applyThemeToExistingElements, addCustomTheme, updateCustomTheme, deleteCustomTheme } = useEditorStore();
  const currentThemeId = document.theme.id;
  
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [editedTheme, setEditedTheme] = useState<ThemePreset | null>(null);

  const customThemes = document.customThemes || [];
  const allThemes = [...predefinedThemes, ...customThemes];

  const handleThemeSelect = (theme: ThemePreset) => {
    setTheme(theme);
    applyThemeToExistingElements(theme);
  };
  
  const handleCreateNew = () => {
    const newTheme: ThemePreset = {
      id: uuidv4(),
      name: 'Mi Tema Personalizado',
      description: 'Tema personalizado',
      palette: { ...document.theme.palette },
      typography: { ...document.theme.typography }
    };
    addCustomTheme(newTheme);
    setEditingThemeId(newTheme.id);
    setEditedTheme(newTheme);
  };
  
  const handleSaveEdit = () => {
    if (editedTheme && editingThemeId) {
      updateCustomTheme(editingThemeId, editedTheme);
      setEditingThemeId(null);
      setEditedTheme(null);
    }
  };

  if (editingThemeId && editedTheme) {
    return (
      <div className="wc-theme-selector h-full overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-[#2D2A26]">Editar Tema</h3>
          <button onClick={() => setEditingThemeId(null)} className="text-xs text-[#8C8276] hover:text-[#2D2A26]">Cancelar</button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Nombre del Tema</label>
            <input 
              type="text" 
              className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]"
              value={editedTheme.name}
              onChange={e => setEditedTheme({...editedTheme, name: e.target.value})}
            />
          </div>
          
          <h4 className="font-semibold text-xs mt-4 text-[#8B3A4A] border-b pb-1">Colores</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Primario</label>
              <input type="color" className="w-full h-8 cursor-pointer rounded" value={editedTheme.palette.primary} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, primary: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Secundario</label>
              <input type="color" className="w-full h-8 cursor-pointer rounded" value={editedTheme.palette.secondary} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, secondary: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Fondo</label>
              <input type="color" className="w-full h-8 cursor-pointer rounded" value={editedTheme.palette.background} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, background: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Texto</label>
              <input type="color" className="w-full h-8 cursor-pointer rounded" value={editedTheme.palette.text} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, text: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Muted</label>
              <input type="color" className="w-full h-8 cursor-pointer rounded" value={editedTheme.palette.muted} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, muted: e.target.value}})} />
            </div>
          </div>
          
          <h4 className="font-semibold text-xs mt-4 text-[#8B3A4A] border-b pb-1">Tipografía</h4>
          <div>
            <label className="block text-[10px] text-[#8C8276] mb-1">Fuente de Títulos</label>
            <FontPicker value={editedTheme.typography.displayFont} onChange={f => setEditedTheme({...editedTheme, typography: {...editedTheme.typography, displayFont: f}})} />
          </div>
          <div>
            <label className="block text-[10px] text-[#8C8276] mb-1">Fuente de Textos</label>
            <FontPicker value={editedTheme.typography.bodyFont} onChange={f => setEditedTheme({...editedTheme, typography: {...editedTheme.typography, bodyFont: f}})} />
          </div>
          <div>
            <label className="block text-[10px] text-[#8C8276] mb-1">Fuente Script / Secundaria</label>
            <FontPicker value={editedTheme.typography.scriptFont || ''} onChange={f => setEditedTheme({...editedTheme, typography: {...editedTheme.typography, scriptFont: f}})} />
          </div>
          
          <button onClick={handleSaveEdit} className="w-full bg-[#8B3A4A] text-white py-2 rounded-lg mt-4 text-sm font-semibold hover:bg-[#7a3240]">
            Guardar Cambios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wc-theme-selector h-full overflow-y-auto">
      <div className="p-3 mb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="wc-section-title mb-0">Biblioteca de Temas</h3>
          <button onClick={handleCreateNew} className="flex items-center space-x-1 text-xs text-[#8B3A4A] font-semibold hover:underline">
            <Plus className="w-3 h-3" /> <span>Crear Nuevo</span>
          </button>
        </div>
        <p className="text-xs text-[#8C8276] mb-4">Selecciona un tema o personaliza el tuyo.</p>
        <div className="wc-theme-grid">
          {allThemes.map((theme) => {
            const isCustom = customThemes.some((t: any) => t.id === theme.id);
            return (
              <div key={theme.id} className="relative group">
                <ThemeCard 
                  theme={theme} 
                  isActive={currentThemeId === theme.id}
                  onClick={() => handleThemeSelect(theme)}
                />
                {isCustom && (
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingThemeId(theme.id); setEditedTheme(theme); }}
                      className="p-1 bg-white rounded shadow text-[#8B3A4A] hover:bg-gray-50"
                      title="Editar"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('¿Borrar tema?')) deleteCustomTheme(theme.id); }}
                      className="p-1 bg-white rounded shadow text-red-600 hover:bg-red-50"
                      title="Borrar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};"""

text = re.sub(r'export const ThemeSelector: React\.FC = \(\) => \{.*?(?=\n// Card individual del tema)', body, text, flags=re.DOTALL)

with open('src/WeddingCraft/components/ThemeSelector.tsx', 'w') as f:
    f.write(text)
