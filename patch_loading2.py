import re

with open('src/components/CasanoviaLoadingScreen.tsx', 'r') as f:
    text = f.read()

new_component = """import React from 'react';

export const CasanoviaLoadingScreen: React.FC = () => {
  return (
    <div
      id="casanovia-loading-screen"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#EAEAEA] px-6 select-none transition-opacity duration-300"
    >
      <div className="flex flex-col items-center max-w-md w-full animate-fadeIn text-center h-full justify-between py-24">
        
        {/* Spacer for vertical alignment */}
        <div className="flex-1"></div>
        
        {/* Centered Circle with Logo */}
        <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64 bg-gradient-to-br from-[#ffffff] to-[#f0f0f0] rounded-full shadow-[10px_20px_40px_rgba(0,0,0,0.1),-10px_-10px_30px_rgba(255,255,255,0.8)]">
          <img
            src="/n.svg"
            alt="N Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1 flex flex-col justify-end pb-8 w-full items-center">
          {/* Minimalist gray loading progress indicator */}
          <div className="w-56 sm:w-72 h-1.5 bg-[#D4D4D4] relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#9E9E9E] animate-[slide_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
        
      </div>
    </div>
  );
};
"""

with open('src/components/CasanoviaLoadingScreen.tsx', 'w') as f:
    f.write(new_component)
