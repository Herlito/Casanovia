import React from 'react';
import { ToolsPanel } from './ToolsPanel';
import { LayersPanel } from './LayersPanel';

export const LeftSidebar: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col h-full gap-3 w-64 min-w-[256px]">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <ToolsPanel />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <LayersPanel />
      </div>
    </div>
  );
};
