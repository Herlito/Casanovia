import React from 'react';

interface FloralBouquetProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FloralBouquet: React.FC<FloralBouquetProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const dimensions = size === 'sm' 
    ? 'w-20 h-16 sm:w-24 sm:h-20' 
    : size === 'lg' 
    ? 'w-36 h-28 sm:w-44 sm:h-32' 
    : 'w-28 h-20 sm:w-36 sm:h-24';

  return (
    <div className={`pointer-events-none select-none opacity-90 transition-opacity hover:opacity-100 ${dimensions} ${className}`}>
      <svg
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          <linearGradient id="roseGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9D7D7" />
            <stop offset="40%" stopColor="#E5989B" />
            <stop offset="80%" stopColor="#B55D6A" />
            <stop offset="100%" stopColor="#2D3748" />
          </linearGradient>
          <linearGradient id="roseGradientPeach" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE2D2" />
            <stop offset="45%" stopColor="#F4A261" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D97757" />
          </linearGradient>
          <linearGradient id="roseGradientSoft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF0F0" />
            <stop offset="50%" stopColor="#F8C0C8" />
            <stop offset="100%" stopColor="#C46D7D" />
          </linearGradient>
          <linearGradient id="leafSageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D8E2DC" />
            <stop offset="50%" stopColor="#9AA899" />
            <stop offset="100%" stopColor="#5A6D58" />
          </linearGradient>
          <linearGradient id="leafGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF4D6" />
            <stop offset="60%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#AA820A" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Stem & Branch Lines */}
        <path
          d="M 170 20 Q 140 45 100 65 Q 60 85 25 105"
          stroke="#7D8C7B"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 140 35 Q 115 20 85 28"
          stroke="#8A9A86"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M 110 60 Q 80 80 50 115"
          stroke="#7D8C7B"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Eucalyptus & Sage Leaves (Background & Accents) */}
        {/* Leaf 1 - top right */}
        <path
          d="M 175 15 C 190 25 185 45 160 40 C 145 35 155 15 175 15 Z"
          fill="url(#leafSageGradient)"
          opacity="0.9"
        />
        <path d="M 160 40 Q 170 28 175 15" stroke="#485946" strokeWidth="0.8" opacity="0.6" />

        {/* Leaf 2 - top left branch */}
        <path
          d="M 85 28 C 70 18 55 30 65 45 C 75 52 90 40 85 28 Z"
          fill="url(#leafSageGradient)"
          opacity="0.85"
        />
        <path d="M 65 45 Q 75 35 85 28" stroke="#485946" strokeWidth="0.8" opacity="0.6" />

        {/* Leaf 3 - Eucalyptus round leaf */}
        <circle cx="130" cy="22" r="9" fill="url(#leafSageGradient)" opacity="0.85" />
        <circle cx="150" cy="28" r="7.5" fill="#8A9A86" opacity="0.75" />

        {/* Leaf 4 - Bottom left eucalyptus */}
        <path
          d="M 45 110 C 25 105 20 85 40 80 C 55 78 60 98 45 110 Z"
          fill="url(#leafSageGradient)"
          opacity="0.88"
        />
        <circle cx="32" cy="92" r="8" fill="#9AA899" opacity="0.7" />

        {/* Golden botanical twigs & berries */}
        <circle cx="165" cy="55" r="3.5" fill="url(#leafGoldGradient)" />
        <circle cx="175" cy="48" r="3" fill="url(#leafGoldGradient)" />
        <circle cx="182" cy="60" r="2.5" fill="url(#leafGoldGradient)" />

        <circle cx="48" cy="65" r="3.5" fill="url(#leafGoldGradient)" />
        <circle cx="38" cy="58" r="2.8" fill="url(#leafGoldGradient)" />
        <circle cx="30" cy="70" r="3.2" fill="url(#leafGoldGradient)" />

        {/* ROSE 1: Main Blush Rose (Center Right) */}
        <g transform="translate(108, 38)">
          {/* Outer Petals */}
          <path
            d="M 0 10 C -18 -8 -8 -26 12 -22 C 32 -18 36 2 24 16 C 12 28 -8 24 0 10 Z"
            fill="url(#roseGradientMain)"
            opacity="0.95"
          />
          <path
            d="M -12 2 C -24 14 -12 30 6 26 C 20 22 24 10 16 0 C 8 -8 -4 -8 -12 2 Z"
            fill="url(#roseGradientSoft)"
            opacity="0.9"
          />
          {/* Inner Swirl Petals */}
          <path
            d="M -4 4 C -12 0 -6 -14 6 -12 C 16 -10 18 2 10 8 C 2 12 -2 8 -4 4 Z"
            fill="#2D3748"
            opacity="0.95"
          />
          <path
            d="M 2 2 C 0 -4 4 -8 8 -6 C 12 -4 12 2 8 4 C 4 6 2 4 2 2 Z"
            fill="#FDE2D2"
          />
          {/* Petal Highlights */}
          <path
            d="M -6 -12 Q 8 -18 16 -10"
            stroke="#FFF0F0"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M -14 8 Q -6 22 10 20"
            stroke="#FFF0F0"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>

        {/* ROSE 2: Peach Blossom Rose (Center Left) */}
        <g transform="translate(72, 60)">
          {/* Outer Petals */}
          <path
            d="M 0 0 C -16 -14 -4 -30 14 -24 C 28 -18 28 6 16 16 C 4 24 -12 12 0 0 Z"
            fill="url(#roseGradientPeach)"
            opacity="0.95"
          />
          {/* Mid Layer */}
          <path
            d="M -8 -4 C -14 8 -2 20 10 16 C 20 12 20 0 12 -6 C 4 -12 -4 -12 -8 -4 Z"
            fill="#E5989B"
            opacity="0.9"
          />
          {/* Center Swirl */}
          <path
            d="M 0 -2 C -4 -8 4 -12 8 -8 C 12 -4 10 4 6 6 C 2 8 -2 2 0 -2 Z"
            fill="#2D3748"
          />
          <path
            d="M 4 -2 C 3 -5 6 -7 8 -5 C 10 -3 9 1 7 2 C 5 3 4 0 4 -2 Z"
            fill="#FFF"
            opacity="0.9"
          />
          {/* Highlight */}
          <path
            d="M -4 -18 Q 10 -22 18 -14"
            stroke="#FFF"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>

        {/* Small Rosebud (Top Center) */}
        <g transform="translate(145, 70)">
          <path
            d="M 0 0 C -8 -10 2 -18 10 -12 C 16 -6 14 8 6 10 C -2 12 -6 6 0 0 Z"
            fill="url(#roseGradientSoft)"
            opacity="0.95"
          />
          <path
            d="M 2 -2 C 0 -6 6 -8 8 -4 C 10 0 8 4 4 4 Z"
            fill="#2D3748"
            opacity="0.9"
          />
          <path
            d="M -3 6 Q 4 12 10 6"
            stroke="#7D8C7B"
            strokeWidth="1.2"
            fill="none"
          />
        </g>

        {/* Soft Eucalyptus leaves in foreground */}
        <path
          d="M 120 72 C 135 80 130 95 112 90 C 100 86 108 70 120 72 Z"
          fill="url(#leafSageGradient)"
          opacity="0.85"
        />
        <path
          d="M 85 82 C 70 95 58 85 68 72 C 78 60 92 72 85 82 Z"
          fill="#8A9A86"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};
