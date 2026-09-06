import { FurnitureSVGs } from './FurniturePaths';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  FloorPlanElement,
  FloorPlanSeat,
  Guest,
  FloorPlanScaleCalibration
} from '../../types';
import { checkFloorPlanElementCapacityForGroup, isColorDark, getContrastTextColor } from './floorPlanSyncUtils';
import { Lock, Unlock } from 'lucide-react';

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
  canvasBackgroundColor?: string;
  canvasRotation?: number;
  draggedGuest: Guest | null;
  guests?: Guest[];
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
  canvasBackgroundColor = '#EBEBEB',
  backgroundImageUrl,
  backgroundOpacity = 0.85,
  draggedGuest,
  guests,
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

      const headSeatsRaw = elem.seatsHead !== undefined ? elem.seatsHead : 1;
      const headSeats = Math.abs(headSeatsRaw);
      const isOneSideOnly = headSeatsRaw < 0;
      
      const longSeatsRaw = elem.seatsLongSide !== undefined ? elem.seatsLongSide : (Math.floor((count - (isOneSideOnly ? headSeats : headSeats * 2)) / 2) || 3);
      const isOneSideLong = longSeatsRaw < 0;
      const longSeats = Math.abs(longSeatsRaw);

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

      // Right Head (Only if not one-side only)
      if (headSeats > 0 && !isOneSideOnly && seatIdx < count) {
        for (let i = 1; i <= headSeats && seatIdx < count; i++) {
          const localX = w / 2 + 20;
          const localY = -h / 2 + (i * h) / (headSeats + 1);
          const pt = rotatePoint(localX, localY);
          chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI / 2 });
          seatIdx++;
        }
      }

      // Bottom Side (Only if not one-side long)
      const botSpacing = w / (longSeats + 1);
      if (!isOneSideLong) {
        for (let i = longSeats; i >= 1 && seatIdx < count; i--) {
        const localX = -w / 2 + i * botSpacing;
        const localY = h / 2 + 20;
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI });
        seatIdx++;
        }
      }

      // Left Head (Always render if headSeats > 0, this is the "start" side where numbering technically starts geometrically on the left)
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
    ctx.fillStyle = '#EBEBEB';
    ctx.fillRect(0, 0, width, height);

    // Apply World Transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.translate(width / 2, height / 2);
    ctx.rotate((canvasRotation || 0) * Math.PI / 180);
    ctx.translate(-width / 2, -height / 2);
    ctx.scale(zoom, zoom);

    // 1. Draw Canvas Work Area Surface & Background
    const bgColor = canvasBackgroundColor || '#EBEBEB';
    const isDarkBg = isColorDark(bgColor);

    // Canvas work area surface:
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Outline around the canvas sheet
    ctx.strokeStyle = isDarkBg ? 'rgba(255, 255, 255, 0.3)' : '#D1D1D1';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // Draw PDF Background / Blueprint image if present
    if (bgImageRef.current) {
      ctx.save();
      ctx.globalAlpha = backgroundOpacity;
      ctx.drawImage(bgImageRef.current, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }

    // 2. Draw Grid Lines
    const step = gridSize || 40;
    ctx.save();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = isDarkBg ? 'rgba(255, 255, 255, 0.18)' : 'rgba(180, 180, 180, 0.25)';
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
      ctx.strokeStyle = 'rgba(120, 120, 120, 0.2)';
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

      const surfaceColor = elem.color === '#FFFFFF' || !elem.color ? '#EBEBEB' : elem.color;

      // Render by Type
      switch (elem.type) {
        case 'round_table': {
          const r = elem.radius || 60;

          // Neumorphic double-pass shadow (raised)
          // 1. Light shadow (top-left)
          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -6;
          ctx.shadowOffsetY = -6;
          ctx.shadowBlur = 12;
          ctx.fillStyle = surfaceColor;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();

          // 2. Dark shadow (bottom-right)
          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 6;
          ctx.shadowOffsetY = 6;
          ctx.shadowBlur = 12;
          ctx.fillStyle = surfaceColor;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();

          // Table Border
          ctx.strokeStyle = isSelected ? '#1F2937' : isHovered ? '#9CA3AF' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.stroke();

          // Table Center Label
          const effectiveRoundTextColor = elem.textColor || getContrastTextColor(surfaceColor);
          ctx.fillStyle = effectiveRoundTextColor;
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || `Mesa ${elem.tableNumber || ''}`, 0, -6);

          // Seat capacity badge
          const assignedCount = elem.seats.filter((s) => s.guestId).length;
          ctx.fillStyle = isColorDark(surfaceColor) || effectiveRoundTextColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.75)' : '#6B7280';
          ctx.font = '10px system-ui, sans-serif';
          ctx.fillText(`${assignedCount}/${elem.seats.length} pers.`, 0, 10);
          break;
        }

        case 'rectangular_table': {
          const w = elem.width;
          const h = elem.height;

          // Neumorphic double-pass shadow (raised)
          // 1. Light shadow (top-left)
          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -6;
          ctx.shadowOffsetY = -6;
          ctx.shadowBlur = 12;
          ctx.fillStyle = surfaceColor;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.fill();
          ctx.restore();

          // 2. Dark shadow (bottom-right)
          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 6;
          ctx.shadowOffsetY = 6;
          ctx.shadowBlur = 12;
          ctx.fillStyle = surfaceColor;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.fill();
          ctx.restore();

          // Table Border
          ctx.strokeStyle = isSelected ? '#1F2937' : isHovered ? '#9CA3AF' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.stroke();

          // Label
          const effectiveRectTextColor = elem.textColor || getContrastTextColor(surfaceColor);
          ctx.fillStyle = effectiveRectTextColor;
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || `Mesa ${elem.tableNumber || ''}`, 0, -5);

          const assignedCount = elem.seats.filter((s) => s.guestId).length;
          ctx.fillStyle = isColorDark(surfaceColor) || effectiveRectTextColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.75)' : '#6B7280';
          ctx.font = '10px system-ui, sans-serif';
          ctx.fillText(`${assignedCount}/${elem.seats.length} pers.`, 0, 10);
          break;
        }

        case 'stage': {
          const w = elem.width;
          const h = elem.height;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#374151';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#374151';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#FBBF24' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || getContrastTextColor(elem.color || '#374151');
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🎤 ${elem.name || 'ESCENARIO'}`, 0, 0);
          break;
        }

        case 'dance_floor': {
          const w = elem.width;
          const h = elem.height;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#E8E4DF';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#E8E4DF';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || getContrastTextColor(elem.color || '#E8E4DF');
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`✨ ${elem.name || 'PISTA DE BAILE'}`, 0, 0);
          break;
        }

        case 'bar': {
          const w = elem.width;
          const h = elem.height;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#4A3E3D';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#4A3E3D';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#E5B869' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || (isColorDark(elem.color || '#4A3E3D') ? '#FDE68A' : '#78350F');
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🍸 ${elem.name || 'BARRA DE BAR'}`, 0, 0);
          break;
        }

        case 'dj_booth': {
          const w = elem.width;
          const h = elem.height;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#1F2937';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#1F2937';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#60A5FA' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || (isColorDark(elem.color || '#1F2937') ? '#93C5FD' : '#1E40AF');
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🎧 ${elem.name || 'CABINA DJ'}`, 0, 0);
          break;
        }

        case 'restrooms': {
          const w = elem.width;
          const h = elem.height;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#E2E8F0';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#E2E8F0';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || getContrastTextColor(elem.color || '#E2E8F0');
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🚻 ${elem.name || 'BAÑOS'}`, 0, 0);
          break;
        }

        case 'entrance': {
          const w = elem.width;
          const h = elem.height;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#FEF3C7';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#FEF3C7';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || (isColorDark(elem.color || '#FEF3C7') ? '#FEF08A' : '#92400E');
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🚪 ${elem.name || 'ENTRADA'} ➜`, 0, 0);
          break;
        }

        case 'cake_table': {
          const r = elem.radius || 35;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#FFE4E6';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#FFE4E6';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || (isColorDark(elem.color || '#FFE4E6') ? '#FECDD3' : '#9F1239');
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🎂 ${elem.name || 'TORTA'}`, 0, 0);
          break;
        }

        case 'lounge': {
          const w = elem.width;
          const h = elem.height;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#EDE9FE';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#EDE9FE';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 14);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || (isColorDark(elem.color || '#EDE9FE') ? '#DDD6FE' : '#5B21B6');
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🛋️ ${elem.name || 'LOUNGE'}`, 0, 0);
          break;
        }

        case 'photo_booth': {
          const w = elem.width;
          const h = elem.height;

          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowOffsetX = -5;
          ctx.shadowOffsetY = -5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#E0F2FE';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 10;
          ctx.fillStyle = elem.color || '#E0F2FE';
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.stroke();

          ctx.fillStyle = elem.textColor || (isColorDark(elem.color || '#E0F2FE') ? '#BAE6FD' : '#0369A1');
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`📸 ${elem.name || 'CABINA'}`, 0, 0);
          break;
        }

        case 'rug': {
          const w = elem.width;
          const h = elem.height;
          const rugColor = elem.color || '#DC2626';

          // 1. Soft Shadow
          ctx.save();
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          ctx.shadowBlur = 8;
          ctx.fillStyle = rugColor;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 6);
          ctx.fill();
          ctx.restore();

          // 2. Decorative carpet inner border (stitching / frame)
          ctx.save();
          ctx.strokeStyle = isColorDark(rugColor) ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.25)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([5, 4]);
          const inset = 7;
          if (w > inset * 2 && h > inset * 2) {
            ctx.beginPath();
            ctx.roundRect(-w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, 3);
            ctx.stroke();
          }
          ctx.restore();

          // 3. Fringe detail at the ends (fringes / flecos de alfombra)
          ctx.save();
          ctx.strokeStyle = isColorDark(rugColor) ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.35)';
          ctx.lineWidth = 1;
          const fringeCount = Math.min(12, Math.floor(h / 6));
          const stepY = h / (fringeCount + 1);
          for (let i = 1; i <= fringeCount; i++) {
            const fy = -h / 2 + i * stepY;
            // Left fringe
            ctx.beginPath();
            ctx.moveTo(-w / 2, fy);
            ctx.lineTo(-w / 2 - 3.5, fy);
            ctx.stroke();
            // Right fringe
            ctx.beginPath();
            ctx.moveTo(w / 2, fy);
            ctx.lineTo(w / 2 + 3.5, fy);
            ctx.stroke();
          }
          ctx.restore();

          // 4. Outer border (highlighted if selected)
          ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 6);
          ctx.stroke();

          // 5. Name Label
          const effectiveTextColor = elem.textColor || (isColorDark(rugColor) ? '#FFFFFF' : '#1F2937');
          ctx.fillStyle = effectiveTextColor;
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || 'ALFOMBRA', 0, 0);
          break;
        }

        case 'single_chair':
        case 'chair_row': {
          const count = elem.type === 'single_chair' ? 1 : (elem.chairCount || 4);
          const chairW = elem.width / count;
          const svgData = FurnitureSVGs.single_chair;
          
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          ctx.shadowBlur = 6;
          
          for (let i = 0; i < count; i++) {
            const cx = -elem.width / 2 + (i * chairW) + (chairW / 2);
            const w = chairW - 4;
            const h = elem.height - 4;
            
            ctx.save();
            ctx.translate(cx, 0);
            
            const scaleX = w / svgData.width;
            const scaleY = h / svgData.height;
            ctx.scale(scaleX, scaleY);
            ctx.translate(-svgData.width / 2, -svgData.height / 2);
            
            const p = new Path2D(svgData.path);
            ctx.fillStyle = surfaceColor;
            ctx.fill(p, 'evenodd');
            ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.5 / Math.min(scaleX, scaleY); 
            ctx.stroke(p);
            
            ctx.restore();
          }
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || getContrastTextColor(surfaceColor);
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
          
          ctx.shadowColor = '#d1d1d1';
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          ctx.shadowBlur = 6;
          
          ctx.fillStyle = elem.color || '#E5E7EB';
          ctx.strokeStyle = isSelected ? '#1F2937' : 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1.5;
          
          for (let i = 0; i < count; i++) {
            const cx = -elem.width / 2 + (i * seatW) + (seatW / 2);
            const w = seatW - (count > 1 ? 0 : 4);
            const h = elem.height - 4;
            const x = cx - w / 2;
            const y = -elem.height / 2 + 2;
            
            if (isLuisXV) {
              ctx.beginPath();
              ctx.moveTo(x + w*0.1, y + h*0.4);
              ctx.quadraticCurveTo(x + w/2, y - h*0.2, x + w*0.9, y + h*0.4);
              ctx.lineTo(x + w*0.8, y + h);
              ctx.lineTo(x + w*0.2, y + h);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              
              ctx.beginPath();
              ctx.ellipse(cx, y + h*0.6, w*0.4, h*0.3, 0, 0, 2*Math.PI);
              ctx.fill();
              ctx.stroke();
              
              ctx.beginPath();
              ctx.ellipse(x + w*0.15, y + h*0.5, w*0.1, h*0.2, 0, 0, 2*Math.PI);
              ctx.ellipse(x + w*0.85, y + h*0.5, w*0.1, h*0.2, 0, 0, 2*Math.PI);
              ctx.fill();
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.roundRect(x, y, w, h, 8);
              ctx.fill();
              ctx.stroke();
              
              ctx.beginPath();
              ctx.roundRect(x + w*0.1, y + h*0.2, w*0.8, h*0.7, 4);
              ctx.fill();
              ctx.stroke();
              
              if (i === 0) {
                ctx.beginPath();
                ctx.roundRect(x, y + h*0.1, w*0.15, h*0.8, 4);
                ctx.fill();
                ctx.stroke();
              }
              if (i === count - 1) {
                ctx.beginPath();
                ctx.roundRect(x + w*0.85, y + h*0.1, w*0.15, h*0.8, 4);
                ctx.fill();
                ctx.stroke();
              }
            }
          }
          
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || getContrastTextColor(elem.color || '#E5E7EB');
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = isLuisXV ? '⚜️' : '🛋️';
          ctx.fillText(elem.name ? `${icon} ${elem.name}` : icon, 0, 0);
          break;
        }
        case 'text_label': {
          ctx.fillStyle = elem.textColor || '#1F2937';
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
            const capacityCheck = guests
              ? checkFloorPlanElementCapacityForGroup(elem, draggedGuest, guests)
              : { canFit: true };

            ctx.strokeStyle = capacityCheck.canFit ? '#22C55E' : '#EF4444';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(0, 0, chairRadius + 4, 0, 2 * Math.PI);
            ctx.stroke();
          }

          // Chair Neumorphic Surface & Shadow
          ctx.save();
          if (isAssigned) {
            // Assigned chair: soft dark slate with subtle shadow
            ctx.shadowColor = '#c0c0c0';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;
            ctx.fillStyle = isSeatHovered ? '#111827' : '#374151';
            ctx.beginPath();
            ctx.arc(0, 0, chairRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
          } else {
            // Unassigned chair: raised neumorphic circle
            ctx.shadowColor = '#ffffff';
            ctx.shadowOffsetX = -2;
            ctx.shadowOffsetY = -2;
            ctx.shadowBlur = 4;
            ctx.fillStyle = isSeatHovered ? '#FFFFFF' : '#EBEBEB';
            ctx.beginPath();
            ctx.arc(0, 0, chairRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.shadowColor = '#d1d1d1';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;
            ctx.fillStyle = isSeatHovered ? '#FFFFFF' : '#EBEBEB';
            ctx.beginPath();
            ctx.arc(0, 0, chairRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
          }

          // Subtle chair border
          ctx.strokeStyle = isAssigned ? '#1F2937' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1;
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
            ctx.fillStyle = '#6B7280';
            ctx.font = 'bold 8.5px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${seat.seatNumber}`, 0, 0);
          }

          ctx.restore();
        });
      }

      // 5. Draw Selection Handles & Rotation Anchor if Selected
      if (isSelected) {
        ctx.save();
        ctx.translate(elem.x, elem.y);
        ctx.rotate((elem.rotation * Math.PI) / 180);

        const boundW = elem.type === 'round_table' ? (elem.radius || 60) * 2 + 50 : elem.width + 45;
        const boundH = elem.type === 'round_table' ? (elem.radius || 60) * 2 + 50 : elem.height + 45;

        if (elem.isLocked) {
          // Bounding dash box in amber for locked item
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(-boundW / 2, -boundH / 2, boundW, boundH);
          ctx.setLineDash([]);

          // Lock badge in top-right corner of selection box
          const badgeX = boundW / 2;
          const badgeY = -boundH / 2;
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = '#FEF3C7';
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 11, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Padlock body
          ctx.fillStyle = '#B45309';
          ctx.beginPath();
          ctx.rect(badgeX - 4, badgeY - 1, 8, 7);
          ctx.fill();

          // Padlock shackle
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY - 2, 3, Math.PI, 0);
          ctx.stroke();
        } else {
          // Normal bounding dash box
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
        }

        ctx.restore();
      } else if (elem.isLocked) {
        // Even when unselected, display a small lock badge in upper-right
        ctx.save();
        ctx.translate(elem.x, elem.y);
        ctx.rotate((elem.rotation * Math.PI) / 180);

        const boundW = elem.type === 'round_table' ? (elem.radius || 60) * 2 : elem.width;
        const boundH = elem.type === 'round_table' ? (elem.radius || 60) * 2 : elem.height;
        const badgeX = boundW / 2;
        const badgeY = -boundH / 2;

        ctx.fillStyle = '#FEF3C7';
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#B45309';
        ctx.fillRect(badgeX - 3, badgeY - 1, 6, 5);
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY - 1.5, 2.2, Math.PI, 0);
        ctx.stroke();

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

      // 1. Check if dropped directly on a chair
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

      // 2. Check if dropped on the table body itself
      for (const elem of elements) {
        if (elem.type === 'round_table') {
          const r = (elem.radius || 40) + 20;
          if (Math.hypot(world.x - elem.x, world.y - elem.y) <= r) {
            const seats = elem.seats || [];
            const targetSeat = seats.find((s) => !s.guestId) || seats[0];
            if (targetSeat) {
              onAssignGuestToSeat(elem.id, targetSeat.id, guest);
              setHoveredSeat(null);
              return;
            }
          }
        } else if (elem.type === 'rectangular_table') {
          const halfW = (elem.width || 120) / 2 + 20;
          const halfH = (elem.height || 60) / 2 + 20;
          if (Math.abs(world.x - elem.x) <= halfW && Math.abs(world.y - elem.y) <= halfH) {
            const seats = elem.seats || [];
            const targetSeat = seats.find((s) => !s.guestId) || seats[0];
            if (targetSeat) {
              onAssignGuestToSeat(elem.id, targetSeat.id, guest);
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
  const selectedElem = elements.find((el) => el.id === selectedElementId);
  const selectedElemScreenPos = selectedElem ? worldToScreen(selectedElem.x, selectedElem.y) : null;

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative w-full h-full bg-[#EBEBEB] overflow-hidden select-none cursor-grab active:cursor-grabbing"
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
          className="absolute z-30 pointer-events-none bg-[#EBEBEB] text-gray-800 p-3 rounded-2xl shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-xs min-w-[170px] max-w-[240px] animate-in fade-in zoom-in-95 duration-150"
        >
          {hoveredSeat.seat.guestId ? (
            <>
              <div className="pb-1.5 mb-1.5 border-b border-gray-300">
                <p className="font-bold text-gray-900 truncate text-[12px]">{hoveredSeat.seat.guestName}</p>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-gray-700">Asiento #{hoveredSeat.seat.seatNumber}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                  Asignado
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between font-bold pb-1.5 mb-1.5 border-b border-gray-300">
                <span className="text-gray-700">Asiento #{hoveredSeat.seat.seatNumber}</span>
                <span className="text-[10px] text-gray-500 font-semibold">
                  Disponible
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                Toca o haz clic en un asiento para asignar.
              </p>
            </>
          )}
        </div>
      )}

      {/* Interactive Quick-Action Lock/Unlock Pill directly on Canvas when an element is selected */}
      {selectedElem && selectedElemScreenPos && (
        <div
          style={{
            left: `${selectedElemScreenPos.x}px`,
            top: `${
              selectedElemScreenPos.y -
              (selectedElem.type === 'round_table'
                ? ((selectedElem.radius || 60) + 36) * zoom
                : (selectedElem.height / 2 + 36) * zoom)
            }px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-30 pointer-events-auto flex items-center space-x-1 p-1 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-xs transition-all select-none"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateElement(selectedElem.id, { isLocked: !selectedElem.isLocked });
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
              selectedElem.isLocked
                ? 'bg-[#EBEBEB] text-amber-800 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:bg-amber-100/50'
                : 'bg-[#EBEBEB] text-gray-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
            }`}
            title={
              selectedElem.isLocked
                ? 'Objeto bloqueado. Haz clic para desbloquearlo y poder moverlo o editarlo'
                : 'Haz clic para bloquear el objeto y evitar que se mueva o cambie de propiedades'
            }
          >
            {selectedElem.isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Bloqueado</span>
                <span className="text-[10px] text-amber-700 font-normal pl-0.5">(clic para liberar)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>Bloquear</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Scale Calibration Guide Banner */}
      {isCalibratingScale && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#EBEBEB] text-gray-800 px-5 py-2.5 rounded-full shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center space-x-2 text-xs font-semibold animate-pulse">
          <span>📏 Toca o haz clic en el punto inicial y luego en el final de una pared o medida conocida</span>
        </div>
      )}
    </div>
  );
};
