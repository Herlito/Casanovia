import React from 'react';

export const CasanoviaLoadingScreen: React.FC = () => {
  return (
    <div
      id="casanovia-loading-screen"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FDFBF7] text-[#2D2A26] px-6 select-none transition-opacity duration-300"
    >
      <div className="flex flex-col items-center max-w-sm w-full animate-fadeIn text-center">
        {/* Centered Casanovia SVG Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <img
            src="/casanovia.svg"
            alt="Casanovia"
            className="w-56 sm:w-72 max-w-[80vw] h-auto object-contain drop-shadow-sm transition-transform duration-700 ease-in-out"
          />
        </div>

        {/* Minimalist, luxury loading progress indicator */}
        <div className="w-36 sm:w-44 h-1 bg-[#8B3A4A]/10 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-[#8B3A4A]/40 via-[#8B3A4A] to-[#8B3A4A]/40 rounded-full animate-pulse" />
        </div>

        <p className="mt-3 text-[11px] tracking-[0.2em] uppercase font-serif text-[#8B3A4A]/70 font-medium">
          Cargando...
        </p>
      </div>
    </div>
  );
};
