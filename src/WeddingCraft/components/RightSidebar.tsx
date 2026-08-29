import React, { useState } from 'react';
import { PropertiesPanel } from './PropertiesPanel';
import { ThemeSelector } from './ThemeSelector';
import { AnimationPanel } from './AnimationPanel';
import { Wand2 } from 'lucide-react';
import { Settings2, Palette } from 'lucide-react';

export const RightSidebar: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'themes' | 'animations'>('properties');

  return (
    <div className={`flex flex-col h-full wc-right-sidebar overflow-hidden ${isMobile ? "w-full bg-transparent border-none rounded-none m-0" : "w-80 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-sm m-3 ml-0"}`}>
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200/50 bg-white/50 backdrop-blur-xl shrink-0 p-1.5 gap-1">
        <button 
          className={`flex-1 py-2 rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'properties' 
              ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' 
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
              ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' 
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
              ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' 
              : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('themes')}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Estilos</span>
        </button>
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
      </div>
    </div>
  );
};
