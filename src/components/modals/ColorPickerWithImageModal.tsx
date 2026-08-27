import React, { useRef, useState } from 'react';
import { X, Upload, Pipette } from 'lucide-react';

interface ColorPickerWithImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHex: string;
  onColorChange: (hex: string) => void;
  colorName?: string;
}

export const ColorPickerWithImageModal: React.FC<ColorPickerWithImageModalProps> = ({
  isOpen,
  onClose,
  initialHex,
  onColorChange,
  colorName
}) => {
  const [currentHex, setCurrentHex] = useState(initialHex);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImage(url);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + [0, 1, 2].map(i => {
      const hexPart = pixel[i].toString(16);
      return hexPart.length === 1 ? '0' + hexPart : hexPart;
    }).join('');
    
    setCurrentHex(hex.toUpperCase());
  };

  const drawImageToCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (canvas && img) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    }
  };

  const handleSave = () => {
    onColorChange(currentHex);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-full">
        <div className="p-4 sm:p-6 border-b border-[#E8DCCF] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h2 className="text-lg font-bold text-[#2D2A26]">Seleccionar Color</h2>
            {colorName && <p className="text-xs text-[#7A7268]">{colorName}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E8DCCF] flex items-center justify-center text-[#7A7268] hover:text-[#2D2A26] hover:border-[#D4AF37] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Native Color Picker & Hex Input */}
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-2xl border-4 border-white shadow-md shrink-0 overflow-hidden" style={{ backgroundColor: currentHex }}>
                <input
                  type="color"
                  value={currentHex}
                  onChange={(e) => setCurrentHex(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                  Código Hexadecimal
                </label>
                <input
                  type="text"
                  value={currentHex}
                  onChange={(e) => setCurrentHex(e.target.value)}
                  className="w-32 px-3 py-2 text-sm font-mono rounded-xl border border-[#D9CEBF] bg-white text-[#2D2A26] font-bold uppercase"
                />
              </div>
            </div>

            <div className="border-t border-[#E8DCCF] pt-4">
              <h3 className="text-xs font-bold text-[#2D2A26] mb-3 flex items-center">
                <Pipette className="w-4 h-4 mr-1.5 text-blue-600" />
                Extraer color desde una imagen
              </h3>
              
              {!tempImage ? (
                <div className="relative w-full h-48 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-bold">Subir imagen temporal</span>
                  <span className="text-[10px] opacity-70 mt-1">Haz clic o arrastra aquí</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative w-full max-h-64 rounded-2xl border-2 border-blue-300 overflow-hidden bg-stone-100 flex items-center justify-center cursor-crosshair">
                    <img 
                      ref={imageRef} 
                      src={tempImage} 
                      alt="Temp" 
                      className="hidden" 
                      onLoad={drawImageToCanvas} 
                    />
                    <canvas 
                      ref={canvasRef} 
                      onClick={handleCanvasClick}
                      className="max-w-full max-h-64 object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-md pointer-events-none">
                      Haz clic en la imagen para extraer el color
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setTempImage(null)}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Quitar imagen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-[#E8DCCF] bg-[#FAF8F5] flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-[#7A7268] hover:text-[#2D2A26] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-[#2D2A26] text-white text-sm font-bold hover:bg-[#1A1816] transition-colors shadow-md"
          >
            Aplicar Color
          </button>
        </div>
      </div>
    </div>
  );
};
