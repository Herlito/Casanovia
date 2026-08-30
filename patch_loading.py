import re

with open('src/components/CasanoviaLoadingScreen.tsx', 'r') as f:
    text = f.read()

# We completely replace the component body.
new_component = """import React from 'react';

export const CasanoviaLoadingScreen: React.FC = () => {
  return (
    <div
      id="casanovia-loading-screen"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#EFEFEF] px-6 select-none transition-opacity duration-300"
    >
      <div className="flex flex-col items-center max-w-sm w-full animate-fadeIn text-center h-full justify-between py-24">
        
        {/* Spacer for vertical alignment */}
        <div className="flex-1"></div>
        
        {/* Centered Circle with Logo */}
        <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 bg-[#F9F9F9] rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15),inset_0_4px_10px_rgba(255,255,255,1)]">
          <img
            src="/n.svg"
            alt="N Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1 flex flex-col justify-end pb-8 w-full items-center">
          {/* Minimalist gray loading progress indicator */}
          <div className="w-48 sm:w-64 h-1.5 bg-[#D6D6D6] rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-[#A3A3A3] rounded-full animate-pulse" />
          </div>
        </div>
        
      </div>
    </div>
  );
};
"""

with open('src/components/CasanoviaLoadingScreen.tsx', 'w') as f:
    f.write(new_component)
