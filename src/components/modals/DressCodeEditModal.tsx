import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { DressCodeColor } from '../../types';
import { 
  Shirt, 
  Sparkles, 
  Check, 
  X, 
  Save, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Palette,
  ShieldCheck,
  RotateCcw,
  Paintbrush,
  CheckCircle2
} from 'lucide-react';
import { ColorPickerWithImageModal } from "./ColorPickerWithImageModal";
import { getContrastRatio, getAccessibleTextColor } from '../../lib/themeUtils';

interface DressCodeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PALETTES: { name: string; colors: DressCodeColor[] }[] = [
  {
    name: 'Romance Botánico (Salvia & Oro)',
    colors: [
      { name: 'Verde Salvia', hex: '#8A9A86', description: 'Tono ideal para vestidos vaporosos y corbatas de acento.' },
      { name: 'Rosa Empolvado', hex: '#D4A59A', description: 'Color suave y romántico ideal para damas y detalles.' },
      { name: 'Champagne / Arena', hex: '#E8D8C8', description: 'Elegante y neutral para accesorios y prendas sutiles.' },
      { name: 'Azul Medianoche', hex: '#1E293B', description: 'Excelente alternativa formal para trajes masculinos.' },
      { name: 'Oro Viejo', hex: '#D4AF37', description: 'Acento metalizado ideal en joyería y detalles de vestuario.' }
    ]
  },
  {
    name: 'Terracota & Atardecer',
    colors: [
      { name: 'Terracota', hex: '#C86D51', description: 'Cálido y sofisticado para recepciones al aire libre.' },
      { name: 'Mostaza Suave', hex: '#D9A74A', description: 'Aporte de luz y alegría en complementos.' },
      { name: 'Verde Olivo', hex: '#556B2F', description: 'Sobrio, natural y muy combinable para trajes y vestidos.' },
      { name: 'Café Espresso', hex: '#3E2723', description: 'Profundidad clásica y formal para calzado y sacos.' }
    ]
  },
  {
    name: 'Gala Nocturna & Joya',
    colors: [
      { name: 'Esmeralda Imperial', hex: '#0F5132', description: 'Tono joya para vestidos largos de noche.' },
      { name: 'Azul Zafiro', hex: '#0D3B66', description: 'Elegancia absoluta para trajes de etiqueta.' },
      { name: 'Vino Tinto / Burdeos', hex: '#6A1A24', description: 'Profundo, apasionado y formal.' },
      { name: 'Gris Carbón', hex: '#343A40', description: 'Alternativa contemporánea al negro absoluto.' }
    ]
  }
];

