import React from 'react';

export const CasanoviaHomeLanding: React.FC = () => {
  return (
    <div
      id="casanovia-home-landing"
      className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-[#EBEBEB] px-4 sm:px-6 select-none animate-fadeIn"
    >
      <div className="flex flex-col items-center justify-center w-full text-center h-full">
        {/* Centered Circle with Casanovia Logo */}
        <div className="relative flex items-center justify-center w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] bg-[#F5F5F5] rounded-full shadow-[15px_15px_35px_rgba(0,0,0,0.15),-5px_-5px_15px_rgba(255,255,255,1),inset_10px_10px_20px_rgba(0,0,0,0.1),inset_-10px_-10px_20px_rgba(255,255,255,1)]">
          <img
            src="/casanovia.svg"
            alt="Casanovia Logo"
            className="w-[140px] sm:w-[170px] h-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-in-out hover:scale-102"
          />
        </div>
      </div>
    </div>
  );
};
