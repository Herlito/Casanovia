import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { ZoomIn, ZoomOut, Maximize, Magnet, Grid3X3 } from 'lucide-react';

export const FooterControls: React.FC = () => {
  const { zoom, setZoom, magnetEnabled, setMagnetEnabled, gridEnabled, setGridEnabled } = useEditorStore();

  return (
    <div className="absolute top-2 md:top-auto md:bottom-4 left-1/2 -translate-x-1/2 bg-[#EBEBEB] rounded-full shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] px-4 py-2 flex items-center space-x-3 z-10 border border-[#D9CEBF]">
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} 
          className="p-1.5 hover:bg-[#F3EFEA] rounded-full text-[#524B42]"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-[#524B42] w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button 
          onClick={() => setZoom(zoom + 0.1)} 
          className="p-1.5 hover:bg-[#F3EFEA] rounded-full text-[#524B42]"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[#D9CEBF] mx-1"></div>
        <button 
          onClick={() => setZoom(1)} 
          className="p-1.5 hover:bg-[#F3EFEA] rounded-full text-[#524B42]"
          title="Ajustar al 100%"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-4 bg-[#D9CEBF]"></div>

      {/* Grid toggle */}
      <button 
        onClick={() => setGridEnabled(!gridEnabled)} 
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
          gridEnabled 
            ? 'bg-blue-50 text-blue-700 shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff]' 
            : 'hover:bg-[#F3EFEA] text-[#524B42]'
        }`}
        title="Mostrar / Ocultar Cuadrícula de referencia"
      >
        <Grid3X3 className="w-4 h-4" />
        <span>Cuadrícula</span>
      </button>

      {/* Magnet toggle */}
      <button 
        onClick={() => setMagnetEnabled(!magnetEnabled)} 
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
          magnetEnabled 
            ? 'bg-emerald-50 text-emerald-700 shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff]' 
            : 'hover:bg-[#F3EFEA] text-[#524B42]'
        }`}
        title="Imán (Ajuste inteligente a guías)"
      >
        <Magnet className="w-4 h-4" />
        <span>Imán</span>
      </button>
    </div>
  );
};
