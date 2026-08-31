import React, { useState, useEffect, useRef } from 'react';
import { FONT_CATALOG, FontOption } from '../lib/fontCatalog';
import { loadGoogleFont } from '../lib/fontLoader';
import { Search, Check } from 'lucide-react';

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
}

const FontItem: React.FC<{ font: FontOption; isSelected: boolean; onSelect: () => void }> = ({ font, isSelected, onSelect }) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadGoogleFont(font.family, font.weights);
        observer.disconnect();
      }
    }, { rootMargin: '50px' });
    
    if (itemRef.current) {
      observer.observe(itemRef.current);
    }
    
    return () => observer.disconnect();
  }, [font.family]);

  return (
    <button
      ref={itemRef}
      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-[#FAF8F5] transition-colors ${isSelected ? 'bg-[#FAF8F5] text-[#2D3748] font-bold' : 'text-[#2D2A26]'}`}
      onClick={onSelect}
      style={{ fontFamily: `"${font.family}", sans-serif` }}
    >
      <span>{font.family}</span>
      {isSelected && <Check className="w-4 h-4" />}
    </button>
  );
};

export const FontPicker: React.FC<FontPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFonts = FONT_CATALOG.filter(f => f.family.toLowerCase().includes(search.toLowerCase()));
  
  const handleSelect = async (family: string, weights: number[]) => {
    await loadGoogleFont(family, weights);
    onChange(family);
    setIsOpen(false);
  };

  const handleCustomSearch = async () => {
    if (search && !FONT_CATALOG.find(f => f.family.toLowerCase() === search.toLowerCase())) {
      await loadGoogleFont(search);
      onChange(search);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button 
        className="w-full bg-[#EBEBEB] border border-transparent rounded-lg px-3 py-2 text-sm text-gray-900 text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontFamily: `"${value}", sans-serif` }}
      >
        <span className="truncate">{value || 'Seleccionar fuente'}</span>
        <span className="text-xs opacity-50">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-[#EBEBEB] border border-transparent rounded-lg shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] overflow-hidden flex flex-col max-h-64">
          <div className="p-2 border-b border-transparent flex items-center space-x-2">
            <Search className="w-4 h-4 text-[#8C8276]" />
            <input 
              type="text" 
              placeholder="Buscar fuente..." 
              className="flex-1 outline-none text-sm bg-transparent text-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCustomSearch();
              }}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <FontItem 
                  key={font.family} 
                  font={font} 
                  isSelected={value === font.family}
                  onSelect={() => handleSelect(font.family, font.weights)}
                />
              ))
            ) : (
              <button 
                className="w-full text-left px-3 py-3 text-sm text-[#2D3748] hover:bg-[#FAF8F5]"
                onClick={handleCustomSearch}
              >
                Buscar "{search}" en Google Fonts
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
