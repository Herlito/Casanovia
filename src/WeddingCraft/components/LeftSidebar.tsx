import React from 'react';
import { ToolsPanel } from './ToolsPanel';
import { useEditorStore } from '../store/useEditorStore';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const leftSidebarCollapsed = useEditorStore((state) => state.leftSidebarCollapsed);
  const setLeftSidebarCollapsed = useEditorStore((state) => state.setLeftSidebarCollapsed);

  if (leftSidebarCollapsed) {
    return (
      <div className="hidden md:flex flex-col h-full items-center py-3 px-1 bg-[#EBEBEB] rounded-3xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] transition-all">
        <button
          type="button"
          onClick={() => setLeftSidebarCollapsed(false)}
          className="p-2 bg-[#EBEBEB] hover:bg-white/80 active:shadow-[inset_2px_2px_4px_#d1d1d1] rounded-2xl text-gray-700 transition-all flex flex-col items-center gap-1 cursor-pointer"
          title="Expandir panel de herramientas"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
          <Wrench className="w-3.5 h-3.5 text-gray-500 mt-2" />
          <span className="text-[9px] font-bold text-gray-500 [writing-mode:vertical-rl] tracking-wider mt-1">
            HERRAMIENTAS
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-col h-full w-64 min-w-[256px] bg-[#EBEBEB] rounded-3xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-3 overflow-y-auto transition-all">
      <div className="flex items-center justify-between px-2 mb-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-gray-600" />
          <span>Herramientas</span>
        </h3>
        <button
          type="button"
          onClick={() => setLeftSidebarCollapsed(true)}
          className="p-1 hover:bg-white/80 active:shadow-[inset_2px_2px_4px_#d1d1d1] rounded-xl text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
          title="Ocultar panel para mayor espacio en el canvas"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <ToolsPanel />
    </div>
  );
};