export const DressCodeEditModal: React.FC<DressCodeEditModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings, 
    currentUser, 
    isLevel1Admin,
    applyWeddingColorsTheme,
    resetWeddingColorsTheme
  } = useWedding();
  const { appTheme } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [dressCodeStyle, setDressCodeStyle] = useState(settings.dressCodeStyle || '');
  const [dressCodeDescription, setDressCodeDescription] = useState(settings.dressCodeDescription || '');
  const [forbiddenColorsNote, setForbiddenColorsNote] = useState(settings.forbiddenColorsNote || '');
  const [suggestedColors, setSuggestedColors] = useState<DressCodeColor[]>(settings.suggestedColors || []);
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [themeMsg, setThemeMsg] = useState<string | null>(null);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDressCodeStyle(settings.dressCodeStyle || '');
      setDressCodeDescription(settings.dressCodeDescription || '');
      setForbiddenColorsNote(settings.forbiddenColorsNote || '');
      setSuggestedColors(settings.suggestedColors ? JSON.parse(JSON.stringify(settings.suggestedColors)) : []);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleColorChange = (index: number, field: keyof DressCodeColor, value: string) => {
    const updated = [...suggestedColors];
    updated[index] = { ...updated[index], [field]: value };
    setSuggestedColors(updated);
  };

  const handleAddColor = () => {
    setSuggestedColors([
      ...suggestedColors,
      {
        name: 'Nuevo Tono',
        hex: '#8B3A4A',
        description: 'Descripción y sugerencia de uso para este color.'
      }
    ]);
  };

  const handleRemoveColor = (index: number) => {
    setSuggestedColors(suggestedColors.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (preset: { name: string; colors: DressCodeColor[] }) => {
    setSuggestedColors(JSON.parse(JSON.stringify(preset.colors)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateSettings({
        ...settings,
        dressCodeStyle: dressCodeStyle.trim(),
        dressCodeDescription: dressCodeDescription.trim(),
        forbiddenColorsNote: forbiddenColorsNote.trim(),
        suggestedColors: suggestedColors,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl border border-[#E8DCCF] transition-all">
        
        {/* Header */}
        <div className={isNeumorphic ? "p-6 relative text-gray-800" : "bg-linear-to-r from-[#2D2A26] to-[#4A3B32] text-white p-6 relative"}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8A9A86] flex items-center justify-center shadow-md text-white">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <span className={isNeumorphic ? "text-[10px] font-bold tracking-widest text-gray-500 uppercase block" : "text-[10px] font-bold tracking-widest text-[#E8DCCF] uppercase block"}>
                Edición de Protocolo & Estilo
              </span>
              <h3 className={`font-serif-display text-xl font-bold ${isNeumorphic ? "text-gray-900" : "text-white"}`}>
                Código de Vestimenta y Paleta Visual
              </h3>
            </div>
          </div>
          <p className="text-xs text-stone-300 font-light mt-1">
            Personaliza el dress code, las recomendaciones de vestimenta y las tonalidades sugeridas para los invitados.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* User badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Editando como: <strong>{currentUser.username}</strong> ({isLevel1Admin ? 'Administrador' : 'Anfitrión / Wedding Planner'})
              </span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
              Sincronizado
            </span>
          </div>

          {/* 1. Dress Code Title & Quick Suggestions */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Estilo / Título del Código de Vestimenta
              </label>
              <input
                type="text"
                required
                value={dressCodeStyle}
                onChange={(e) => setDressCodeStyle(e.target.value)}
                placeholder="ej. Formal Rigurosa / Traje Oscuro y Vestido Largo"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#8B3A4A]/20 font-serif font-bold text-[#2D2A26]"
              />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-bold text-[#8C8276] uppercase">Sugeridos:</span>
              {[
                'Formal Rigurosa',
                'Formal de Noche',
                'Cocktail Elegante',
                'Guayabera Formal',
                'Black Tie / Etiqueta'
              ].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setDressCodeStyle(style)}
                  className="px-2.5 py-1 rounded-lg text-[10px] bg-[#EFEAE2] hover:bg-[#8B3A4A] hover:text-white text-[#524B42] transition-colors cursor-pointer"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Detailed Description for Guests */}
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1">
              Descripción y Recomendaciones de Vestimenta
            </label>
            <textarea
              rows={3}
              required
              value={dressCodeDescription}
              onChange={(e) => setDressCodeDescription(e.target.value)}
              placeholder="Para las damas sugerimos vestido largo en tonos de la paleta. Para los caballeros traje oscuro con corbata..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#8B3A4A]/20 text-[#2D2A26] leading-relaxed"
            />
          </div>

          {/* 3. Golden Rule / Forbidden colors note */}
          <div>
            <label className="block text-xs font-semibold text-[#8B3A4A] mb-1 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Regla de Oro (Colores Reservados / Prohibidos)</span>
            </label>
            <input
              type="text"
              required
              value={forbiddenColorsNote}
              onChange={(e) => setForbiddenColorsNote(e.target.value)}
              placeholder="Blanco, marfil y beige están reservados exclusivamente para la novia."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50/50 focus:bg-white focus:ring-2 focus:ring-rose-300 text-rose-950 font-medium"
            />
          </div>

          {/* 4. Suggested Colors Palette Editor */}
          <div className="pt-2 border-t border-[#E8DCCF] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-[#2D2A26] uppercase tracking-wider flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-[#D4AF37]" />
                  <span>Paleta Visual de Colores Sugeridos ({suggestedColors.length})</span>
                </h4>
                <p className="text-[11px] text-[#7A7268]">
                  Define los tonos sugeridos que los invitados podrán pulsar e inspeccionar
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddColor}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#8A9A86] text-white text-xs font-semibold hover:bg-[#6E7E6A] transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Color</span>
              </button>
            </div>

            {/* Presets Bar */}
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EADDCE] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-[#8C8276] uppercase">Paletas predefinidas:</span>
              {PRESET_PALETTES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#D9CEBF] hover:border-[#8B3A4A] text-[11px] font-medium text-[#4A3B32] transition-colors cursor-pointer"
                >
                  <span className="flex -space-x-1">
                    {preset.colors.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full border border-white inline-block shadow-2xs"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Color Items List */}
            <div className="space-y-3">
              {suggestedColors.map((color, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all hover:border-[#D4AF37]/50"
                >
                  {/* Color Picker & Circle Preview */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => setEditingColorIndex(idx)}
                      title="Seleccionar color o extraer desde imagen"
                    >
                      <div 
                        style={{ backgroundColor: color.hex }}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={color.hex}
                        onChange={(e) => handleColorChange(idx, 'hex', e.target.value)}
                        placeholder="#HEX"
                        className="w-20 px-2 py-1 text-[11px] font-mono rounded-lg border border-[#D9CEBF] bg-white text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* Name & Description Inputs */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-0.5">
                        Nombre del Color
                      </label>
                      <input
                        type="text"
                        required
                        value={color.name}
                        onChange={(e) => handleColorChange(idx, 'name', e.target.value)}
                        placeholder="ej. Verde Salvia"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D9CEBF] bg-white text-[#2D2A26] font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-0.5">
                        Recomendación de Uso
                      </label>
                      <input
                        type="text"
                        value={color.description}
                        onChange={(e) => handleColorChange(idx, 'description', e.target.value)}
                        placeholder="ej. Ideal para vestidos largos..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D9CEBF] bg-white text-[#524B42]"
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(idx)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-center cursor-pointer"
                    title="Eliminar este color"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {suggestedColors.length === 0 && (
                <div className="p-6 text-center rounded-2xl border-2 border-dashed border-[#D9CEBF] bg-[#FAF8F5] text-xs text-[#8C8276]">
                  No hay colores en la paleta sugerida. Haz clic en "Agregar Color" o selecciona una paleta predefinida.
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DCCF] text-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8276]">
                Vista Previa de la Paleta en la Web
              </span>
              {settings.customTheme?.enabled ? (
                <span className="text-[10px] font-bold text-[#3C5038] bg-[#8A9A86]/20 px-2 py-0.5 rounded-full">
                  ✓ Tema Personalizado Activo
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#7A7268] bg-stone-100 px-2 py-0.5 rounded-full">
                  Tema Clásico Original
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {suggestedColors.map((c, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    style={{ backgroundColor: c.hex }}
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                  />
                  <span className="text-[10px] font-semibold text-[#4A3B32] mt-1">{c.name}</span>
                </div>
              ))}
            </div>

            {/* Quick Apply and Reset in Modal */}
            <div className="pt-2 border-t border-[#EFEAE2] flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={isApplyingTheme || suggestedColors.length === 0}
                onClick={async () => {
                  try {
                    setIsApplyingTheme(true);
                    await applyWeddingColorsTheme(suggestedColors);
                    setThemeMsg('¡Colores aplicados a la página de esta boda con contraste verificado!');
                    setTimeout(() => setThemeMsg(null), 4000);
                  } catch (err) {
                    console.error('Error aplicando tema:', err);
                  } finally {
                    setIsApplyingTheme(false);
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#8B3A4A] hover:bg-[#6E2937] text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Aplicar colores a la página ahora</span>
              </button>

              <button
                type="button"
                disabled={isApplyingTheme}
                onClick={async () => {
                  try {
                    setIsApplyingTheme(true);
                    await resetWeddingColorsTheme();
                    setThemeMsg('¡Colores restablecidos a la paleta original!');
                    setTimeout(() => setThemeMsg(null), 4000);
                  } catch (err) {
                    console.error('Error restableciendo tema:', err);
                  } finally {
                    setIsApplyingTheme(false);
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-[#524B42] border border-[#D9CEBF] text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#7A7268]" />
                <span>Restablecer</span>
              </button>
            </div>

            {themeMsg && (
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{themeMsg}</span>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E8DCCF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#8B3A4A] text-white text-xs font-bold hover:bg-[#6E2937] transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Código de Vestimenta Actualizado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar y Publicar'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
    <ColorPickerWithImageModal 
      isOpen={editingColorIndex !== null}
      onClose={() => setEditingColorIndex(null)}
      initialHex={editingColorIndex !== null && suggestedColors[editingColorIndex] ? suggestedColors[editingColorIndex].hex : '#000000'}
      onColorChange={(hex) => {
        if (editingColorIndex !== null) {
          handleColorChange(editingColorIndex, 'hex', hex);
        }
      }}
      colorName={editingColorIndex !== null && suggestedColors[editingColorIndex] ? suggestedColors[editingColorIndex].name : undefined}
    />
    </>
  );
};
