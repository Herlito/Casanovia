import React from 'react';
import { ToolsPanel } from './ToolsPanel';

export const LeftSidebar: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col h-full w-64 min-w-[256px] bg-[#EBEBEB] rounded-3xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-3 overflow-y-auto">
      <div className="flex items-center justify-between px-2 mb-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Herramientas</h3>
      </div>
      <ToolsPanel />
    </div>
  );
};
