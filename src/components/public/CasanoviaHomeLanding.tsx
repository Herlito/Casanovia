import React from 'react';
import { useWedding } from '../../context/WeddingContext';

export const CasanoviaHomeLanding: React.FC = () => {
  const { setShowAuthModal } = useWedding();

  return (
    <div
      id="casanovia-home-landing"
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[#EBEBEB] px-4 sm:px-6 select-none animate-fadeIn"
    >
      <div className="flex flex-col items-center justify-center w-full text-center">
        {/* Centered Circle with Casanovia Logo converted into a button to open Acceso */}
        <button
          type="button"
          id="btn-casanovia-home-logo"
          onClick={() => setShowAuthModal(true)}
          aria-label="Acceso Casanovia"
          className="relative flex items-center justify-center w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] bg-[#F5F5F5] rounded-full shadow-[15px_15px_35px_rgba(0,0,0,0.15),-5px_-5px_15px_rgba(255,255,255,1),inset_10px_10px_20px_rgba(0,0,0,0.1),inset_-10px_-10px_20px_rgba(255,255,255,1)] cursor-pointer border-none outline-none focus:outline-none transition-transform duration-200 active:scale-98"
        >
          <img
            src="/casanovia.svg"
            alt="Casanovia Logo"
            className="w-[140px] sm:w-[170px] h-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-in-out hover:scale-102 pointer-events-none"
          />
        </button>
      </div>
    </div>
  );
};
