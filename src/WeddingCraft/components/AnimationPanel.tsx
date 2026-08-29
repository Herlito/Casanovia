import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { AnimationConfig } from '../types';
import { Wand2, Play, Settings2 } from 'lucide-react';

export const AnimationPanel: React.FC = () => {
  const { document, selectedElementIds, updateElement } = useEditorStore();
  
  if (selectedElementIds.length !== 1) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <Wand2 className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-xs text-gray-500">Selecciona un elemento para configurar sus animaciones.</p>
      </div>
    );
  }

  const selectedElement = document.pages[0].elements.find(e => e.id === selectedElementIds[0]);
  if (!selectedElement) return null;

  const animation = selectedElement.animation || {};

  const handleUpdate = (layer: 'entrance' | 'permanent' | 'exit', updates: Partial<AnimationConfig>) => {
    const currentLayer = animation[layer] || {
      type: 'none',
      duration: 1,
      delay: 0,
      easing: 'ease',
      trigger: 'onLoad'
    };
    
    updateElement(selectedElement.id, {
      animation: {
        ...animation,
        [layer]: { ...currentLayer, ...updates }
      }
    });
  };

  const renderConfig = (title: string, layer: 'entrance' | 'permanent' | 'exit', options: string[]) => {
    const config = animation[layer];
    const type = config?.type || 'none';
    const isActive = type !== 'none';

    return (
      <div className={`p-3 border rounded-xl transition-all ${isActive ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">{title}</label>
          <select 
            className="text-xs p-1 border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:border-blue-400"
            value={type}
            onChange={(e) => handleUpdate(layer, { type: e.target.value })}
          >
            <option value="none">Ninguna</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {isActive && (
          <div className="space-y-3 pt-3 border-t border-gray-200/50">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Duración (s)</label>
                <input 
                  type="number" 
                  step="0.1" min="0.1" max="10"
                  className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none"
                  value={config.duration || 1}
                  onChange={(e) => handleUpdate(layer, { duration: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Retraso (s)</label>
                <input 
                  type="number" 
                  step="0.1" min="0" max="10"
                  className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none"
                  value={config.delay || 0}
                  onChange={(e) => handleUpdate(layer, { delay: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Curva (Easing)</label>
                <select 
                  className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none bg-white"
                  value={config.easing || 'ease'}
                  onChange={(e) => handleUpdate(layer, { easing: e.target.value })}
                >
                  <option value="linear">Linear</option>
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                </select>
              </div>
              {layer === 'entrance' && (
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Gatillo</label>
                  <select 
                    className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none bg-white"
                    value={config.trigger || 'onLoad'}
                    onChange={(e) => handleUpdate(layer, { trigger: e.target.value as any })}
                  >
                    <option value="onLoad">Al Cargar (onLoad)</option>
                    <option value="onScroll">Al Aparecer (onScroll)</option>
                  </select>
                </div>
              )}
              {layer === 'permanent' && (
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Dirección</label>
                  <select 
                    className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none bg-white"
                    value={config.direction || 'normal'}
                    onChange={(e) => handleUpdate(layer, { direction: e.target.value as any })}
                  >
                    <option value="normal">Normal</option>
                    <option value="reverse">Inversa</option>
                    <option value="alternate">Alterna (Ida y Vuelta)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto wc-properties">
      <div className="p-3 border-b border-gray-200/50 bg-white/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-gray-800 flex items-center space-x-1.5 uppercase tracking-wide">
          <Wand2 className="w-4 h-4 text-gray-800" />
          <span>Animar Objeto</span>
        </h3>
      </div>

      <div className="p-3 space-y-4">

        <button 
          onClick={() => useEditorStore.getState().setPreviewModalOpen(true)}
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-semibold text-xs mt-2"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Aplicar y Previsualizar</span>
        </button>

        {renderConfig('Entrada', 'entrance', ['fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'zoomIn', 'zoomOut', 'bounceIn'])}
        {renderConfig('Permanente (Loop)', 'permanent', ['pulse', 'float', 'spin', 'shake', 'swing', 'heartbeat'])}
        {renderConfig('Salida', 'exit', ['fadeOut', 'slideUpOut', 'slideDownOut', 'zoomOut'])}
      </div>
    </div>
  );
};
