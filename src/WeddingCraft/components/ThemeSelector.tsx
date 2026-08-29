import React, { useState } from 'react';
import { predefinedThemes, ThemePreset } from '../themes';
import { useThemeFonts } from '../hooks/useThemeFonts';
import { useEditorStore } from '../store/useEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { FontPicker } from './FontPicker';
import { Pencil, Trash2, Plus } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
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
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre del Tema</label>
            <input 
              type="text" 
              className="w-full text-xs p-1.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white transition-all"
              value={editedTheme.name}
              onChange={e => setEditedTheme({...editedTheme, name: e.target.value})}
            />
          </div>
          
          <h4 className="font-semibold text-xs mt-4 text-[#8B3A4A] border-b pb-1">Colores</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Primario</label>
              <input type="color" className="w-full h-7 p-0.5 border border-gray-200 cursor-pointer rounded bg-gray-50/50" value={editedTheme.palette.primary} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, primary: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Secundario</label>
              <input type="color" className="w-full h-7 p-0.5 border border-gray-200 cursor-pointer rounded bg-gray-50/50" value={editedTheme.palette.secondary} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, secondary: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Fondo</label>
              <input type="color" className="w-full h-7 p-0.5 border border-gray-200 cursor-pointer rounded bg-gray-50/50" value={editedTheme.palette.background} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, background: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Texto</label>
              <input type="color" className="w-full h-7 p-0.5 border border-gray-200 cursor-pointer rounded bg-gray-50/50" value={editedTheme.palette.text} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, text: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] text-[#8C8276] mb-1">Muted</label>
              <input type="color" className="w-full h-7 p-0.5 border border-gray-200 cursor-pointer rounded bg-gray-50/50" value={editedTheme.palette.muted} onChange={e => setEditedTheme({...editedTheme, palette: {...editedTheme.palette, muted: e.target.value}})} />
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
};
// Card individual del tema
const ThemeCard: React.FC<{
  theme: ThemePreset;
  isActive: boolean;
  onClick: () => void;
}> = ({ theme, isActive, onClick }) => {
  // Precarga fuentes en hover o cuando se renderiza para preview instantáneo
  useThemeFonts(theme.typography);
  
  return (
    <button 
      className={`wc-theme-card ${isActive ? 'wc-theme-card--active' : ''}`}
      onClick={onClick}
      style={{
        '--theme-primary': theme.palette.primary,
        '--theme-secondary': theme.palette.secondary,
        '--theme-bg': theme.palette.background,
        '--theme-text': theme.palette.text,
      } as React.CSSProperties}
    >
      <div className="wc-theme-card__preview">
        {/* Miniatura visual del tema */}
        <div 
          className="wc-theme-card__color-strip" 
          style={{ background: theme.palette.primary }}
        />
        <div 
          className="wc-theme-card__color-strip" 
          style={{ background: theme.palette.secondary }}
        />
        <div 
          className="wc-theme-card__color-strip" 
          style={{ background: theme.palette.background }}
        />
        
        {/* Preview tipográfico */}
        <div className="wc-theme-card__typo-preview flex items-baseline space-x-1" style={{ color: theme.palette.text }}>
          <span style={{ fontFamily: theme.typography.displayFont }}>Aa</span>
          <span className="text-sm opacity-70" style={{ fontFamily: theme.typography.scriptFont || theme.typography.bodyFont }}>
            {theme.name.charAt(0)}
          </span>
        </div>
      </div>
      
      <div className="wc-theme-card__info">
        <h4 style={{ fontFamily: theme.typography.displayFont }}>
          {theme.name}
        </h4>
        <p>{theme.description}</p>
      </div>
      
      {isActive && <span className="wc-theme-card__badge">✓ Activo</span>}
    </button>
  );
};
