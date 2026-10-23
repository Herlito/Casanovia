import React from 'react';

export const CasanoviaLoadingScreen: React.FC = () => {
  return (
    <div
      id="casanovia-loading-screen"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#EBEBEB] px-6 select-none transition-opacity duration-300"
    >
      <div className="flex flex-col items-center max-w-md w-full animate-fadeIn text-center h-full justify-between py-24">
        
        <div className="flex-1"></div>
        
        {/* Centered Circle with current Casanovia Logo */}
        <div className="relative flex items-center justify-center w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] bg-[#F5F5F5] rounded-full shadow-[15px_15px_35px_rgba(0,0,0,0.15),-5px_-5px_15px_rgba(255,255,255,1),inset_10px_10px_20px_rgba(0,0,0,0.1),inset_-10px_-10px_20px_rgba(255,255,255,1)]">
          <img
            src="/casanovia.svg"
            alt="Casanovia Logo"
            className="w-[140px] sm:w-[170px] h-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1 flex flex-col justify-end pb-8 w-full items-center">
          {/* Minimalist gray loading progress indicator */}
          <div className="w-[200px] sm:w-[240px] h-[6px] bg-[#D4D4D4] relative overflow-hidden rounded-full">
            <div className="absolute top-0 bottom-0 left-0 w-[40%] bg-[#9E9E9E] rounded-full animate-[slide_2s_ease-in-out_infinite]" />
          </div>
        </div>
        
      </div>
    </div>
  );
};
