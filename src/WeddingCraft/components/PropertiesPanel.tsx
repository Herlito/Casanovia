import React, { useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Settings2, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Group as GroupIcon, Copy, Trash2, Image as ImageIcon, Layers, Upload, X, Ungroup, Sparkles, Square, Circle, Heart, Church, PartyPopper, Shirt, MessageSquare, Plus, Palette, Type, MapPin, Clock, Navigation, Globe, RotateCcw, Check } from 'lucide-react';
import { FontPicker } from './FontPicker';
import { processImageTransparency } from '../lib/imageTransparency';



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

export const PropertiesPanel: React.FC = () => {
  const { 
    document, 
    selectedElementIds, 
    updateElement, 
    updateCanvas, 
    eventData,
    groupElements,
    ungroupElements,
    duplicateElements,
    deleteElements
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (selectedElementIds.length > 1) {
    const selectedList = document.pages[0].elements.filter(e => selectedElementIds.includes(e.id));
    const hasAnyGrouped = selectedList.some(e => e.parentGroup);

    return (
      <div className="flex flex-col h-full wc-properties overflow-y-auto">
        <div className="p-3 border-b border-gray-200/50 bg-[#EBEBEB]/50 backdrop-blur-md sticky top-0 z-10">
          <h3 className="text-[11px] font-semibold text-gray-800 flex items-center space-x-1.5 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Selección Múltiple</span>
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/60 shadow-sm">
            <p className="text-xs font-bold text-blue-900">
              {selectedElementIds.length} elementos seleccionados
            </p>
            <p className="text-[10px] text-blue-700 mt-1">
              Puedes moverlos juntos, agruparlos o duplicarlos con un clic o con atajos de teclado.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => groupElements(selectedElementIds)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 active:bg-gray-100 font-medium text-xs shadow-sm transition-all"
            >
              <GroupIcon className="w-4 h-4 text-blue-600" />
              <span>Agrupar Elementos (Ctrl+G)</span>
            </button>

            {hasAnyGrouped && (
              <button
                onClick={() => ungroupElements(selectedElementIds)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 active:bg-gray-100 font-medium text-xs shadow-sm transition-all"
              >
                <Ungroup className="w-4 h-4 text-amber-600" />
                <span>Desagrupar (Ctrl+Shift+G)</span>
              </button>
            )}

            <button
              onClick={() => duplicateElements(selectedElementIds)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 active:bg-gray-100 font-medium text-xs shadow-sm transition-all"
            >
              <Copy className="w-4 h-4 text-emerald-600" />
              <span>Duplicar Selección (Ctrl+D)</span>
            </button>

            <button
              onClick={() => deleteElements(selectedElementIds)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium text-xs shadow-sm transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Eliminar Selección (Supr)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedElement = selectedElementIds.length === 1 
    ? document.pages[0].elements.find(e => e.id === selectedElementIds[0])
    : null;


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
          <p className="text-xs text-[#8C8276] mb-4">Selecciona un elemento para editarlo, o configura el lienzo web:</p>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Ancho (px)</label>
              <div className="flex space-x-1">
                <button 
                  type="button" 
                  onClick={() => updateCanvas({ width: 375 })}
                  className={`px-1.5 py-0.5 text-[9px] rounded font-medium transition-colors ${canvasConfig.width === 375 ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Móvil
                </button>
                <button 
                  type="button" 
                  onClick={() => updateCanvas({ width: 720 })}
                  className={`px-1.5 py-0.5 text-[9px] rounded font-medium transition-colors ${canvasConfig.width === 720 ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Web (720)
                </button>
                <button 
                  type="button" 
                  onClick={() => updateCanvas({ width: 900 })}
                  className={`px-1.5 py-0.5 text-[9px] rounded font-medium transition-colors ${canvasConfig.width === 900 ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Amplia
                </button>
              </div>
            </div>
            <input 
              type="number"
              className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
              value={canvasConfig.width || 0}
              onChange={(e) => {
                 updateCanvas({ width: parseInt(e.target.value) || 375 });
              }}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Alto (px)</label>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => updateCanvas({ height: Math.max(400, (canvasConfig.height || 812) - 100) })}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                  title="Restar 100px"
                >
                  -100
                </button>
                <button
                  type="button"
                  onClick={() => updateCanvas({ height: Math.min(6000, (canvasConfig.height || 812) + 100) })}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                  title="Sumar 100px"
                >
                  +100
                </button>
              </div>
            </div>
            <input 
              type="number"
              step="50"
              min="400"
              max="6000"
              className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
              value={canvasConfig.height || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') return;
                const num = parseInt(val, 10);
                if (!isNaN(num) && num > 0) {
                  updateCanvas({ height: num });
                }
              }}
            />
            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1 mt-1.5">
              {[
                { label: '812', val: 812, title: 'Estándar (812px)' },
                { label: '1200', val: 1200, title: 'Medio (1200px)' },
                { label: '1800', val: 1800, title: 'Largo (1800px)' },
                { label: '2400', val: 2400, title: 'Completo (2400px)' }
              ].map(preset => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => updateCanvas({ height: preset.val })}
                  className={`py-1 px-1 rounded text-[10px] text-center font-medium transition-all ${
                    canvasConfig.height === preset.val
                      ? 'bg-[#2D3748] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title={preset.title}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          {/* Fondo del Canva (Lienzo Invitación) */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>Fondo del Canva (Lienzo)</span>
              </label>
              <span className="text-[10px] font-bold text-gray-500 font-mono uppercase">
                {canvasConfig.backgroundColor || '#ffffff'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              Color del lienzo o tarjeta principal de la invitación.
            </p>

            <div className="flex items-center space-x-2">
              <input 
                type="color"
                className="w-10 h-10 p-0.5 border-0 rounded-xl bg-transparent cursor-pointer shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]"
                value={canvasConfig.backgroundColor?.startsWith('#') ? canvasConfig.backgroundColor : '#ffffff'}
                onChange={(e) => updateCanvas({ backgroundColor: e.target.value })}
              />
              <input
                type="text"
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border-0 text-gray-800 outline-none"
                value={canvasConfig.backgroundColor || '#ffffff'}
                placeholder="#ffffff"
                onChange={(e) => updateCanvas({ backgroundColor: e.target.value })}
              />
            </div>

            {/* Presets Canva */}
            <div className="pt-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tonos Recomendados:</span>
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  { name: 'Blanco', color: '#FFFFFF' },
                  { name: 'Marfil', color: '#FAF8F5' },
                  { name: 'Crema', color: '#F5EFEB' },
                  { name: 'Nude', color: '#EFE8E1' },
                  { name: 'Neumórfico', color: '#EBEBEB' },
                  { name: 'Salvia', color: '#F0F4F1' },
                  { name: 'Rosa Suave', color: '#FFF1F2' },
                  { name: 'Arena', color: '#F4ECE1' },
                  { name: 'Champagne', color: '#F9F4EC' },
                  { name: 'Cielo', color: '#F0F7FF' },
                  { name: 'Perla', color: '#E2E8F0' },
                  { name: 'Noche', color: '#18181B' }
                ].map(p => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => updateCanvas({ backgroundColor: p.color })}
                    className={`h-7 rounded-lg border flex items-center justify-center transition-all ${
                      (canvasConfig.backgroundColor || '#ffffff').toLowerCase() === p.color.toLowerCase()
                        ? 'ring-2 ring-amber-500 scale-105 shadow-sm'
                        : 'border-black/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: p.color }}
                    title={`${p.name} (${p.color})`}
                  >
                    {(canvasConfig.backgroundColor || '#ffffff').toLowerCase() === p.color.toLowerCase() && (
                      <Check className={`w-3.5 h-3.5 ${p.color === '#18181B' ? 'text-white' : 'text-amber-600'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => updateCanvas({ backgroundColor: 'transparent' })}
                className="text-[11px] py-1 px-2.5 rounded-lg bg-white/70 hover:bg-white text-gray-700 font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Lienzo Transparente
              </button>
              <button
                type="button"
                onClick={() => updateCanvas({ backgroundColor: '#FFFFFF' })}
                className="text-[11px] py-1 px-2.5 rounded-lg bg-white/70 hover:bg-white text-gray-700 font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Blanco Puro
              </button>
            </div>
          </div>

          {/* Background de "Web Invitados" */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Background "Web Invitados"</span>
              </label>
              <span className="text-[10px] font-bold text-blue-600 font-mono uppercase">
                {canvasConfig.webBackgroundColor || '#EBEBEB'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              Color de fondo que verán los invitados en toda la página web pública.
            </p>

            <div className="flex items-center space-x-2">
              <input 
                type="color"
                className="w-10 h-10 p-0.5 border-0 rounded-xl bg-transparent cursor-pointer shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]"
                value={(canvasConfig.webBackgroundColor || '#EBEBEB').startsWith('#') ? (canvasConfig.webBackgroundColor || '#EBEBEB') : '#EBEBEB'}
                onChange={(e) => updateCanvas({ webBackgroundColor: e.target.value })}
              />
              <input
                type="text"
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border-0 text-gray-800 outline-none"
                value={canvasConfig.webBackgroundColor || '#EBEBEB'}
                placeholder="#EBEBEB"
                onChange={(e) => updateCanvas({ webBackgroundColor: e.target.value })}
              />
            </div>

            {/* Presets Web Invitados */}
            <div className="pt-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tonos Recomendados:</span>
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  { name: 'Neumórfico Base', color: '#EBEBEB' },
                  { name: 'Blanco Editorial', color: '#FFFFFF' },
                  { name: 'Marfil Cálido', color: '#FAF8F5' },
                  { name: 'Crema Nupcial', color: '#F5EFEB' },
                  { name: 'Arena Suave', color: '#EFE6DC' },
                  { name: 'Salvia Pálido', color: '#EDF2EE' },
                  { name: 'Champagne', color: '#F9F4EC' },
                  { name: 'Gris Perla', color: '#F1F5F9' },
                  { name: 'Rosa Cuarzo', color: '#FDF2F4' },
                  { name: 'Lila Claro', color: '#F5F3FF' },
                  { name: 'Carbón', color: '#18181B' },
                  { name: 'Medianoche', color: '#0F172A' }
                ].map(p => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => updateCanvas({ webBackgroundColor: p.color })}
                    className={`h-7 rounded-lg border flex items-center justify-center transition-all ${
                      (canvasConfig.webBackgroundColor || '#EBEBEB').toLowerCase() === p.color.toLowerCase()
                        ? 'ring-2 ring-blue-500 scale-105 shadow-sm'
                        : 'border-black/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: p.color }}
                    title={`${p.name} (${p.color})`}
                  >
                    {(canvasConfig.webBackgroundColor || '#EBEBEB').toLowerCase() === p.color.toLowerCase() && (
                      <Check className={`w-3.5 h-3.5 ${['#18181B', '#0F172A'].includes(p.color) ? 'text-white' : 'text-blue-600'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => updateCanvas({ webBackgroundColor: canvasConfig.backgroundColor || '#ffffff' })}
                className="flex-1 text-[11px] py-1.5 px-2 rounded-xl bg-white/80 hover:bg-white text-gray-700 font-semibold shadow-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                title="Aplica el mismo color del canva a toda la página de invitados"
              >
                <Copy className="w-3 h-3 text-gray-500" />
                <span>Igualar al Canva</span>
              </button>
              <button
                type="button"
                onClick={() => updateCanvas({ webBackgroundColor: '#EBEBEB' })}
                className="text-[11px] py-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white text-gray-700 font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Restablecer al color neumórfico original"
              >
                Restablecer (#EBEBEB)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const handleUpdateStyle = (key: string, value: any) => {
    // Get latest state to avoid closure staleness on multiple sync calls
    const state = useEditorStore.getState();
    const el = state.document.pages[0].elements.find(e => e.id === selectedElement.id);
    if (!el) return;
    updateElement(selectedElement.id, { 
      style: { ...el.style, [key]: value } 
    });
  };

  const handleUpdateContent = (textOrObj: string | any) => {
    if (typeof textOrObj === 'string') {
        updateElement(selectedElement.id, { 
          content: { ...selectedElement.content, text: textOrObj } 
        });
    } else {
        updateElement(selectedElement.id, { 
          content: textOrObj 
        });
    }
  };

  const handleUpdateContentKey = (key: string, value: any) => {
    const state = useEditorStore.getState();
    const el = state.document.pages[0].elements.find(e => e.id === selectedElement.id);
    if (!el) return;
    updateElement(selectedElement.id, { 
      content: { ...(el.content || {}), [key]: value } 
    });
  };

  return (
    <div className="flex flex-col h-full wc-properties overflow-y-auto">
      <div className="p-3 border-b border-gray-200/50 bg-[#EBEBEB]/50 backdrop-blur-md sticky top-0 z-10">
        <h3 className="text-[11px] font-semibold text-gray-800 flex items-center space-x-1.5 uppercase tracking-wide">
          <Settings2 className="w-4 h-4 text-gray-800" />
          <span>Propiedades del Objeto</span>
        </h3>
      </div>

      <div className="p-3 space-y-4">
        {selectedElement.dataBinding && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/60 shadow-sm space-y-2">
            <div className="flex items-start justify-between space-x-2">
              <div className="flex items-start space-x-2">
                <LinkIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900">Vinculado a Datos</p>
                  <p className="text-[10px] text-blue-700 mt-0.5">
                    Campo: <span className="font-semibold">
                      {selectedElement.dataBinding.field === 'coupleNames' ? 'Nombres de los Novios' :
                       selectedElement.dataBinding.field === 'eventDate' ? 'Fecha de la Boda' :
                       selectedElement.dataBinding.field === 'venueName' ? 'Lugar de Ceremonia' :
                       selectedElement.dataBinding.field === 'romanticQuote' ? 'Frase Romántica' :
                       selectedElement.dataBinding.field === 'headerTag' ? 'Etiqueta de Encabezado' :
                       selectedElement.dataBinding.field === 'footerGreeting' ? 'Despedida / Saludo' :
                       selectedElement.dataBinding.field}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateElement(selectedElement.id, { dataBinding: undefined })}
                className="text-[10px] font-semibold text-blue-700 hover:text-blue-900 underline shrink-0 transition-colors"
                title="Desvincular del evento para escribir texto personalizado"
              >
                Desvincular
              </button>
            </div>
            <p className="text-[10px] text-blue-600/80 italic">
              Sincronizado automáticamente con los datos principales de Casanovia.
            </p>
          </div>
        )}

        {selectedElement.type === 'text' && !selectedElement.dataBinding && (
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Texto</label>
            <textarea 
              className="w-full text-xs p-2 border border-[#D9CEBF] rounded-lg bg-[#FAF8F5] resize-none text-gray-900"
              rows={3}
              value={selectedElement.content.text || ''}
              onChange={(e) => handleUpdateContent(e.target.value)}
            />
          </div>
        )}

        {!['event-ceremony-card', 'event-reception-card', 'dress-code-card', 'wishes-wall-card', 'countdown-widget', 'interactive-button', 'image', 'image-frame', 'audio-player'].includes(selectedElement.type) && (
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color</label>
            <div className="flex items-center space-x-2 mb-2">
              <input 
                type="color" 
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                value={selectedElement.style.fill || '#000000'}
                onChange={(e) => {
                  handleUpdateStyle('fill', e.target.value);
                  handleUpdateStyle('isDefaultStyle', false);
                }}
              />
              <input 
                type="text" 
                className="flex-1 text-xs p-1.5 border border-[#D9CEBF] rounded uppercase font-mono text-gray-900"
                value={selectedElement.style.fill || '#000000'}
                onChange={(e) => {
                  handleUpdateStyle('fill', e.target.value);
                  handleUpdateStyle('isDefaultStyle', false);
                }}
              />
            </div>
            <div className="flex space-x-1">
               {[
                 { id: 'primary', color: document.theme.palette.primary },
                 { id: 'secondary', color: document.theme.palette.secondary },
                 { id: 'text', color: document.theme.palette.text },
                 { id: 'muted', color: document.theme.palette.muted },
                 { id: 'accent', color: document.theme.palette.accent }
               ].map(swatch => (
                 <button 
                   key={swatch.id}
                   className="w-6 h-6 rounded border border-gray-200"
                   style={{ backgroundColor: swatch.color }}
                   title={swatch.id}
                   onClick={() => handleUpdateStyle('fill', swatch.color)}
                 />
               ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CARD PROPS: Event Details, Dress Code, Wishes Wall        */}
        {/* ========================================================= */}
        {['event-ceremony-card', 'event-reception-card', 'dress-code-card', 'wishes-wall-card'].includes(selectedElement.type) && (() => {
          const isCeremony = selectedElement.type === 'event-ceremony-card';
          const isReception = selectedElement.type === 'event-reception-card';
          const isDressCode = selectedElement.type === 'dress-code-card';
          const isWishesWall = selectedElement.type === 'wishes-wall-card';
          const content = selectedElement.content || {};
          const style = selectedElement.style || {};
          const align = (style.align || style.textAlign || 'left') as 'left' | 'center' | 'right';

          return (
            <div className="space-y-4">
              {/* SECTION 1: CONTENIDO DE LA FICHA */}
              <div className="p-3 bg-white/70 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                <div className="flex items-center space-x-1.5 border-b border-gray-200/60 pb-2">
                  {isCeremony && <Church className="w-4 h-4 text-emerald-700" />}
                  {isReception && <PartyPopper className="w-4 h-4 text-amber-700" />}
                  {isDressCode && <Shirt className="w-4 h-4 text-indigo-700" />}
                  {isWishesWall && <MessageSquare className="w-4 h-4 text-rose-700" />}
                  <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                    {isCeremony ? 'Contenido Ceremonia' :
                     isReception ? 'Contenido Recepción' :
                     isDressCode ? 'Contenido Vestimenta' : 'Contenido Muro Deseos'}
                  </span>
                </div>

                {/* Event Ceremony & Reception Card Fields */}
                {(isCeremony || isReception) && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Etiqueta / Distintivo
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none"
                        value={content.badge ?? (isCeremony ? '⛪ Ceremonia Religiosa' : '🥂 Recepción & Fiesta')}
                        onChange={(e) => handleUpdateContentKey('badge', e.target.value)}
                        placeholder="Ej. Ceremonia Religiosa"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Lugar / Templo / Salón
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none"
                        value={content.venueName ?? (isCeremony ? 'Parroquia Nuestra Señora' : 'Hacienda Villa del Sol')}
                        onChange={(e) => handleUpdateContentKey('venueName', e.target.value)}
                        placeholder="Ej. Parroquia San José"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Horario / Hora
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none"
                        value={content.time ?? (isCeremony ? '17:00 hrs (Puntual)' : '19:30 hrs')}
                        onChange={(e) => handleUpdateContentKey('time', e.target.value)}
                        placeholder="Ej. 17:00 hrs (Puntual)"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Dirección Completa
                      </label>
                      <textarea 
                        rows={2}
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none resize-none"
                        value={content.address ?? 'Av. Principal #123, Zona Colonial'}
                        onChange={(e) => handleUpdateContentKey('address', e.target.value)}
                        placeholder="Ej. Av. Principal #123, Centro Histórico"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enlaces de Navegación</p>
                      <div>
                        <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Enlace Google Maps</label>
                        <input 
                          type="text"
                          className="w-full text-[11px] p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white outline-none"
                          value={content.googleMapsUrl || ''}
                          onChange={(e) => handleUpdateContentKey('googleMapsUrl', e.target.value)}
                          placeholder="https://maps.google.com/?q=..."
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Enlace Waze</label>
                        <input 
                          type="text"
                          className="w-full text-[11px] p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white outline-none"
                          value={content.wazeUrl || ''}
                          onChange={(e) => handleUpdateContentKey('wazeUrl', e.target.value)}
                          placeholder="https://waze.com/ul?q=..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Dress Code Card Fields */}
                {isDressCode && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Etiqueta / Distintivo
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none"
                        value={content.badge ?? '👔 Código de Vestimenta'}
                        onChange={(e) => handleUpdateContentKey('badge', e.target.value)}
                        placeholder="Ej. Código de Vestimenta"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Estilo / Título (Código)
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none"
                        value={content.styleName ?? 'Formal Rigurosa'}
                        onChange={(e) => handleUpdateContentKey('styleName', e.target.value)}
                        placeholder="Ej. Formal Rigurosa / Black Tie"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Indicaciones y Descripción
                      </label>
                      <textarea 
                        rows={3}
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none resize-none"
                        value={content.description ?? 'Damas: Vestido largo de gala en tonos tierra o pastel. Caballeros: Traje oscuro o smoking formal.'}
                        onChange={(e) => handleUpdateContentKey('description', e.target.value)}
                        placeholder="Indicaciones para damas y caballeros..."
                      />
                    </div>

                    {/* Color Palette List */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          Paleta Sugerida
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const curColors = content.suggestedColors || [
                              { name: 'Esmeralda', hex: '#2A4736' },
                              { name: 'Salvia', hex: '#8A9A86' },
                              { name: 'Champán', hex: '#D4AF37' },
                              { name: 'Arena', hex: '#C5A880' },
                            ];
                            handleUpdateContentKey('suggestedColors', [
                              ...curColors,
                              { name: 'Color ' + (curColors.length + 1), hex: '#C5A880' }
                            ]);
                          }}
                          className="inline-flex items-center space-x-1 text-[10px] text-blue-700 font-semibold hover:text-blue-900"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar Color</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(content.suggestedColors || [
                          { name: 'Esmeralda', hex: '#2A4736' },
                          { name: 'Salvia', hex: '#8A9A86' },
                          { name: 'Champán', hex: '#D4AF37' },
                          { name: 'Arena', hex: '#C5A880' },
                        ]).map((col: { name: string; hex: string }, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200/80">
                            <input 
                              type="color" 
                              className="w-6 h-6 rounded cursor-pointer border-0 p-0 shrink-0"
                              value={col.hex}
                              onChange={(e) => {
                                const cur = [...(content.suggestedColors || [
                                  { name: 'Esmeralda', hex: '#2A4736' },
                                  { name: 'Salvia', hex: '#8A9A86' },
                                  { name: 'Champán', hex: '#D4AF37' },
                                  { name: 'Arena', hex: '#C5A880' },
                                ])];
                                cur[idx] = { ...cur[idx], hex: e.target.value };
                                handleUpdateContentKey('suggestedColors', cur);
                              }}
                            />
                            <input 
                              type="text"
                              className="flex-1 text-[11px] p-1 text-gray-900 border border-gray-200 rounded bg-white"
                              value={col.name}
                              placeholder="Nombre color"
                              onChange={(e) => {
                                const cur = [...(content.suggestedColors || [
                                  { name: 'Esmeralda', hex: '#2A4736' },
                                  { name: 'Salvia', hex: '#8A9A86' },
                                  { name: 'Champán', hex: '#D4AF37' },
                                  { name: 'Arena', hex: '#C5A880' },
                                ])];
                                cur[idx] = { ...cur[idx], name: e.target.value };
                                handleUpdateContentKey('suggestedColors', cur);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const cur = [...(content.suggestedColors || [
                                  { name: 'Esmeralda', hex: '#2A4736' },
                                  { name: 'Salvia', hex: '#8A9A86' },
                                  { name: 'Champán', hex: '#D4AF37' },
                                  { name: 'Arena', hex: '#C5A880' },
                                ])];
                                cur.splice(idx, 1);
                                handleUpdateContentKey('suggestedColors', cur);
                              }}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded"
                              title="Eliminar color"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Wishes Wall Card Fields */}
                {isWishesWall && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Etiqueta / Distintivo
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none"
                        value={content.badge ?? '💌 Muro de los Deseos'}
                        onChange={(e) => handleUpdateContentKey('badge', e.target.value)}
                        placeholder="Ej. Muro de los Deseos"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Título Principal
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none"
                        value={content.title ?? 'Muro de los Deseos'}
                        onChange={(e) => handleUpdateContentKey('title', e.target.value)}
                        placeholder="Ej. Muro de los Deseos"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Subtítulo / Instrucción
                      </label>
                      <textarea 
                        rows={2}
                        className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none resize-none"
                        value={content.subtitle ?? 'Deseos y bendiciones de nuestros invitados'}
                        onChange={(e) => handleUpdateContentKey('subtitle', e.target.value)}
                        placeholder="Mensaje de invitación a dejar deseos..."
                      />
                    </div>

                    {/* Wishes sample items */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          Deseos de Ejemplo
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const curWishes = content.wishes?.length > 0 ? content.wishes : [
                              { author: 'Familia Ramírez', message: '¡Que su hogar siempre rebose de alegría, paz y amor incondicional!' },
                              { author: 'Carlos y Sofía', message: '¡Felicitaciones en esta nueva etapa! Los queremos un montón.' }
                            ];
                            handleUpdateContentKey('wishes', [
                              ...curWishes,
                              { author: 'Invitado', message: '¡Muchas felicidades y bendiciones!' }
                            ]);
                          }}
                          className="inline-flex items-center space-x-1 text-[10px] text-blue-700 font-semibold hover:text-blue-900"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar Deseo</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(content.wishes?.length > 0 ? content.wishes : [
                          { author: 'Familia Ramírez', message: '¡Que su hogar siempre rebose de alegría, paz y amor incondicional!' },
                          { author: 'Carlos y Sofía', message: '¡Felicitaciones en esta nueva etapa! Los queremos un montón.' }
                        ]).map((w: { author: string; message: string }, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded-lg border border-gray-200/80 space-y-1 relative">
                            <div className="flex items-center justify-between">
                              <input 
                                type="text"
                                className="text-[11px] p-1 font-bold text-gray-900 border border-gray-200 rounded bg-white w-2/3"
                                value={w.author}
                                placeholder="Autor"
                                onChange={(e) => {
                                  const cur = [...(content.wishes || [
                                    { author: 'Familia Ramírez', message: '¡Que su hogar siempre rebose de alegría, paz y amor incondicional!' },
                                    { author: 'Carlos y Sofía', message: '¡Felicitaciones en esta nueva etapa! Los queremos un montón.' }
                                  ])];
                                  cur[idx] = { ...cur[idx], author: e.target.value };
                                  handleUpdateContentKey('wishes', cur);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = [...(content.wishes || [
                                    { author: 'Familia Ramírez', message: '¡Que su hogar siempre rebose de alegría, paz y amor incondicional!' },
                                    { author: 'Carlos y Sofía', message: '¡Felicitaciones en esta nueva etapa! Los queremos un montón.' }
                                  ])];
                                  cur.splice(idx, 1);
                                  handleUpdateContentKey('wishes', cur);
                                }}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded"
                                title="Eliminar deseo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea 
                              rows={2}
                              className="w-full text-[11px] p-1 text-gray-700 border border-gray-200 rounded bg-white resize-none"
                              value={w.message}
                              placeholder="Mensaje de felicitación..."
                              onChange={(e) => {
                                const cur = [...(content.wishes || [
                                  { author: 'Familia Ramírez', message: '¡Que su hogar siempre rebose de alegría, paz y amor incondicional!' },
                                  { author: 'Carlos y Sofía', message: '¡Felicitaciones en esta nueva etapa! Los queremos un montón.' }
                                ])];
                                cur[idx] = { ...cur[idx], message: e.target.value };
                                handleUpdateContentKey('wishes', cur);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: TIPOGRAFÍA, TAMAÑOS Y ALINEADO */}
              <div className="p-3 bg-white/70 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                <div className="flex items-center space-x-1.5 border-b border-gray-200/60 pb-2">
                  <Type className="w-4 h-4 text-gray-700" />
                  <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                    Tipografía y Textos
                  </span>
                </div>

                {/* Title Font */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Tipografía del Título
                  </label>
                  <FontPicker 
                    value={style.titleFontFamily || style.fontFamily || 'Playfair Display, serif'}
                    onChange={(font) => handleUpdateStyle('titleFontFamily', font)}
                  />
                </div>

                {/* Body Font */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Tipografía de Textos / Cuerpo
                  </label>
                  <FontPicker 
                    value={style.fontFamily || 'sans-serif'}
                    onChange={(font) => handleUpdateStyle('fontFamily', font)}
                  />
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Alineación de Textos
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStyle('align', 'left');
                        handleUpdateStyle('textAlign', 'left');
                      }}
                      className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                        align === 'left'
                          ? 'bg-[#2D3748] text-white border-[#2D3748] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      <span>Izquierda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStyle('align', 'center');
                        handleUpdateStyle('textAlign', 'center');
                      }}
                      className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                        align === 'center'
                          ? 'bg-[#2D3748] text-white border-[#2D3748] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                      <span>Centro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStyle('align', 'right');
                        handleUpdateStyle('textAlign', 'right');
                      }}
                      className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                        align === 'right'
                          ? 'bg-[#2D3748] text-white border-[#2D3748] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                      <span>Derecha</span>
                    </button>
                  </div>
                </div>

                {/* Font Sizes Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Título (px)
                    </label>
                    <input 
                      type="number"
                      min="12"
                      max="40"
                      className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                      value={style.titleFontSize || 18}
                      onChange={(e) => handleUpdateStyle('titleFontSize', parseInt(e.target.value) || 18)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Cuerpo (px)
                    </label>
                    <input 
                      type="number"
                      min="8"
                      max="24"
                      className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                      value={style.bodyFontSize || 11}
                      onChange={(e) => handleUpdateStyle('bodyFontSize', parseInt(e.target.value) || 11)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Badge (px)
                    </label>
                    <input 
                      type="number"
                      min="8"
                      max="20"
                      className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                      value={style.badgeFontSize || 11}
                      onChange={(e) => handleUpdateStyle('badgeFontSize', parseInt(e.target.value) || 11)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: COLORES Y FONDO DE LA TARJETA */}
              <div className="p-3 bg-white/70 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                <div className="flex items-center space-x-1.5 border-b border-gray-200/60 pb-2">
                  <Palette className="w-4 h-4 text-purple-700" />
                  <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                    Colores y Fondo
                  </span>
                </div>

                {/* Background color */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Color de Fondo de la Ficha
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 shrink-0"
                      value={style.backgroundColor || '#FAF8F5'}
                      onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="flex-1 text-xs p-1.5 border border-gray-200 rounded-lg uppercase font-mono text-gray-900 bg-white"
                      value={style.backgroundColor || '#FAF8F5'}
                      onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
                    />
                  </div>
                </div>

                {/* Title and Body Text Colors in 2 cols */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Color del Título
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input 
                        type="color" 
                        className="w-7 h-7 rounded cursor-pointer border-0 p-0 shrink-0"
                        value={style.titleColor || '#2D2A26'}
                        onChange={(e) => handleUpdateStyle('titleColor', e.target.value)}
                      />
                      <input 
                        type="text" 
                        className="flex-1 text-[11px] p-1 border border-gray-200 rounded uppercase font-mono text-gray-900 bg-white"
                        value={style.titleColor || '#2D2A26'}
                        onChange={(e) => handleUpdateStyle('titleColor', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Color de Textos
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input 
                        type="color" 
                        className="w-7 h-7 rounded cursor-pointer border-0 p-0 shrink-0"
                        value={style.color || '#524B42'}
                        onChange={(e) => handleUpdateStyle('color', e.target.value)}
                      />
                      <input 
                        type="text" 
                        className="flex-1 text-[11px] p-1 border border-gray-200 rounded uppercase font-mono text-gray-900 bg-white"
                        value={style.color || '#524B42'}
                        onChange={(e) => handleUpdateStyle('color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Badge and Border Colors in 2 cols */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Color Distintivo / Acento
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input 
                        type="color" 
                        className="w-7 h-7 rounded cursor-pointer border-0 p-0 shrink-0"
                        value={style.accentColor || (isCeremony ? '#8A9A86' : '#C5A880')}
                        onChange={(e) => handleUpdateStyle('accentColor', e.target.value)}
                      />
                      <input 
                        type="text" 
                        className="flex-1 text-[11px] p-1 border border-gray-200 rounded uppercase font-mono text-gray-900 bg-white"
                        value={style.accentColor || (isCeremony ? '#8A9A86' : '#C5A880')}
                        onChange={(e) => handleUpdateStyle('accentColor', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Color de Borde
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input 
                        type="color" 
                        className="w-7 h-7 rounded cursor-pointer border-0 p-0 shrink-0"
                        value={style.borderColor || '#EADDCE'}
                        onChange={(e) => handleUpdateStyle('borderColor', e.target.value)}
                      />
                      <input 
                        type="text" 
                        className="flex-1 text-[11px] p-1 border border-gray-200 rounded uppercase font-mono text-gray-900 bg-white"
                        value={style.borderColor || '#EADDCE'}
                        onChange={(e) => handleUpdateStyle('borderColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Border width and corner radius */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Grosor Borde (px)
                    </label>
                    <input 
                      type="number"
                      min="0"
                      max="12"
                      className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                      value={style.strokeWidth ?? 1}
                      onChange={(e) => handleUpdateStyle('strokeWidth', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Redondeo (px)
                    </label>
                    <input 
                      type="number"
                      min="0"
                      max="40"
                      className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                      value={style.borderRadius ?? 20}
                      onChange={(e) => handleUpdateStyle('borderRadius', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}


        {selectedElement.type === 'image' && (
          <div className="space-y-4">
            {selectedElement.content.isSvg && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color del Ícono / SVG</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.fill || '#000000'}
                  onChange={(e) => {
                    const color = e.target.value;
                    handleUpdateStyle('fill', color);
                    
                    // Modify the SVG source
                    if (selectedElement.content.svgText) {
                      let newSvg = selectedElement.content.svgText;
                      // Inject a style to force fill color
                      const styleTag = `<style>* { fill: ${color} !important; stroke: ${color} !important; }</style>`;
                      if (newSvg.includes('<svg')) {
                        newSvg = newSvg.replace(/(<svg[^>]*>)/i, `$1${styleTag}`);
                      }
                      const newSrc = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(newSvg)));
                      handleUpdateContent({ ...selectedElement.content, src: newSrc });
                    }
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Forma de la Foto</label>
              <div className="grid grid-cols-4 gap-2">
                {['none', 'circle', 'ellipse', 'rounded', 'arch', 'heart', 'scallop', 'diamond'].map(mask => (
                  <button 
                    key={mask}
                    className={`p-1.5 border rounded-lg flex items-center justify-center bg-gray-50 ${selectedElement.style.maskId === mask ? 'border-transparent bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('maskId', mask)}
                    title={mask}
                  >
                     <div className="w-6 h-6 bg-gray-300" style={{
                       borderRadius: mask === 'circle' ? '50%' : mask === 'rounded' ? '4px' : '0'
                     }}></div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Marco Decorativo</label>
              <div className="grid grid-cols-3 gap-2">
                 <button 
                    className={`p-2 border rounded-lg text-xs ${!selectedElement.style.frameId ? 'border-transparent bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('frameId', null)}
                  >
                    Ninguno
                  </button>
                  <button 
                    className={`p-2 border rounded-lg text-xs ${selectedElement.style.frameId === 'gold-line' ? 'border-transparent bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('frameId', 'gold-line')}
                  >
                    Línea Fina
                  </button>
              </div>
            </div>

            {/* Smart Background Removal with White Halo Reduction */}
            <div className="pt-3 border-t border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fondo Transparente y Halo</span>
                </label>
                {selectedElement.content?.isTransparent && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Transparencia Activa
                  </span>
                )}
              </div>

              {!selectedElement.content?.isTransparent ? (
                <button
                  onClick={async () => {
                    const rawSrc = selectedElement.content?.unprocessedSrc || selectedElement.content?.originalSrc || selectedElement.content?.src;
                    if (!rawSrc) return;
                    const tol = selectedElement.content?.bgRemovalTolerance ?? 35;
                    const halo = selectedElement.content?.bgRemovalHalo ?? 2;
                    const transparentPng = await processImageTransparency(rawSrc, {
                      tolerance: tol,
                      haloReduction: halo,
                      smoothEdges: true,
                      edgeDefringe: true
                    });
                    handleUpdateContent({
                      ...selectedElement.content,
                      src: transparentPng,
                      unprocessedSrc: rawSrc,
                      originalSrc: rawSrc,
                      isTransparent: true,
                      bgRemovalTolerance: tol,
                      bgRemovalHalo: halo,
                      bgRemovalSmooth: true
                    });
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-[#EBEBEB] hover:bg-white text-gray-800 text-xs font-semibold shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all cursor-pointer"
                  title="Elimina el fondo blanco u opaco de la imagen eliminando halos"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Hacer Fondo Transparente</span>
                </button>
              ) : (
                <div className="space-y-3 p-3 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                  {/* Halo Reduction Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700">Disminución de Halo Blanco</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/80 text-gray-800 shadow-2xs font-mono">
                        {selectedElement.content?.bgRemovalHalo ?? 2} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="1"
                      value={selectedElement.content?.bgRemovalHalo ?? 2}
                      onChange={async (e) => {
                        const newHalo = Number(e.target.value);
                        const rawSrc = selectedElement.content?.unprocessedSrc || selectedElement.content?.originalSrc || selectedElement.content?.src;
                        const tol = selectedElement.content?.bgRemovalTolerance ?? 35;
                        const transparentPng = await processImageTransparency(rawSrc, {
                          tolerance: tol,
                          haloReduction: newHalo,
                          smoothEdges: true,
                          edgeDefringe: true
                        });
                        handleUpdateContent({
                          ...selectedElement.content,
                          src: transparentPng,
                          unprocessedSrc: rawSrc,
                          originalSrc: rawSrc,
                          isTransparent: true,
                          bgRemovalHalo: newHalo
                        });
                      }}
                      className="w-full accent-amber-600 cursor-pointer h-1.5 bg-gray-300 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                      <span>0px (Suave)</span>
                      <span>2px (Recomendado)</span>
                      <span>6px (Máximo)</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Reduce y desvanece el contorno o halo blanco remanente alrededor de la figura.
                    </p>
                  </div>

                  {/* Tolerance Slider */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-300/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700">Tolerancia de Fondo</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/80 text-gray-800 shadow-2xs font-mono">
                        {selectedElement.content?.bgRemovalTolerance ?? 35}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={selectedElement.content?.bgRemovalTolerance ?? 35}
                      onChange={async (e) => {
                        const newTol = Number(e.target.value);
                        const rawSrc = selectedElement.content?.unprocessedSrc || selectedElement.content?.originalSrc || selectedElement.content?.src;
                        const halo = selectedElement.content?.bgRemovalHalo ?? 2;
                        const transparentPng = await processImageTransparency(rawSrc, {
                          tolerance: newTol,
                          haloReduction: halo,
                          smoothEdges: true,
                          edgeDefringe: true
                        });
                        handleUpdateContent({
                          ...selectedElement.content,
                          src: transparentPng,
                          unprocessedSrc: rawSrc,
                          originalSrc: rawSrc,
                          isTransparent: true,
                          bgRemovalTolerance: newTol
                        });
                      }}
                      className="w-full accent-amber-600 cursor-pointer h-1.5 bg-gray-300 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                      <span>10% (Estricto)</span>
                      <span>35% (Normal)</span>
                      <span>80% (Amplio)</span>
                    </div>
                  </div>

                  {/* Restore Original Button */}
                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const rawSrc = selectedElement.content?.unprocessedSrc || selectedElement.content?.originalSrc;
                        if (!rawSrc) return;
                        handleUpdateContent({
                          ...selectedElement.content,
                          src: rawSrc,
                          isTransparent: false
                        });
                      }}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                      <span>Restaurar Fondo Original</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedElement.type === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipografía</label>
              <FontPicker 
                value={selectedElement.style.fontFamily || ''}
                onChange={(font) => {
                  handleUpdateStyle('fontFamily', font);
                  handleUpdateStyle('isDefaultStyle', false);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tamaño</label>
                <div className="flex items-center space-x-1">
                  <button className="px-2 py-1 bg-gray-100 rounded text-gray-900" onClick={() => {
                    handleUpdateStyle('fontSize', Math.max(8, (selectedElement.style.fontSize || 16) - 1));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}>-</button>
                  <input 
                    type="number" 
                    className="w-full text-xs p-1.5 text-gray-900 border border-[#D9CEBF] rounded bg-[#FAF8F5] text-center"
                    value={selectedElement.style.fontSize || 16}
                    onChange={(e) => {
                      handleUpdateStyle('fontSize', parseInt(e.target.value) || 16);
                      handleUpdateStyle('isDefaultStyle', false);
                    }}
                  />
                  <button className="px-2 py-1 bg-gray-100 rounded text-gray-900" onClick={() => {
                    handleUpdateStyle('fontSize', Math.min(144, (selectedElement.style.fontSize || 16) + 1));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}>+</button>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Peso</label>
                <select 
                  className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                  value={selectedElement.style.fontWeight || 400}
                  onChange={(e) => {
                    handleUpdateStyle('fontWeight', parseInt(e.target.value));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}
                >
                  <option value={300}>Light (300)</option>
                  <option value={400}>Regular (400)</option>
                  <option value={500}>Medium (500)</option>
                  <option value={600}>SemiBold (600)</option>
                  <option value={700}>Bold (700)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-1 rounded-lg">
              <div className="flex space-x-1">
                <button 
                  className={`text-gray-900 p-1.5 rounded ${selectedElement.style.align === 'left' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'left')}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button 
                  className={`text-gray-900 p-1.5 rounded ${(selectedElement.style.align || 'center') === 'center' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'center')}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button 
                  className={`text-gray-900 p-1.5 rounded ${selectedElement.style.align === 'right' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'right')}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button 
                  className={`text-gray-900 p-1.5 rounded ${selectedElement.style.align === 'justify' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'justify')}
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>

              <div className="flex space-x-1 border-l pl-2 border-gray-200">
                <button 
                  className={`text-gray-900 p-1.5 rounded ${selectedElement.style.fontStyle === 'italic' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('fontStyle', selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1">
                  <span>Espaciado letras</span>
                  <span>{selectedElement.style.letterSpacing || 0}px</span>
                </div>
                <input 
                  type="range" min="-2" max="20" step="0.5"
                  className="w-full accent-[#2D3748]"
                  value={selectedElement.style.letterSpacing || 0}
                  onChange={(e) => handleUpdateStyle('letterSpacing', parseFloat(e.target.value))}
                />
              </div>
              
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1">
                  <span>Altura de línea</span>
                  <span>{selectedElement.style.lineHeight || 1.2}</span>
                </div>
                <input 
                  type="range" min="0.8" max="3" step="0.1"
                  className="w-full accent-[#2D3748]"
                  value={selectedElement.style.lineHeight || 1.2}
                  onChange={(e) => handleUpdateStyle('lineHeight', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
               <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Transformación</label>
               <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                 <button className={`flex-1 text-xs py-1 text-gray-900 ${selectedElement.style.textTransform === 'none' || !selectedElement.style.textTransform ? 'bg-gray-200 font-bold' : 'bg-[#EBEBEB]'}`} onClick={() => handleUpdateStyle('textTransform', 'none')}>Aa</button>
                 <button className={`flex-1 text-xs py-1 text-gray-900 ${selectedElement.style.textTransform === 'uppercase' ? 'bg-gray-200 font-bold' : 'bg-[#EBEBEB]'}`} onClick={() => handleUpdateStyle('textTransform', 'uppercase')}>AA</button>
                 <button className={`flex-1 text-xs py-1 text-gray-900 ${selectedElement.style.textTransform === 'lowercase' ? 'bg-gray-200 font-bold' : 'bg-[#EBEBEB]'}`} onClick={() => handleUpdateStyle('textTransform', 'lowercase')}>aa</button>
                 <button className={`flex-1 text-xs py-1 text-gray-900 ${selectedElement.style.textTransform === 'capitalize' ? 'bg-gray-200 font-bold' : 'bg-[#EBEBEB]'}`} onClick={() => handleUpdateStyle('textTransform', 'capitalize')}>Aa</button>
               </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
               <label className="flex items-center space-x-2">
                 <input type="checkbox" checked={selectedElement.style.shadow?.enabled || false} onChange={(e) => handleUpdateStyle('shadow', { ...selectedElement.style.shadow, enabled: e.target.checked, color: 'rgba(0,0,0,0.5)', blur: 5, offsetX: 2, offsetY: 2 })} />
                 <span className="text-xs font-bold text-gray-700">Sombra paralela</span>
               </label>
            </div>
          </div>
        )}


        {selectedElement.type === 'audio-player' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Título de la Canción</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.title || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">URL del Audio (mp3, etc)</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.src || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, src: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fondo Contenedor</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.backgroundColor || '#EBEBEB'}
                  onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Elementos</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.color || '#2D3748'}
                  onChange={(e) => handleUpdateStyle('color', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        
        {selectedElement.type === 'svg-shape' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de Forma</label>
              <select 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 outline-none"
                value={selectedElement.style.variant || 'rectangle'}
                onChange={(e) => {
                  const newVariant = e.target.value;
                  if (newVariant === 'line') {
                    handleUpdateStyle('variant', 'line');
                    handleUpdateStyle('fill', 'transparent');
                    const curWidth = selectedElement.style.strokeWidth || 0;
                    if (curWidth <= 0) handleUpdateStyle('strokeWidth', 2);
                    if (!selectedElement.style.stroke || selectedElement.style.stroke === 'transparent') {
                      handleUpdateStyle('stroke', '#2D3748');
                    }
                  } else if (newVariant === 'circle' || newVariant === 'oval') {
                    handleUpdateStyle('variant', newVariant);
                    const curWidth = selectedElement.style.strokeWidth || 0;
                    if (curWidth <= 0) handleUpdateStyle('strokeWidth', 2);
                    if (!selectedElement.style.stroke || selectedElement.style.stroke === 'transparent') {
                      handleUpdateStyle('stroke', '#2D3748');
                    }
                    if (selectedElement.style.fill === 'transparent') {
                      handleUpdateStyle('fill', '#D9CEBF');
                    }
                  } else {
                    handleUpdateStyle('variant', newVariant);
                  }
                }}
              >
                <option value="rectangle">Rectángulo</option>
                <option value="square">Cuadrado</option>
                <option value="circle">Círculo</option>
                <option value="oval">Óvalo</option>
                <option value="line">Línea</option>
                <option value="triangle">Triángulo</option>
                <option value="pentagon">Pentágono</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              {selectedElement.style.variant === 'line' ? (
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color de Línea</label>
                  <div className="flex items-center space-x-1">
                    <input 
                      type="color" 
                      className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                      value={selectedElement.style.stroke && selectedElement.style.stroke !== 'transparent' ? selectedElement.style.stroke : '#2D3748'}
                      onChange={(e) => handleUpdateStyle('stroke', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Relleno</label>
                    <div className="flex items-center space-x-1">
                        <input 
                          type="color" 
                          className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                          value={selectedElement.style.fill || '#cccccc'}
                          onChange={(e) => handleUpdateStyle('fill', e.target.value)}
                          disabled={selectedElement.style.fill === 'transparent'}
                        />
                        <button 
                            className={`text-xs px-2 py-1 rounded border text-gray-900 ${selectedElement.style.fill === 'transparent' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'}`}
                            onClick={() => handleUpdateStyle('fill', selectedElement.style.fill === 'transparent' ? '#cccccc' : 'transparent')}
                            title="Alternar transparente"
                        >T</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Borde</label>
                    <div className="flex items-center space-x-1">
                        <input 
                          type="color" 
                          className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                          value={selectedElement.style.stroke && selectedElement.style.stroke !== 'transparent' ? selectedElement.style.stroke : '#2D3748'}
                          onChange={(e) => handleUpdateStyle('stroke', e.target.value)}
                          disabled={selectedElement.style.stroke === 'transparent'}
                        />
                        <button 
                            className={`text-xs px-2 py-1 rounded border text-gray-900 ${selectedElement.style.stroke === 'transparent' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'}`}
                            onClick={() => handleUpdateStyle('stroke', selectedElement.style.stroke === 'transparent' ? '#2D3748' : 'transparent')}
                            title="Alternar transparente"
                        >T</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {selectedElement.style.variant === 'line' ? 'Grosor de Línea' : 'Grosor Borde'}
                  </label>
                  <input 
                    type="number" 
                    min={selectedElement.style.variant === 'line' ? "1" : "0"}
                    max="50"
                    className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                    value={selectedElement.style.strokeWidth ?? (selectedElement.style.variant === 'line' || selectedElement.style.variant === 'circle' || selectedElement.style.variant === 'oval' ? 2 : 0)}
                    onChange={(e) => handleUpdateStyle('strokeWidth', parseInt(e.target.value) || 0)}
                  />
                </div>
                {['rectangle', 'square'].includes(selectedElement.style.variant || 'rectangle') && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Redondeo Esquinas</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                    value={selectedElement.style.borderRadius || 0}
                    onChange={(e) => handleUpdateStyle('borderRadius', parseInt(e.target.value) || 0)}
                  />
                </div>
                )}
            </div>
            
          </div>
        )}

        {selectedElement.type === 'interactive-button' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipografía</label>
              <FontPicker 
                value={selectedElement.style.fontFamily || ''}
                onChange={(font) => handleUpdateStyle('fontFamily', font)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Texto del Botón</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.text || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, text: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Acción / Destino del Botón</label>
              <select
                className="w-full text-xs p-2 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all mb-2"
                value={
                  selectedElement.content.linkUrl === '#rsvp-section' 
                    ? '#rsvp-section'
                    : selectedElement.content.linkUrl === '#event-details-section'
                    ? '#event-details-section'
                    : selectedElement.content.linkUrl === '#gift-registry-section'
                    ? '#gift-registry-section'
                    : selectedElement.content.linkUrl === '#wishes-wall-section'
                    ? '#wishes-wall-section'
                    : selectedElement.content.linkUrl === '#protocol-pass-section'
                    ? '#protocol-pass-section'
                    : selectedElement.content.actionType === 'copy-link'
                    ? '__copy_link__'
                    : '__custom_url__'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__copy_link__') {
                    handleUpdateContent({
                      ...selectedElement.content,
                      actionType: 'copy-link'
                    });
                  } else if (val === '__custom_url__') {
                    handleUpdateContent({
                      ...selectedElement.content,
                      actionType: 'open-url'
                    });
                  } else {
                    // Internal section link
                    handleUpdateContent({
                      ...selectedElement.content,
                      actionType: 'scroll-to-section',
                      linkUrl: val
                    });
                  }
                }}
              >
                <optgroup label="Secciones Web Invitados (Opción 2)">
                  <option value="#rsvp-section">Confirmar Asistencia (RSVP)</option>
                  <option value="#event-details-section">Cómo llegar / Ubicación y Horarios</option>
                  <option value="#gift-registry-section">Mesa de Regalos / Datos Bancarios</option>
                  <option value="#wishes-wall-section">Muro de Firmas y Deseos</option>
                  <option value="#protocol-pass-section">Pase de Entrada / Protocolo</option>
                </optgroup>
                <optgroup label="Otras Acciones">
                  <option value="__custom_url__">Enlace Externo Personalizado (URL)</option>
                  <option value="__copy_link__">Copiar Texto al Portapapeles</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {selectedElement.content.actionType === 'copy-link' ? 'Texto a Copiar' : 'Enlace / ID de Destino'}
              </label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.linkUrl || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, linkUrl: e.target.value })}
                placeholder="#rsvp-section o https://..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Variante</label>
              <select
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.style.variant || 'solid'}
                onChange={(e) => handleUpdateStyle('variant', e.target.value)}
              >
                <option value="solid">Sólido</option>
                <option value="outline">Contorno</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Fondo / Borde</label>
              <input 
                type="color" 
                className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                value={selectedElement.style.backgroundColor || '#000000'}
                onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Texto</label>
              <input 
                type="color" 
                className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                value={selectedElement.style.color || '#ffffff'}
                onChange={(e) => handleUpdateStyle('color', e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedElement.type === 'countdown-widget' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Título</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.title || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Mensaje Final (Expirado)</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.expiredMessage || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, expiredMessage: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha Objetivo</label>
              <input 
                type="datetime-local" 
                disabled={selectedElement.content.useEventDate}
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all disabled:opacity-50"
                value={selectedElement.content.targetDate ? selectedElement.content.targetDate.substring(0, 16) : ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, targetDate: new Date(e.target.value).toISOString() })}
              />
              {selectedElement.content.useEventDate && <p className="text-[10px] text-gray-500 mt-1">Vinculado a la fecha del evento.</p>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Estilo Visual</label>
              <select
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.style.variant || 'cards'}
                onChange={(e) => handleUpdateStyle('variant', e.target.value)}
              >
                <option value="minimal">Minimalista (Sin fondo)</option>
                <option value="cards">Tarjetas</option>
                <option value="circles">Círculos</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Mostrar Segundos</label>
              <input 
                type="checkbox" 
                checked={selectedElement.content.showSeconds || false}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, showSeconds: e.target.checked })}
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fuente Números</label>
                <FontPicker 
                  value={selectedElement.style.numberFont || ''}
                  onChange={(font) => handleUpdateStyle('numberFont', font)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fuente Textos</label>
                <FontPicker 
                  value={selectedElement.style.labelFont || ''}
                  onChange={(font) => handleUpdateStyle('labelFont', font)}
                />
              </div>
            </div>
                        <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Números</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.numberColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('numberColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Etiquetas</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.labelColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('labelColor', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color del Título</label>
              <input 
                type="color" 
                className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                value={selectedElement.style.titleColor || '#000000'}
                onChange={(e) => handleUpdateStyle('titleColor', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fondo Contenedor</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.containerBackgroundColor || '#ffffff'}
                  onChange={(e) => handleUpdateStyle('containerBackgroundColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Transparencia</label>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full accent-[#2D3748]"
                  value={selectedElement.style.containerOpacity ?? 0}
                  onChange={(e) => handleUpdateStyle('containerOpacity', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {selectedElement.type === 'image-frame' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Forma del Contenedor
              </label>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {[
                  { id: 'rectangle', label: 'Rect', icon: Square },
                  { id: 'circle', label: 'Círculo', icon: Circle },
                  { id: 'oval', label: 'Óvalo', isOval: true },
                  { id: 'arch', label: 'Arco', isArch: true },
                  { id: 'heart', label: 'Corazón', icon: Heart },
                ].map(item => {
                  const isSelected = (selectedElement.content?.shapeVariant || 'rectangle') === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleUpdateContent({ ...selectedElement.content, shapeVariant: item.id })}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-semibold transition-all ${
                        isSelected 
                          ? 'bg-[#2D3748] text-white shadow-inner' 
                          : 'bg-[#EBEBEB] text-gray-700 shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:bg-white'
                      }`}
                      title={item.label}
                    >
                      {Icon ? (
                        <Icon className="w-4 h-4 mb-0.5 shrink-0" />
                      ) : item.isOval ? (
                        <div className="w-4 h-2.5 rounded-full border-2 border-current mb-0.5" />
                      ) : (
                        <div className="w-3.5 h-4 border-2 border-current rounded-t-full mb-0.5" />
                      )}
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <select
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 outline-none transition-all"
                value={selectedElement.content?.shapeVariant || 'rectangle'}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, shapeVariant: e.target.value })}
              >
                <option value="rectangle">Rectángulo / Cuadrado</option>
                <option value="circle">Círculo Perfecto</option>
                <option value="oval">Óvalo</option>
                <option value="arch">Arco Clásico (Portal de Boda)</option>
                <option value="heart">Corazón Romántico</option>
              </select>
            </div>

            {/* Photo Inside Container */}
            <div className="p-3 bg-white/70 rounded-2xl border border-gray-200/80 space-y-3">
              <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                Foto Contenida
              </label>

              {selectedElement.content?.imageSrc ? (
                <div className="space-y-2">
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <img 
                      src={selectedElement.content.imageSrc} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cambiar Foto</span>
                    </button>
                    <button
                      onClick={() => handleUpdateContent({ ...selectedElement.content, imageSrc: null })}
                      className="flex items-center justify-center p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all"
                      title="Quitar foto del marco"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-center">
                    <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-[11px] text-gray-600 font-medium">Sin imagen asignada</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Arrastra una imagen del lienzo o de tu equipo y suéltala sobre esta forma.</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-[#2D3748] text-white hover:bg-black text-xs font-medium transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Foto al Contenedor</span>
                  </button>
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const src = ev.target?.result as string;
                      handleUpdateContent({
                        ...selectedElement.content,
                        imageSrc: src
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            {/* Colors and Borders */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Fondo</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style?.fill || '#F8FAFC'}
                  onChange={(e) => handleUpdateStyle('fill', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Borde</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style?.stroke || '#CBD5E1'}
                  onChange={(e) => handleUpdateStyle('stroke', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Grosor Borde</label>
                <input 
                  type="number" 
                  min="0"
                  max="30"
                  className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                  value={selectedElement.style?.strokeWidth ?? 1}
                  onChange={(e) => handleUpdateStyle('strokeWidth', parseInt(e.target.value) || 0)}
                />
              </div>
              {(selectedElement.content?.shapeVariant || 'rectangle') === 'rectangle' && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Redondeo</label>
                  <input 
                    type="number" 
                    min="0"
                    max="150"
                    className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                    value={selectedElement.style?.cornerRadius ?? 24}
                    onChange={(e) => handleUpdateStyle('cornerRadius', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200/50 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex justify-between">
              <span>Opacidad Global</span>
              <span>{Math.round((selectedElement.style.opacity ?? 1) * 100)}%</span>
            </label>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              className="w-full accent-[#2D3748]"
              value={selectedElement.style.opacity ?? 1}
              onChange={(e) => handleUpdateStyle('opacity', parseFloat(e.target.value))}
            />
          </div>
          
          {['text', 'countdown-widget', 'interactive-button', 'svg-shape', 'audio-player'].includes(selectedElement.type) && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCurrentThemeColors"
                checked={selectedElement.style.isDefaultStyle || false}
                onChange={(e) => handleUpdateStyle('isDefaultStyle', e.target.checked)}
                className="rounded border-gray-300 text-[#2D3748] focus:ring-[#2D3748]"
              />
              <label htmlFor="useCurrentThemeColors" className="text-xs text-gray-700 cursor-pointer">
                Usar colores del estilo actual
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
