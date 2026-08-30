import re

with open('src/components/CasanoviaLoadingScreen.tsx', 'r') as f:
    text = f.read()

new_component = """import React from 'react';

export const CasanoviaLoadingScreen: React.FC = () => {
  return (
    <div
      id="casanovia-loading-screen"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#EBEBEB] px-6 select-none transition-opacity duration-300"
    >
      <div className="flex flex-col items-center max-w-md w-full animate-fadeIn text-center h-full justify-between py-24">
        
        <div className="flex-1"></div>
        
        {/* Centered Circle with Logo */}
        <div className="relative flex items-center justify-center w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] bg-[#F5F5F5] rounded-full shadow-[15px_15px_35px_rgba(0,0,0,0.12),-15px_-15px_35px_rgba(255,255,255,0.9),inset_8px_8px_20px_rgba(0,0,0,0.08),inset_-8px_-8px_20px_rgba(255,255,255,1)]">
          <img
            src="/n.svg"
            alt="N Logo"
            className="w-[80px] h-[80px] sm:w-[90px] sm:h-[90px] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1 flex flex-col justify-end pb-8 w-full items-center">
          {/* Minimalist gray loading progress indicator */}
          <div className="w-[200px] sm:w-[240px] h-[6px] bg-[#D4D4D4] relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-[40%] bg-[#9E9E9E] animate-[slide_2s_ease-in-out_infinite]" />
          </div>
        </div>
        
      </div>
    </div>
  );
};
"""

with open('src/components/CasanoviaLoadingScreen.tsx', 'w') as f:
    f.write(new_component)
