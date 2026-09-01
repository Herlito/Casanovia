import { FurnitureSVGs } from './FurniturePaths';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  FloorPlanElement,
  FloorPlanSeat,
  Guest,
  FloorPlanScaleCalibration
} from '../../types';

interface FloorPlanCanvasProps {
  elements: FloorPlanElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<FloorPlanElement>) => void;
  onUpdateElements: (updated: FloorPlanElement[]) => void;
  onAssignGuestToSeat: (elementId: string, seatId: string, guest: Guest) => void;
  onUnassignGuestFromSeat: (elementId: string, seatId: string) => void;
  backgroundImageUrl?: string;
  backgroundOpacity?: number;
  scaleCalibration: FloorPlanScaleCalibration;
  gridSnap: boolean;
  gridSize: number;
  isCalibratingScale: boolean;
  onCalibrationLineDrawn: (pixelDistance: number) => void;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  canvasWidth: number;
  canvasHeight: number;
  canvasRotation?: number;
  draggedGuest: Guest | null;
  onSeatClick?: (elementId: string, seat: FloorPlanSeat, screenPos: { x: number; y: number }) => void;
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onAssignGuestToSeat,
  scaleCalibration,
  gridSnap,
  gridSize,
  isCalibratingScale,
  onCalibrationLineDrawn,
  zoom,
  setZoom,
  pan,
  setPan,
  canvasWidth,
  canvasHeight,
  backgroundImageUrl,
  backgroundOpacity = 0.85,
  draggedGuest,
  onSeatClick,
  canvasRotation = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Interaction State
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<{ elementId: string; seat: FloorPlanSeat; x: number; y: number } | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [elementOffset, setElementOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calibration tool interactive points
  const [calibrationStart, setCalibrationStart] = useState<{ x: number; y: number } | null>(null);
  const [calibrationCurrent, setCalibrationCurrent] = useState<{ x: number; y: number } | null>(null);

  // Load Background Image
  useEffect(() => {
    if (backgroundImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = backgroundImageUrl;
      img.onload = () => {
        bgImageRef.current = img;
        requestCanvasRender();
      };
      img.onerror = () => {
        bgImageRef.current = null;
        requestCanvasRender();
      };
    } else {
      bgImageRef.current = null;
      requestCanvasRender();
    }
  }, [backgroundImageUrl]);

  // Coordinate Conversion Helpers
      const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      
      let x = clientX - pan.x;
      let y = clientY - pan.y;
      
      x -= rect.width / 2;
      y -= rect.height / 2;
      const rad = -(canvasRotation || 0) * Math.PI / 180;
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      x = rx + rect.width / 2;
      y = ry + rect.height / 2;

      return {
        x: x / zoom,
        y: y / zoom,
      };
    },
    [pan.x, pan.y, zoom, canvasRotation]
  );

      const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      
      let x = worldX * zoom;
      let y = worldY * zoom;
      
      x -= rect.width / 2;
      y -= rect.height / 2;
      const rad = (canvasRotation || 0) * Math.PI / 180;
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      x = rx + rect.width / 2;
      y = ry + rect.height / 2;
      
      x += pan.x;
      y += pan.y;
      
      return { x, y };
    },
    [pan.x, pan.y, zoom, canvasRotation]
  );

  // Calculate chair world positions for a table
  const getChairPositions = useCallback((elem: FloorPlanElement) => {
    const chairs: { seat: FloorPlanSeat; x: number; y: number; angle: number }[] = [];
    const seats = elem.seats || [];
    const count = seats.length;
    if (count === 0) return chairs;

    if (elem.type === 'round_table') {
      const radius = elem.radius || 60;
      const chairDistance = radius + 22;
      const startAngle = (elem.rotation * Math.PI) / 180;

      for (let i = 0; i < count; i++) {
        const angle = startAngle + (i * 2 * Math.PI) / count;
        chairs.push({
          seat: seats[i],
          x: elem.x + Math.cos(angle) * chairDistance,
          y: elem.y + Math.sin(angle) * chairDistance,
          angle,
        });
      }
    } else if (elem.type === 'rectangular_table') {
      const w = elem.width;
      const h = elem.height;
      const rot = (elem.rotation * Math.PI) / 180;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      const rotatePoint = (px: number, py: number) => {
        return {
          x: elem.x + px * cosR - py * sinR,
          y: elem.y + px * sinR + py * cosR,
        };
      };

      const longSeats = elem.seatsLongSide || Math.floor((count - (elem.seatsHead || 0) * 2) / 2) || 3;
      const headSeats = elem.seatsHead !== undefined ? elem.seatsHead : 1;

      let seatIdx = 0;

      // Top Side
      const topSpacing = w / (longSeats + 1);
      for (let i = 1; i <= longSeats && seatIdx < count; i++) {
        const localX = -w / 2 + i * topSpacing;
        const localY = -h / 2 - 20;
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot });
        seatIdx++;
      }

      // Right Head
      if (headSeats > 0 && seatIdx < count) {
        for (let i = 1; i <= headSeats && seatIdx < count; i++) {
          const localX = w / 2 + 20;
          const localY = -h / 2 + (i * h) / (headSeats + 1);
          const pt = rotatePoint(localX, localY);
          chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI / 2 });
          seatIdx++;
        }
      }

      // Bottom Side
      const botSpacing = w / (longSeats + 1);
      for (let i = longSeats; i >= 1 && seatIdx < count; i--) {
        const localX = -w / 2 + i * botSpacing;
        const localY = h / 2 + 20;
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI });
        seatIdx++;
      }

      // Left Head
      if (headSeats > 0 && seatIdx < count) {
        for (let i = 1; i <= headSeats && seatIdx < count; i++) {
          const localX = -w / 2 - 20;
          const localY = -h / 2 + (i * h) / (headSeats + 1);
          const pt = rotatePoint(localX, localY);
          chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot - Math.PI / 2 });
          seatIdx++;
        }
      }
    }

    return chairs;
  }, []);

  // Main Render Routine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Canvas Background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, width, height);

            // Apply World Transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.translate(width / 2, height / 2);
    ctx.rotate((canvasRotation || 0) * Math.PI / 180);
    ctx.translate(-width / 2, -height / 2);
    ctx.translate(width / 2, height / 2);
    ctx.rotate((canvasRotation || 0) * Math.PI / 180);
    ctx.translate(-width / 2, -height / 2);
    ctx.scale(zoom, zoom);

    // 1. Draw PDF Background / Blueprint image
    if (bgImageRef.current) {
      ctx.save();
      ctx.globalAlpha = backgroundOpacity;
      ctx.drawImage(bgImageRef.current, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    } else {
      // Draw canvas bounds border
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.strokeStyle = '#E8DCCF';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    }

    // 2. Draw Grid Lines
    const step = gridSize || 40;
    ctx.save();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(217, 206, 191, 0.4)';
    for (let x = 0; x <= canvasWidth; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // 5-meter major lines if calibrated
    if (scaleCalibration.isCalibrated) {
      const majorStep = scaleCalibration.pixelsPerMeter * 5;
      ctx.strokeStyle = 'rgba(139, 58, 74, 0.15)';
      ctx.lineWidth = 1.2;
      for (let x = 0; x <= canvasWidth; x += majorStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += majorStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Draw Elements sorted by Z-Index
    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sortedElements.forEach((elem) => {
      const isSelected = elem.id === selectedElementId;
      const isHovered = elem.id === hoveredElementId;

      ctx.save();
      ctx.translate(elem.x, elem.y);
      ctx.rotate((elem.rotation * Math.PI) / 180);

      // Render by Type
      switch (elem.type) {
        case 'round_table': {
          const r = elem.radius || 60;

          // Shadow for 3D realism
          ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;

          // Table Surface
          ctx.fillStyle = elem.color || '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.fill();

          ctx.shadowColor = 'transparent';

          // Table Border
          ctx.strokeStyle = isSelected ? '#2D3748' : isHovered ? '#D4A373' : '#D9CEBF';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.stroke();

          // Table Center Label
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || `Mesa ${elem.tableNumber || ''}`, 0, -6);

          // Seat capacity badge
          const assignedCount = elem.seats.filter((s) => s.guestId).length;
          ctx.fillStyle = '#8C8276';
          ctx.font = '10px system-ui, sans-serif';
          ctx.fillText(`${assignedCount}/${elem.seats.length} pers.`, 0, 10);
          break;
        }

        case 'rectangular_table': {
          const w = elem.width;
          const h = elem.height;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;

          ctx.fillStyle = elem.color || '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 8);
          ctx.fill();

          ctx.shadowColor = 'transparent';

          ctx.strokeStyle = isSelected ? '#2D3748' : isHovered ? '#D4A373' : '#D9CEBF';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 8);
          ctx.stroke();

          // Label
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || `Mesa ${elem.tableNumber || ''}`, 0, -5);

          const assignedCount = elem.seats.filter((s) => s.guestId).length;
          ctx.fillStyle = '#8C8276';
          ctx.font = '10px system-ui, sans-serif';
          ctx.fillText(`${assignedCount}/${elem.seats.length} pers.`, 0, 10);
          break;
        }

        case 'stage': {
          const w = elem.width;
          const h = elem.height;
          ctx.fillStyle = elem.color || '#2D2A26';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 10);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#E5B869' : '#1A1816';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          // Stage spotlight glow
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🎤 ${elem.name || 'ESCENARIO'}`, 0, 0);
          break;
        }

        case 'dance_floor': {
          const w = elem.width;
          const h = elem.height;

          // Parquet / checkered pattern
          ctx.fillStyle = elem.color || '#F0E6D2';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 6);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#2D3748' : '#D4A373';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          ctx.fillStyle = '#5A3E2B';
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`✨ ${elem.name || 'PISTA DE BAILE'}`, 0, 0);
          break;
        }

        case 'bar': {
          const w = elem.width;
          const h = elem.height;
          ctx.fillStyle = elem.color || '#3D2B1F';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 6);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#E5B869' : '#2A1810';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          ctx.fillStyle = '#E5B869';
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🍸 ${elem.name || 'BARRA DE BAR'}`, 0, 0);
          break;
        }

        case 'dj_booth': {
          const w = elem.width;
          const h = elem.height;
          ctx.fillStyle = elem.color || '#1A202C';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 6);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#2D3748' : '#2D3748';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          ctx.fillStyle = '#63B3ED';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🎧 ${elem.name || 'CABINA DJ'}`, 0, 0);
          break;
        }

        case 'restrooms': {
          const w = elem.width;
          const h = elem.height;
          ctx.fillStyle = elem.color || '#E2E8F0';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 6);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#2D3748' : '#CBD5E1';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          ctx.fillStyle = '#334155';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🚻 ${elem.name || 'BAÑOS'}`, 0, 0);
          break;
        }

        case 'entrance': {
          const w = elem.width;
          const h = elem.height;
          ctx.fillStyle = elem.color || '#FEF3C7';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 6);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#2D3748' : '#F59E0B';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          ctx.fillStyle = '#92400E';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🚪 ${elem.name || 'ENTRADA'} ➜`, 0, 0);
          break;
        }

        case 'cake_table': {
          const r = elem.radius || 35;
          ctx.fillStyle = elem.color || '#FFF1F2';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#2D3748' : '#FDA4AF';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          ctx.fillStyle = '#9F1239';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🎂 ${elem.name || 'TORTA'}`, 0, 0);
          break;
        }

        case 'lounge': {
          const w = elem.width;
          const h = elem.height;
          ctx.fillStyle = elem.color || '#EDE9FE';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 8);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#2D3748' : '#C4B5FD';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          ctx.fillStyle = '#5B21B6';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🛋️ ${elem.name || 'LOUNGE'}`, 0, 0);
          break;
        }

        case 'photo_booth': {
          const w = elem.width;
          const h = elem.height;
          ctx.fillStyle = elem.color || '#E0F2FE';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 6);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#2D3748' : '#7DD3FC';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          ctx.fillStyle = '#0369A1';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`📸 ${elem.name || 'CABINA'}`, 0, 0);
          break;
        }

        

        case 'single_chair':
        case 'chair_row': {
          const count = elem.type === 'single_chair' ? 1 : (elem.chairCount || 4);
          const chairW = elem.width / count;
          const svgData = FurnitureSVGs.single_chair;
          
          ctx.shadowColor = 'rgba(0,0,0,0.1)';
          ctx.shadowBlur = 4;
          
          for (let i = 0; i < count; i++) {
            const cx = -elem.width / 2 + (i * chairW) + (chairW / 2);
            const w = chairW - 4;
            const h = elem.height - 4;
            
            ctx.save();
            ctx.translate(cx, 0); // Center of this specific chair
            
            // The SVG draws from 0,0 to width,height. So we scale and translate.
            const scaleX = w / svgData.width;
            const scaleY = h / svgData.height;
            ctx.scale(scaleX, scaleY);
            ctx.translate(-svgData.width / 2, -svgData.height / 2);
            
            const p = new Path2D(svgData.path);
            ctx.fillStyle = elem.color || '#FFFFFF';
            ctx.fill(p, 'evenodd');
            ctx.strokeStyle = isSelected ? '#2D3748' : '#D9CEBF';
            // Need to divide line width by scale so it doesn't get huge or tiny
            ctx.lineWidth = 1.5 / Math.min(scaleX, scaleY); 
            ctx.stroke(p);
            
            ctx.restore();
          }
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || (count === 1 ? 'Silla' : 'Fila'), 0, count === 1 ? 0 : -elem.height / 2 - 10);
          break;
        }

        case 'armchair_luis_xv':
        case 'sofa_1_seat':
        case 'sofa_2_seat': {
          const count = (elem.type === 'sofa_2_seat' && elem.chairCount === undefined) ? 2 : (elem.chairCount || 1);
          const seatW = elem.width / count;
          const isLuisXV = elem.type === 'armchair_luis_xv';
          
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 6;
          
          ctx.fillStyle = elem.color || '#F0E6D2';
          ctx.strokeStyle = isSelected ? '#2D3748' : '#D4A373';
          ctx.lineWidth = 2;
          
          for (let i = 0; i < count; i++) {
            const cx = -elem.width / 2 + (i * seatW) + (seatW / 2);
            const w = seatW - (count > 1 ? 0 : 4);
            const h = elem.height - 4;
            const x = cx - w / 2;
            const y = -elem.height / 2 + 2;
            
            if (isLuisXV) {
              // Ornate Backrest
              ctx.beginPath();
              ctx.moveTo(x + w*0.1, y + h*0.4);
              ctx.quadraticCurveTo(x + w/2, y - h*0.2, x + w*0.9, y + h*0.4);
              ctx.lineTo(x + w*0.8, y + h);
              ctx.lineTo(x + w*0.2, y + h);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              
              // Seat cushion
              ctx.beginPath();
              ctx.ellipse(cx, y + h*0.6, w*0.4, h*0.3, 0, 0, 2*Math.PI);
              ctx.fill();
              ctx.stroke();
              
              // Armrests
              ctx.beginPath();
              ctx.ellipse(x + w*0.15, y + h*0.5, w*0.1, h*0.2, 0, 0, 2*Math.PI);
              ctx.ellipse(x + w*0.85, y + h*0.5, w*0.1, h*0.2, 0, 0, 2*Math.PI);
              ctx.fill();
              ctx.stroke();
            } else {
              // Standard Sofa/Armchair
              // Main body
              ctx.beginPath();
              ctx.roundRect(x, y, w, h, 8);
              ctx.fill();
              ctx.stroke();
              
              // Cushion
              ctx.beginPath();
              ctx.roundRect(x + w*0.1, y + h*0.2, w*0.8, h*0.7, 4);
              ctx.fill();
              ctx.stroke();
              
              // Armrests (only on edges if multiple seats, or both if single)
              if (i === 0) { // Left arm
                ctx.beginPath();
                ctx.roundRect(x, y + h*0.1, w*0.15, h*0.8, 4);
                ctx.fill();
                ctx.stroke();
              }
              if (i === count - 1) { // Right arm
                ctx.beginPath();
                ctx.roundRect(x + w*0.85, y + h*0.1, w*0.15, h*0.8, 4);
                ctx.fill();
                ctx.stroke();
              }
            }
          }
          
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || '#5A3E2B';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = isLuisXV ? '⚜️' : '🛋️';
          ctx.fillText(elem.name ? `${icon} ${elem.name}` : icon, 0, 0);
          break;
        }
        case 'text_label': {
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 14px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || 'Texto de Referencia', 0, 0);
          break;
        }
      }

      ctx.restore();

      // 4. Draw Individual Chairs for Tables in World Space
      if (elem.type === 'round_table' || elem.type === 'rectangular_table') {
        const chairs = getChairPositions(elem);
        chairs.forEach(({ seat, x, y }) => {
          const isSeatHovered = hoveredSeat?.seat.id === seat.id;
          const isAssigned = !!seat.guestId;

          ctx.save();
          ctx.translate(x, y);

          const chairRadius = 13;

          // Glowing ring if dragging a guest and hovered
          if (draggedGuest && isSeatHovered) {
            ctx.strokeStyle = '#22C55E';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(0, 0, chairRadius + 4, 0, 2 * Math.PI);
            ctx.stroke();
          }

          // Chair Circle Fill
          if (isAssigned) {
            ctx.fillStyle = isSeatHovered ? '#722F3D' : '#2D3748'; // Brand Burgundy for assigned
          } else {
            ctx.fillStyle = isSeatHovered ? '#F3EFEA' : '#FFFFFF';
          }
          ctx.beginPath();
          ctx.arc(0, 0, chairRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Chair Border
          ctx.strokeStyle = isAssigned ? '#5A202C' : '#D9CEBF';
          ctx.lineWidth = isAssigned ? 1.5 : 1;
          ctx.beginPath();
          ctx.arc(0, 0, chairRadius, 0, 2 * Math.PI);
          ctx.stroke();

          // Initials or Seat Number
          if (isAssigned) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9.5px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const initials = seat.guestInitials || seat.guestName?.substring(0, 2).toUpperCase() || 'INV';
            ctx.fillText(initials, 0, 0);
          } else {
            ctx.fillStyle = '#8C8276';
            ctx.font = 'bold 8.5px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${seat.seatNumber}`, 0, 0);
          }

          ctx.restore();
        });
      }

      // 5. Draw Selection Handles & Rotation Anchor if Selected
      if (isSelected && !elem.isLocked) {
        ctx.save();
        ctx.translate(elem.x, elem.y);
        ctx.rotate((elem.rotation * Math.PI) / 180);

        const boundW = elem.type === 'round_table' ? (elem.radius || 60) * 2 + 50 : elem.width + 45;
        const boundH = elem.type === 'round_table' ? (elem.radius || 60) * 2 + 50 : elem.height + 45;

        // Bounding dash box
        ctx.strokeStyle = '#2D3748';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-boundW / 2, -boundH / 2, boundW, boundH);
        ctx.setLineDash([]);

        // Rotation Handle (top)
        const rotHandleY = -boundH / 2 - 25;
        ctx.beginPath();
        ctx.moveTo(0, -boundH / 2);
        ctx.lineTo(0, rotHandleY);
        ctx.strokeStyle = '#2D3748';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#2D3748';
        ctx.beginPath();
        ctx.arc(0, rotHandleY, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Corner Resize Handles
        const handles = [
          { x: -boundW / 2, y: -boundH / 2 },
          { x: boundW / 2, y: -boundH / 2 },
          { x: boundW / 2, y: boundH / 2 },
          { x: -boundW / 2, y: boundH / 2 },
        ];

        handles.forEach((h) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#2D3748';
          ctx.lineWidth = 1.5;
          ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
          ctx.strokeRect(h.x - 4, h.y - 4, 8, 8);
        });

        ctx.restore();
      }
    });

    // 6. Draw Scale Calibration Line if active
    if (isCalibratingScale && calibrationStart && calibrationCurrent) {
      ctx.save();
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 3]);

      ctx.beginPath();
      ctx.moveTo(calibrationStart.x, calibrationStart.y);
      ctx.lineTo(calibrationCurrent.x, calibrationCurrent.y);
      ctx.stroke();

      // End points
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.arc(calibrationStart.x, calibrationStart.y, 5, 0, 2 * Math.PI);
      ctx.arc(calibrationCurrent.x, calibrationCurrent.y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Distance tag
      const dx = calibrationCurrent.x - calibrationStart.x;
      const dy = calibrationCurrent.y - calibrationStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const midX = (calibrationStart.x + calibrationCurrent.x) / 2;
      const midY = (calibrationStart.y + calibrationCurrent.y) / 2;

      ctx.fillStyle = '#1E1E1E';
      ctx.fillRect(midX - 35, midY - 14, 70, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${dist.toFixed(0)} px`, midX, midY - 4);

      ctx.restore();
    }

    // Restore World Transformations
    ctx.restore();

    // 7. Draw Screen-Space Scale Legend in Bottom Left Corner
    if (scaleCalibration.isCalibrated) {
      ctx.save();
      const meterWidth = scaleCalibration.pixelsPerMeter * zoom; // pixels on screen for 1 meter
      const barMeters = meterWidth > 120 ? 1 : meterWidth > 40 ? 2 : 5;
      const barPixels = barMeters * scaleCalibration.pixelsPerMeter * zoom;

      const barX = 24;
      const barY = height - 28;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(barX - 8, barY - 18, barPixels + 16, 26);
      ctx.strokeStyle = '#D9CEBF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 8, barY - 18, barPixels + 16, 26);

      ctx.strokeStyle = '#2D2A26';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(barX, barY);
      ctx.lineTo(barX + barPixels, barY);
      // Ticks
      ctx.moveTo(barX, barY - 4);
      ctx.lineTo(barX, barY + 4);
      ctx.moveTo(barX + barPixels, barY - 4);
      ctx.lineTo(barX + barPixels, barY + 4);
      ctx.stroke();

      ctx.fillStyle = '#2D2A26';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${barMeters} m`, barX + barPixels / 2, barY - 4);

      ctx.restore();
    }

    ctx.restore();
  }, [
    elements,
    selectedElementId,
    hoveredElementId,
    hoveredSeat,
    pan.x,
    pan.y,
    zoom,
    canvasWidth,
    canvasHeight,
    backgroundOpacity,
    gridSize,
    scaleCalibration,
    isCalibratingScale,
    calibrationStart,
    calibrationCurrent,
    draggedGuest,
    getChairPositions,
  ]);

  const requestCanvasRender = useCallback(() => {
    requestAnimationFrame(renderCanvas);
  }, [renderCanvas]);

  const renderCanvasRef = useRef(renderCanvas);
  useEffect(() => {
    renderCanvasRef.current = renderCanvas;
  }, [renderCanvas]);

  // Handle Canvas Resizing with DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const newWidth = rect.width * dpr;
      const newHeight = rect.height * dpr;
      
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        requestAnimationFrame(() => {
          if (canvasRef.current) renderCanvasRef.current();
        });
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []); // Only run once on mount

  // Re-render on changes
  useEffect(() => {
    requestCanvasRender();
  }, [requestCanvasRender]);

  // Mouse / Pointer Event Listeners
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const world = screenToWorld(e.clientX, e.clientY);

    // Scale calibration mode
    if (isCalibratingScale) {
      if (!calibrationStart) {
        setCalibrationStart(world);
        setCalibrationCurrent(world);
      } else {
        // Complete line
        const dx = world.x - calibrationStart.x;
        const dy = world.y - calibrationStart.y;
        const pixelDist = Math.sqrt(dx * dx + dy * dy);
        setCalibrationStart(null);
        setCalibrationCurrent(null);
        if (pixelDist > 10) {
          onCalibrationLineDrawn(pixelDist);
        }
      }
      return;
    }

    // Check if clicked on chair
    for (const elem of elements) {
      if (elem.type === 'round_table' || elem.type === 'rectangular_table') {
        const chairs = getChairPositions(elem);
        for (const { seat, x, y } of chairs) {
          const dist = Math.hypot(world.x - x, world.y - y);
          if (dist <= 15) {
            onSelectElement(elem.id);
            if (onSeatClick) {
              onSeatClick(elem.id, seat, { x: e.clientX, y: e.clientY });
            }
            return;
          }
        }
      }
    }

    // Check if clicked on selected element rotation handle
    if (selectedElementId) {
      const elem = elements.find((el) => el.id === selectedElementId);
      if (elem && !elem.isLocked) {
        const boundH = elem.type === 'round_table' ? (elem.radius || 60) * 2 + 50 : elem.height + 45;
        const rotHandleY = -boundH / 2 - 25;

        const rad = (elem.rotation * Math.PI) / 180;
        const handleWorldX = elem.x - rotHandleY * Math.sin(rad);
        const handleWorldY = elem.y + rotHandleY * Math.cos(rad);

        if (Math.hypot(world.x - handleWorldX, world.y - handleWorldY) <= 16) {
          setActiveHandle('rotate');
          return;
        }
      }
    }

    // Check if clicked on element body
    const clickedElem = [...elements].reverse().find((elem) => {
      if (elem.type === 'round_table' || elem.type === 'cake_table') {
        const r = elem.radius || 60;
        return Math.hypot(world.x - elem.x, world.y - elem.y) <= r;
      } else {
        // Rotated box check
        const rad = (-elem.rotation * Math.PI) / 180;
        const dx = world.x - elem.x;
        const dy = world.y - elem.y;
        const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const localY = dx * Math.sin(rad) + dy * Math.cos(rad);
        return Math.abs(localX) <= elem.width / 2 && Math.abs(localY) <= elem.height / 2;
      }
    });

    if (clickedElem) {
      onSelectElement(clickedElem.id);
      if (!clickedElem.isLocked) {
        setDraggedElementId(clickedElem.id);
        setElementOffset({ x: world.x - clickedElem.x, y: world.y - clickedElem.y });
      }
    } else {
      // Empty space -> Pan canvas
      onSelectElement(null);
      setIsDraggingCanvas(true);
      setDragStartPos({ x: clientX - pan.x, y: clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const world = screenToWorld(e.clientX, e.clientY);

    // Calibration tool preview
    if (isCalibratingScale && calibrationStart) {
      setCalibrationCurrent(world);
      return;
    }

    // Rotate Handle dragging
    if (activeHandle === 'rotate' && selectedElementId) {
      const elem = elements.find((el) => el.id === selectedElementId);
      if (elem) {
        const angle = (Math.atan2(world.y - elem.y, world.x - elem.x) * 180) / Math.PI + 90;
        const normalized = (Math.round(angle) + 360) % 360;
        onUpdateElement(elem.id, { rotation: normalized });
      }
      return;
    }

    // Element dragging
    if (draggedElementId) {
      let targetX = world.x - elementOffset.x;
      let targetY = world.y - elementOffset.y;

      if (gridSnap) {
        targetX = Math.round(targetX / gridSize) * gridSize;
        targetY = Math.round(targetY / gridSize) * gridSize;
      }

      onUpdateElement(draggedElementId, { x: targetX, y: targetY });
      return;
    }

    // Canvas panning
    if (isDraggingCanvas) {
      setPan({
        x: clientX - dragStartPos.x,
        y: clientY - dragStartPos.y,
      });
      return;
    }

    // Chair hover detection
    let foundSeat: { elementId: string; seat: FloorPlanSeat; x: number; y: number } | null = null;
    let foundElemId: string | null = null;

    for (const elem of elements) {
      if (elem.type === 'round_table' || elem.type === 'rectangular_table') {
        const chairs = getChairPositions(elem);
        for (const { seat, x, y } of chairs) {
          if (Math.hypot(world.x - x, world.y - y) <= 15) {
            foundSeat = { elementId: elem.id, seat, x, y };
            break;
          }
        }
      }
      if (foundSeat) break;

      // Element body hover check
      if (elem.type === 'round_table' || elem.type === 'cake_table') {
        if (Math.hypot(world.x - elem.x, world.y - elem.y) <= (elem.radius || 60)) {
          foundElemId = elem.id;
        }
      } else {
        const rad = (-elem.rotation * Math.PI) / 180;
        const dx = world.x - elem.x;
        const dy = world.y - elem.y;
        const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const localY = dx * Math.sin(rad) + dy * Math.cos(rad);
        if (Math.abs(localX) <= elem.width / 2 && Math.abs(localY) <= elem.height / 2) {
          foundElemId = elem.id;
        }
      }
    }

    setHoveredSeat(foundSeat);
    setHoveredElementId(foundElemId);
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedElementId(null);
    setActiveHandle(null);
  };

  // Drag & Drop from Guest Sidebar onto Canvas
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    const world = screenToWorld(e.clientX, e.clientY);
    let foundSeat: { elementId: string; seat: FloorPlanSeat; x: number; y: number } | null = null;

    for (const elem of elements) {
      if (elem.type === 'round_table' || elem.type === 'rectangular_table') {
        const chairs = getChairPositions(elem);
        for (const { seat, x, y } of chairs) {
          if (Math.hypot(world.x - x, world.y - y) <= 22) {
            foundSeat = { elementId: elem.id, seat, x, y };
            break;
          }
        }
      }
      if (foundSeat) break;
    }
    setHoveredSeat(foundSeat);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const guestDataStr = e.dataTransfer.getData('application/json');
    if (!guestDataStr) return;

    try {
      const guest: Guest = JSON.parse(guestDataStr);
      const world = screenToWorld(e.clientX, e.clientY);

      for (const elem of elements) {
        if (elem.type === 'round_table' || elem.type === 'rectangular_table') {
          const chairs = getChairPositions(elem);
          for (const { seat, x, y } of chairs) {
            if (Math.hypot(world.x - x, world.y - y) <= 24) {
              onAssignGuestToSeat(elem.id, seat.id, guest);
              setHoveredSeat(null);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error al soltar invitado en el canvas:', err);
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setZoom((prevZoom) => {
      const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.2), 4.0);
      const scaleChange = nextZoom / prevZoom;

      setPan((prevPan) => ({
        x: mouseX - (mouseX - prevPan.x) * scaleChange,
        y: mouseY - (mouseY - prevPan.y) * scaleChange,
      }));

      return nextZoom;
    });
  };

  // Tooltip screen position for hovered chair
  const hoveredSeatScreenPos = hoveredSeat ? worldToScreen(hoveredSeat.x, hoveredSeat.y) : null;

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative w-full h-full bg-[#FAF8F5] overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full block"
      />

      {/* Interactive Tooltip on Chair Hover */}
      {hoveredSeat && hoveredSeatScreenPos && (
        <div
          style={{
            left: `${hoveredSeatScreenPos.x}px`,
            top: `${hoveredSeatScreenPos.y - 18}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-30 pointer-events-none bg-[#2D2A26] text-[#2D3748] p-2.5 rounded-xl shadow-xl border border-stone-700 text-xs min-w-[170px] max-w-[240px] animate-in fade-in zoom-in-95 duration-150"
        >
          {hoveredSeat.seat.guestId ? (
            <>
              <div className="border-b border-stone-700/80 pb-1.5 mb-1.5">
                <p className="font-bold text-white truncate text-[12px]">{hoveredSeat.seat.guestName}</p>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-amber-400">Asiento #{hoveredSeat.seat.seatNumber}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md">
                  Asignado
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between font-bold border-b border-stone-700/80 pb-1.5 mb-1.5">
                <span className="text-amber-400">Asiento #{hoveredSeat.seat.seatNumber}</span>
                <span className="text-[10px] text-stone-400">
                  Disponible
                </span>
              </div>
              <p className="text-[10px] text-stone-300">
                Toca o haz clic en un asiento para asignar.
              </p>
            </>
          )}
        </div>
      )}

      {/* Scale Calibration Guide Banner */}
      {isCalibratingScale && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] px-4 py-2 rounded-full shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] border border-amber-300 flex items-center space-x-2 text-xs font-semibold animate-pulse">
          <span>📏 Toca o haz clic en el punto inicial y luego en el final de una pared o medida conocida</span>
        </div>
      )}
    </div>
  );
};
