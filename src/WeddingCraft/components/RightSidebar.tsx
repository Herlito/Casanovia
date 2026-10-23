import React, { useState } from 'react';
import { PropertiesPanel } from './PropertiesPanel';
import { ThemeSelector } from './ThemeSelector';
import { AnimationPanel } from './AnimationPanel';
import { TemplatesPanel } from './TemplatesPanel';
import { LibraryPanel } from './LibraryPanel';
import { Library } from 'lucide-react';
import { LayoutTemplate } from 'lucide-react';
import { Wand2 } from 'lucide-react';
import { Settings2, Palette, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

export const RightSidebar: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'themes' | 'animations' | 'templates' | 'library'>('properties');
  const rightSidebarCollapsed = useEditorStore((state) => state.rightSidebarCollapsed);
  const setRightSidebarCollapsed = useEditorStore((state) => state.setRightSidebarCollapsed);

  if (!isMobile && rightSidebarCollapsed) {
    return (
      <div className="hidden md:flex flex-col h-full items-center py-3 px-1 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] transition-all">
        <button
          type="button"
          onClick={() => setRightSidebarCollapsed(false)}
          className="p-2 bg-[#EBEBEB] hover:bg-white/80 active:shadow-[inset_2px_2px_4px_#d1d1d1] rounded-2xl text-gray-700 transition-all flex flex-col items-center gap-1 cursor-pointer"
          title="Expandir panel de propiedades"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
          <Settings2 className="w-3.5 h-3.5 text-gray-500 mt-2" />
          <span className="text-[9px] font-bold text-gray-500 [writing-mode:vertical-rl] tracking-wider mt-1">
            PROPIEDADES
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full wc-right-sidebar overflow-hidden ${isMobile ? "w-full bg-transparent border-none rounded-none m-0" : "w-80 bg-[#EBEBEB]/80 backdrop-blur-2xl border border-transparent rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] m-1 ml-0"}`}>
      {/* Tabs Header */}
      <div className="flex items-center border-b border-gray-200/50 bg-[#EBEBEB]/50 backdrop-blur-xl shrink-0 p-1.5 gap-1">
        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'properties' 
              ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-800 border border-gray-200/50' 
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
              ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-800 border border-gray-200/50' 
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
              ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('themes')}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Estilos</span>
        </button>

        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'templates' 
              ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Plantillas</span>
        </button>

        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'library' 
              ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('library')}
        >
          <Library className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Librería</span>
        </button>

        {!isMobile && (
          <button
            type="button"
            onClick={() => setRightSidebarCollapsed(true)}
            className="p-1 hover:bg-white/80 active:shadow-[inset_2px_2px_4px_#d1d1d1] rounded-xl text-gray-500 hover:text-gray-800 transition-all cursor-pointer ml-0.5 shrink-0"
            title="Ocultar panel para mayor espacio en el canvas"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'properties' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <PropertiesPanel />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'themes' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <ThemeSelector />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'animations' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <AnimationPanel />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'templates' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <TemplatesPanel />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'library' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <LibraryPanel />
        </div>
      </div>
    </div>
  );
};
