import React, { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useWedding } from '../../context/WeddingContext';
import { FloorPlanElement } from '../../types';
import { Map, ChevronRight, Loader2 } from 'lucide-react';

export const FloorPlanPreviewCard: React.FC = () => {
  const { activeWeddingId, setShowFloorPlanModal } = useWedding();
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWeddingId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'floor_plans', activeWeddingId);
    
    // Subscribe to real-time updates of the floor plan
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.elements) {
          setElements(data.elements);
        }
      } else {
        setElements([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching floor plan preview:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeWeddingId]);

  // Calculate bounding box for SVG
  const minX = elements.length > 0 ? Math.min(...elements.map(e => e.x)) : 0;
  const minY = elements.length > 0 ? Math.min(...elements.map(e => e.y)) : 0;
  const maxX = elements.length > 0 ? Math.max(...elements.map(e => e.x + e.width)) : 800;
  const maxY = elements.length > 0 ? Math.max(...elements.map(e => e.y + e.height)) : 600;
  
  const mapWidth = Math.max(maxX - minX, 100);
  const mapHeight = Math.max(maxY - minY, 100);
  
  // Add some padding
  const paddingX = mapWidth * 0.1;
  const paddingY = mapHeight * 0.1;

  const viewBox = `${minX - paddingX} ${minY - paddingY} ${mapWidth + paddingX * 2} ${mapHeight + paddingY * 2}`;

  return (
    <div 
      onClick={() => setShowFloorPlanModal(true)}
      className="bg-[#FFFDFB] rounded-3xl p-6 border border-transparent shadow-xs transition-all hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] cursor-pointer group flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#2D2A26] flex items-center gap-2">
          <Map className="w-5 h-5 text-[#2D3748]" />
          Vista Previa del Plano
        </h3>
        <button
          type="button"
          className="text-xs font-semibold text-[#2D3748] group-hover:text-[#2D3748] flex items-center gap-1 transition-colors"
        >
          <span>Editar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 bg-[#F5F2ED] rounded-2xl overflow-hidden relative border border-transparent flex items-center justify-center min-h-[220px]">
        {loading ? (
          <div className="flex flex-col items-center text-[#8C8276]">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-xs font-medium">Cargando plano...</span>
          </div>
        ) : elements.length === 0 ? (
          <div className="flex flex-col items-center text-[#8C8276] p-6 text-center">
            <Map className="w-10 h-10 mb-3 opacity-40" />
            <span className="text-sm font-medium text-[#524B42]">Aún no hay elementos en el plano</span>
            <span className="text-xs mt-1">Haz clic para empezar a diseñar tu distribución</span>
          </div>
        ) : (
          <>
            <svg 
              viewBox={viewBox} 
              className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              preserveAspectRatio="xMidYMid meet"
            >
              {elements.map(el => {
                const isRound = el.type === 'round_table';
                const cx = el.x + el.width / 2;
                const cy = el.y + el.height / 2;
                
                return (
                  <g key={el.id} transform={`rotate(${el.rotation || 0} ${cx} ${cy})`}>
                    {isRound ? (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={el.width / 2} 
                        fill="#D9CEBF" 
                        stroke="#8C8276"
                        strokeWidth={mapWidth * 0.005}
                      />
                    ) : (
                      <rect 
                        x={el.x} 
                        y={el.y} 
                        width={el.width} 
                        height={el.height} 
                        rx={mapWidth * 0.01}
                        fill="#D9CEBF" 
                        stroke="#8C8276"
                        strokeWidth={mapWidth * 0.005}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* Overlay hint */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-[#EBEBEB]/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-xs font-bold text-[#2D3748] transform translate-y-4 group-hover:translate-y-0 transition-all">
                Abrir Diseñador
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
