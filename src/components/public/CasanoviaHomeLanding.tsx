import React from 'react';

export const CasanoviaHomeLanding: React.FC = () => {
  return (
    <div
      id="casanovia-home-landing"
      className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 sm:px-6 select-none animate-fadeIn"
    >
      <div className="flex flex-col items-center justify-center max-w-lg w-full text-center">
        {/* Centered Casanovia SVG Logo */}
        <div className="relative flex items-center justify-center p-6 sm:p-8">
          <img
            src="/casanovia.svg"
            alt="Casanovia"
            className="w-72 sm:w-96 md:w-[440px] max-w-[88vw] h-auto object-contain drop-shadow-xs transition-transform duration-700 ease-in-out hover:scale-102"
          />
        </div>
      </div>
    </div>
  );
};
