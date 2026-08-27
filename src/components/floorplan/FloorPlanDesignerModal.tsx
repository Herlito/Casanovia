import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Save,
  FileDown,
  Upload,
  Ruler,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Magnet,
  RotateCcw,
  Sparkles,
  Server,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Info,
  Layers,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import {
  FloorPlanElement,
  FloorPlanElementType,
  FloorPlanSeat,
  Guest,
  WeddingFloorPlan,
  WeddingTable,
} from '../../types';
import { FloorPlanCanvas } from './FloorPlanCanvas';
import { FloorPlanToolbar } from './FloorPlanToolbar';
import { FloorPlanGuestSidebar } from './FloorPlanGuestSidebar';
import { FloorPlanPhpSqlModal } from './FloorPlanPhpSqlModal';
import { renderPdfFirstPageToImage } from '../../lib/pdfUtils';
import { exportFloorPlanToPdf } from './FloorPlanExportPdf';
import { buildFloorPlanFromWedding, buildTableSeats, extractTableNumber } from './floorPlanSyncUtils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cleanFirestoreData } from '../../lib/firestoreUtils';

interface FloorPlanDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloorPlanDesignerModal: React.FC<FloorPlanDesignerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeWeddingId,
    activeWedding,
    weddings,
    setActiveWeddingId,
    guests,
    tables,
    settings,
    isLevel1Admin,
  } = useWedding();

  // Floor plan layout state
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | undefined>(undefined);
  const [backgroundFileName, setBackgroundFileName] = useState<string | undefined>(undefined);
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.85);

  // Canvas Viewport State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(30);
  const [canvasWidth, setCanvasWidth] = useState<number>(1600);
  const [canvasHeight, setCanvasHeight] = useState<number>(1200);

  // Scale Calibration State
  const [scaleCalibration, setScaleCalibration] = useState({
    isCalibrated: false,
    pixelDistance: 50,
    realMeters: 1.0,
    pixelsPerMeter: 50.0,
  });
  const [isCalibratingScale, setIsCalibratingScale] = useState<boolean>(false);
  const [showCalibrationPrompt, setShowCalibrationPrompt] = useState<boolean>(false);
  const [tempDrawnPixelDist, setTempDrawnPixelDist] = useState<number>(0);
  const [calibrationRealMetersInput, setCalibrationRealMetersInput] = useState<string>('5.0');

  // Interactive Drag & Modal states
  const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);
  const [showPhpSqlModal, setShowPhpSqlModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [syncSuccessNotice, setSyncSuccessNotice] = useState<boolean>(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Seat Click Picker popup
  const [activeSeatPicker, setActiveSeatPicker] = useState<{
    elementId: string;
    seat: FloorPlanSeat;
    screenPos: { x: number; y: number };
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial floor plan from Firestore or LocalStorage for active wedding, syncing with wedding tables & guests
  useEffect(() => {
    if (!isOpen || !activeWeddingId) return;

    let isMounted = true;

    const loadPlan = async () => {
      try {
        // Try Firestore
        const docRef = doc(db, 'floor_plans', activeWeddingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && isMounted) {
          const data = docSnap.data() as WeddingFloorPlan;
          // Synchronize seats and tables with current wedding data
          const syncedElements = buildFloorPlanFromWedding(tables, guests, data.elements);
          setElements(syncedElements);
          if (data.backgroundImageUrl) setBackgroundImageUrl(data.backgroundImageUrl);
          if (data.backgroundFileName) setBackgroundFileName(data.backgroundFileName);
          if (data.backgroundOpacity !== undefined) setBackgroundOpacity(data.backgroundOpacity);
          if (data.scale) setScaleCalibration(data.scale);
          if (data.gridSnap !== undefined) setGridSnap(data.gridSnap);
          if (data.gridSize) setGridSize(data.gridSize);
          if (data.canvasWidth) setCanvasWidth(data.canvasWidth);
          if (data.canvasHeight) setCanvasHeight(data.canvasHeight);
          return;
        }
      } catch (err) {
        console.info('[FloorPlan] Firestore read note (using local fallback):', err);
      }

      // Try Local Storage fallback
      try {
        const localData = localStorage.getItem(`casanovia_floor_plan_${activeWeddingId}`);
        if (localData && isMounted) {
          const parsed: WeddingFloorPlan = JSON.parse(localData);
          const syncedElements = buildFloorPlanFromWedding(tables, guests, parsed.elements);
          setElements(syncedElements);
          if (parsed.backgroundImageUrl) setBackgroundImageUrl(parsed.backgroundImageUrl);
          if (parsed.backgroundFileName) setBackgroundFileName(parsed.backgroundFileName);
          if (parsed.scale) setScaleCalibration(parsed.scale);
        } else if (isMounted) {
          // Generate initial layout taking the current wedding tables and guest assignments
          const initialLayout = buildFloorPlanFromWedding(tables, guests);
          setElements(initialLayout);
        }
      } catch {
        if (isMounted) {
          const initialLayout = buildFloorPlanFromWedding(tables, guests);
          setElements(initialLayout);
        }
      }
    };

    loadPlan();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeWeddingId, tables, guests]);

  const selectedElement = useMemo(
    () => elements.find((e) => e.id === selectedElementId) || null,
    [elements, selectedElementId]
  );

  if (!isOpen) return null;

  const weddingTitle =
    activeWedding?.title ||
    settings.coupleNames ||
    `${settings.brideName || ''} & ${settings.groomName || ''}`.trim() ||
    'Boda Actual';

  // Add Element to Canvas
  const handleAddElement = (type: FloorPlanElementType) => {
    const newId = `elem_${type}_${Date.now()}`;
    const nextTableNumber =
      elements.filter((e) => e.type === 'round_table' || e.type === 'rectangular_table').length + 1;

    let newElem: FloorPlanElement;

    // Viewport center spawn
    const spawnX = -pan.x / zoom + 400;
    const spawnY = -pan.y / zoom + 300;

    switch (type) {
      case 'round_table':
        newElem = {
          id: newId,
          type: 'round_table',
          name: `Mesa ${nextTableNumber}`,
          tableNumber: nextTableNumber,
          x: spawnX,
          y: spawnY,
          width: 130,
          height: 130,
          radius: 65,
          rotation: 0,
          seatCount: 8,
          seats: Array.from({ length: 8 }, (_, i) => ({
            id: `seat_${newId}_${i + 1}`,
            seatNumber: i + 1,
          })),
          color: '#FFFFFF',
          zIndex: 10,
        };
        break;

      case 'rectangular_table':
        newElem = {
          id: newId,
          type: 'rectangular_table',
          name: `Mesa Imperial ${nextTableNumber}`,
          tableNumber: nextTableNumber,
          x: spawnX,
          y: spawnY,
          width: 220,
          height: 90,
          rotation: 0,
          seatsLongSide: 4,
          seatsHead: 1,
          seatCount: 10,
          seats: Array.from({ length: 10 }, (_, i) => ({
            id: `seat_${newId}_${i + 1}`,
            seatNumber: i + 1,
          })),
          color: '#FFFFFF',
          zIndex: 10,
        };
        break;

      case 'stage':
        newElem = {
          id: newId,
          type: 'stage',
          name: 'Escenario',
          x: spawnX,
          y: spawnY,
          width: 260,
          height: 80,
          rotation: 0,
          seats: [],
          color: '#2D2A26',
          zIndex: 5,
        };
        break;

      case 'dance_floor':
        newElem = {
          id: newId,
          type: 'dance_floor',
          name: 'Pista de Baile',
          x: spawnX,
          y: spawnY,
          width: 240,
          height: 160,
          rotation: 0,
          seats: [],
          color: '#F0E6D2',
          zIndex: 2,
        };
        break;

      case 'bar':
        newElem = {
          id: newId,
          type: 'bar',
          name: 'Barra de Bar',
          x: spawnX,
          y: spawnY,
          width: 180,
          height: 60,
          rotation: 0,
          seats: [],
          color: '#3D2B1F',
          zIndex: 5,
        };
        break;

      case 'dj_booth':
        newElem = {
          id: newId,
          type: 'dj_booth',
          name: 'Cabina DJ',
          x: spawnX,
          y: spawnY,
          width: 120,
          height: 60,
          rotation: 0,
          seats: [],
          color: '#1A202C',
          zIndex: 5,
        };
        break;

      case 'cake_table':
        newElem = {
          id: newId,
          type: 'cake_table',
          name: 'Mesa de Torta',
          x: spawnX,
          y: spawnY,
          width: 80,
          height: 80,
          radius: 40,
          rotation: 0,
          seats: [],
          color: '#FFF1F2',
          zIndex: 8,
        };
        break;

      case 'lounge':
        newElem = {
          id: newId,
          type: 'lounge',
          name: 'Zona Lounge',
          x: spawnX,
          y: spawnY,
          width: 180,
          height: 120,
          rotation: 0,
          seats: [],
          color: '#EDE9FE',
          zIndex: 3,
        };
        break;

      case 'entrance':
        newElem = {
          id: newId,
          type: 'entrance',
          name: 'Entrada Principal',
          x: spawnX,
          y: spawnY,
          width: 140,
          height: 50,
          rotation: 0,
          seats: [],
          color: '#FEF3C7',
          zIndex: 4,
        };
        break;

      case 'photo_booth':
        newElem = {
          id: newId,
          type: 'photo_booth',
          name: 'Cabina Fotográfica',
          x: spawnX,
          y: spawnY,
          width: 130,
          height: 80,
          rotation: 0,
          seats: [],
          color: '#E0F2FE',
          zIndex: 4,
        };
        break;

      default:
        newElem = {
          id: newId,
          type: 'text_label',
          name: 'Zona de Recepción',
          x: spawnX,
          y: spawnY,
          width: 120,
          height: 40,
          rotation: 0,
          seats: [],
          zIndex: 1,
        };
        break;
    }

    setElements((prev) => [...prev, newElem]);
    setSelectedElementId(newId);
  };

  const handleAddTableFromWedding = (table: WeddingTable) => {
    // Check if element already exists on canvas
    const existing = elements.find(
      (e) =>
        e.id === `elem_table_${table.id}` ||
        (e.name && e.name.trim().toLowerCase() === table.name.trim().toLowerCase())
    );
    if (existing) {
      setSelectedElementId(existing.id);
      setPan({
        x: -existing.x * zoom + 400,
        y: -existing.y * zoom + 300,
      });
      return;
    }

    const isRect =
      table.shape === 'rectangular' ||
      table.shape === 'imperial' ||
      table.shape === 'square';
    const elemId = `elem_table_${table.id || Date.now()}`;
    const tNum = extractTableNumber(table.name) || (elements.filter((e) => e.type === 'round_table' || e.type === 'rectangular_table').length + 1);

    const { seats, seatCount } = buildTableSeats(
      elemId,
      table.name,
      tNum,
      table.capacity || 10,
      guests
    );

    const spawnX = Math.round(-pan.x / zoom + 380 + (Math.random() * 40 - 20));
    const spawnY = Math.round(-pan.y / zoom + 280 + (Math.random() * 40 - 20));

    const isHonor = table.name.toLowerCase().includes('honor') || table.name.toLowerCase().includes('novios') || table.name.toLowerCase().includes('principal');

    const newElem: FloorPlanElement = {
      id: elemId,
      type: isRect ? 'rectangular_table' : 'round_table',
      name: table.name,
      tableNumber: tNum,
      x: spawnX,
      y: spawnY,
      width: isRect ? (table.shape === 'square' ? 120 : 200) : 130,
      height: isRect ? (table.shape === 'square' ? 120 : 95) : 130,
      radius: isRect ? undefined : 65,
      rotation: 0,
      seatCount,
      seatsLongSide: isRect ? Math.max(2, Math.floor((seatCount - 2) / 2)) : undefined,
      seatsHead: isRect ? 1 : undefined,
      seats,
      color: '#FFFFFF',
      textColor: isHonor ? '#8B3A4A' : '#2D2A26',
      zIndex: 10,
    };

    setElements((prev) => [...prev, newElem]);
    setSelectedElementId(elemId);
  };

  const handleLinkTableToElement = (elementId: string, table: WeddingTable) => {
    const isRect =
      table.shape === 'rectangular' ||
      table.shape === 'imperial' ||
      table.shape === 'square';
    const tNum = extractTableNumber(table.name) || 1;

    const { seats, seatCount } = buildTableSeats(
      elementId,
      table.name,
      tNum,
      table.capacity || 10,
      guests
    );

    const isHonor = table.name.toLowerCase().includes('honor') || table.name.toLowerCase().includes('novios') || table.name.toLowerCase().includes('principal');

    handleUpdateElement(elementId, {
      name: table.name,
      tableNumber: tNum,
      type: isRect ? 'rectangular_table' : 'round_table',
      seatCount,
      seats,
      width: isRect ? (table.shape === 'square' ? 120 : 200) : 130,
      height: isRect ? (table.shape === 'square' ? 120 : 95) : 130,
      radius: isRect ? undefined : 65,
      seatsLongSide: isRect ? Math.max(2, Math.floor((seatCount - 2) / 2)) : undefined,
      seatsHead: isRect ? 1 : undefined,
      textColor: isHonor ? '#8B3A4A' : '#2D2A26',
    });
  };

  const handleUpdateElement = (id: string, updates: Partial<FloorPlanElement>) => {
    setElements((prev) =>
      prev.map((elem) => (elem.id === id ? { ...elem, ...updates } : elem))
    );
  };

  const handleDuplicateElement = (id: string) => {
    const elem = elements.find((e) => e.id === id);
    if (!elem) return;

    const newId = `elem_${elem.type}_${Date.now()}`;
    const duplicateSeats = (elem.seats || []).map((s, idx) => ({
      id: `seat_${newId}_${idx + 1}`,
      seatNumber: idx + 1,
      // Clear assigned guest on duplicate
    }));

    const nextTableNum =
      elem.tableNumber !== undefined
        ? elements.filter((e) => e.type === 'round_table' || e.type === 'rectangular_table').length + 1
        : undefined;

    const duplicated: FloorPlanElement = {
      ...elem,
      id: newId,
      name: nextTableNum ? `Mesa ${nextTableNum}` : `${elem.name} (Copia)`,
      tableNumber: nextTableNum,
      x: elem.x + 35,
      y: elem.y + 35,
      seats: duplicateSeats,
    };

    setElements((prev) => [...prev, duplicated]);
    setSelectedElementId(newId);
  };

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleBringToFront = (id: string) => {
    const maxZ = Math.max(...elements.map((e) => e.zIndex || 0), 0);
    handleUpdateElement(id, { zIndex: maxZ + 1 });
  };

  const handleSendToBack = (id: string) => {
    const minZ = Math.min(...elements.map((e) => e.zIndex || 0), 0);
    handleUpdateElement(id, { zIndex: minZ - 1 });
  };

  // Assign guest to specific seat
  const handleAssignGuestToSeat = (elementId: string, seatId: string, guest: Guest) => {
    setElements((prev) => {
      // First unassign guest from any other seat if already assigned
      const cleaned = prev.map((elem) => ({
        ...elem,
        seats: (elem.seats || []).map((seat) =>
          seat.guestId === guest.id
            ? {
                ...seat,
                guestId: undefined,
                guestName: undefined,
                guestInitials: undefined,
                guestPhone: undefined,
                dietaryRequirement: undefined,
                companionCount: undefined,
              }
            : seat
        ),
      }));

      // Now assign to target seat
      return cleaned.map((elem) => {
        if (elem.id !== elementId) return elem;
        return {
          ...elem,
          seats: (elem.seats || []).map((seat) => {
            if (seat.id !== seatId) return seat;
            const initials = guest.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();
            return {
              ...seat,
              guestId: guest.id,
              guestName: guest.fullName,
              guestInitials: initials,
              guestPhone: guest.phone,
              dietaryRequirement: guest.dietaryRestrictions,
              companionCount: guest.confirmedPasses || guest.totalPasses || 1,
            };
          }),
        };
      });
    });
  };

  // Unassign guest from seat
  const handleUnassignGuestFromSeat = (elementId: string, seatId: string) => {
    setElements((prev) =>
      prev.map((elem) => {
        if (elem.id !== elementId) return elem;
        return {
          ...elem,
          seats: (elem.seats || []).map((seat) =>
            seat.id === seatId
              ? {
                  ...seat,
                  guestId: undefined,
                  guestName: undefined,
                  guestInitials: undefined,
                  guestPhone: undefined,
                  dietaryRequirement: undefined,
                  companionCount: undefined,
                }
              : seat
          ),
        };
      })
    );
  };

  // Unassign guest by Guest ID
  const handleUnassignGuest = (guestId: string) => {
    setElements((prev) =>
      prev.map((elem) => ({
        ...elem,
        seats: (elem.seats || []).map((seat) =>
          seat.guestId === guestId
            ? {
                ...seat,
                guestId: undefined,
                guestName: undefined,
                guestInitials: undefined,
                guestPhone: undefined,
                dietaryRequirement: undefined,
                companionCount: undefined,
              }
            : seat
        ),
      }))
    );
  };

  // File Upload (PDF or Image)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfError(null);
    setIsProcessingPdf(true);

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // PDF Render with PDF.js
        const res = await renderPdfFirstPageToImage(file, 2.0);
        setBackgroundImageUrl(res.dataUrl);
        setBackgroundFileName(file.name);
        setCanvasWidth(res.width);
        setCanvasHeight(res.height);
      } else {
        // Standard Image
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setBackgroundImageUrl(dataUrl);
          setBackgroundFileName(file.name);

          const img = new Image();
          img.onload = () => {
            setCanvasWidth(img.width || 1600);
            setCanvasHeight(img.height || 1200);
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.error('Error importando plano:', err);
      setPdfError(err.message || 'No se pudo cargar el plano');
    } finally {
      setIsProcessingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Calibration Line Finished
  const handleCalibrationLineDrawn = (pixelDistance: number) => {
    setIsCalibratingScale(false);
    setTempDrawnPixelDist(pixelDistance);
    setShowCalibrationPrompt(true);
  };

  const applyCalibrationScale = () => {
    const realMeters = parseFloat(calibrationRealMetersInput) || 1.0;
    if (realMeters > 0 && tempDrawnPixelDist > 0) {
      const pxPerMeter = tempDrawnPixelDist / realMeters;
      setScaleCalibration({
        isCalibrated: true,
        pixelDistance: tempDrawnPixelDist,
        realMeters,
        pixelsPerMeter: pxPerMeter,
      });
    }
    setShowCalibrationPrompt(false);
  };

  // Sync tables and seats with current wedding distribution
  const handleSyncWithWedding = () => {
    const synced = buildFloorPlanFromWedding(tables, guests, elements);
    setElements(synced);
    setSyncSuccessNotice(true);
    setTimeout(() => setSyncSuccessNotice(false), 3500);
  };

  // Save Distribution to Firestore and Local Storage
  const handleSavePlan = async () => {
    if (!activeWeddingId) return;
    setIsSaving(true);

    const planPayload: WeddingFloorPlan = {
      id: activeWeddingId,
      weddingId: activeWeddingId,
      backgroundImageUrl,
      backgroundFileName,
      backgroundOpacity,
      scale: scaleCalibration,
      elements,
      gridSnap,
      gridSize,
      canvasWidth,
      canvasHeight,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Save locally
      localStorage.setItem(`casanovia_floor_plan_${activeWeddingId}`, JSON.stringify(planPayload));

      // Save in Firestore
      const docRef = doc(db, 'floor_plans', activeWeddingId);
      await setDoc(docRef, cleanFirestoreData(planPayload), { merge: true });

      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err) {
      console.warn('Error guardando plano en Firestore:', err);
      // Still notify success because local persistence succeeded
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const planPayload: WeddingFloorPlan = {
      id: activeWeddingId,
      weddingId: activeWeddingId,
      backgroundImageUrl,
      backgroundFileName,
      backgroundOpacity,
      scale: scaleCalibration,
      elements,
      gridSnap,
      gridSize,
      canvasWidth,
      canvasHeight,
      updatedAt: new Date().toISOString(),
    };

    try {
      await exportFloorPlanToPdf({
        plan: planPayload,
        settings,
        canvasElement: canvas,
        weddingTitle,
      });
    } catch (err) {
      console.error('Error exportando PDF:', err);
    }
  };

  // Export PNG Image
  const handleExportPng = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Plano_Boda_${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF8F5] select-none animate-in fade-in duration-200">
      
      {/* 1. TOP MASTER HEADER BAR */}
      <div className="h-14 border-b border-[#E8DCCF] bg-white flex items-center justify-between px-4 sm:px-6 shadow-2xs z-30">
        
        {/* Left: Brand & Wedding Selector */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#8B3A4A] border border-rose-200 flex items-center justify-center font-serif font-bold text-sm shadow-2xs">
            P
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-xs sm:text-sm text-[#2D2A26] font-serif">
                Diseñador de Planos
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                PDF & Asientos
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-[#8C8276]">
              <span>Boda: <strong className="text-[#2D2A26]">{weddingTitle}</strong></span>
              {scaleCalibration.isCalibrated && (
                <span className="text-emerald-700 font-semibold hidden sm:inline">
                  • 📏 1m = {scaleCalibration.pixelsPerMeter.toFixed(1)}px
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Quick Canvas Navigation Controls */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DCCF]">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.15, 3.5))}
            className="p-1.5 text-[#8C8276] hover:text-[#2D2A26] hover:bg-white rounded-lg transition-colors cursor-pointer"
            title="Acercar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-[#2D2A26] px-1.5">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(z * 0.85, 0.25))}
            className="p-1.5 text-[#8C8276] hover:text-[#2D2A26] hover:bg-white rounded-lg transition-colors cursor-pointer"
            title="Alejar (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPan({ x: 50, y: 50 });
            }}
            className="p-1.5 text-[#8C8276] hover:text-[#2D2A26] hover:bg-white rounded-lg transition-colors cursor-pointer text-[10px] font-semibold"
            title="Restablecer vista"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-[#D9CEBF] mx-1" />

          {/* Grid Snap Toggle */}
          <button
            onClick={() => setGridSnap((s) => !s)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 text-[11px] font-semibold ${
              gridSnap ? 'bg-white text-[#8B3A4A] shadow-2xs border border-[#D9CEBF]' : 'text-[#8C8276] hover:text-[#2D2A26]'
            }`}
            title="Ajustar a la cuadrícula"
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Imán</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          
          {/* Sync Tables & Guests button */}
          <button
            onClick={handleSyncWithWedding}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              syncSuccessNotice
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200'
                : 'bg-white hover:bg-rose-50 text-[#8B3A4A] border-rose-200 hover:border-[#8B3A4A]'
            }`}
            title="Sincronizar mesas y asientos con la distribución actual de invitados y acompañantes"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8B3A4A] ${syncSuccessNotice ? 'animate-spin' : ''}`} />
            <span className="font-bold">
              {syncSuccessNotice ? '¡Mesas Sincronizadas!' : 'Sincronizar Mesas'}
            </span>
          </button>

          {/* Import PDF button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,image/png,image/jpeg,image/jpg"
            className="hidden"
          />
          <button
            onClick={() => {
              if (!isLevel1Admin) {
                alert("Opción no disponible para su plan");
              } else {
                fileInputRef.current?.click();
              }
            }}
            disabled={isProcessingPdf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Importar plano de local desde PDF o Imagen"
          >
            {isProcessingPdf ? (
              <Loader2 className="w-3.5 h-3.5 text-[#8B3A4A] animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#8B3A4A]" />
            )}
            <span className="hidden sm:inline">Importar Plano (PDF)</span>
          </button>

          {/* Calibrate Scale button */}
          <button
            onClick={() => setIsCalibratingScale((c) => !c)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
              isCalibratingScale
                ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] ring-2 ring-rose-300'
                : 'bg-white text-[#2D2A26] border-[#D9CEBF] hover:bg-[#F3EFEA]'
            }`}
            title="Trazar una línea de referencia para calibrar escala en metros"
          >
            <Ruler className="w-3.5 h-3.5 text-[#E5B869]" />
            <span className="hidden md:inline">Calibrar Escala</span>
          </button>

          {/* PHP Endpoints & SQL view button */}
          {isLevel1Admin && (
            <button
              onClick={() => setShowPhpSqlModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
              title="Ver endpoints PHP y SQL"
            >
              <Server className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden lg:inline">Endpoints PHP</span>
            </button>
          )}

          {/* Export PDF */}
          <button
            onClick={handleExportPdf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors shadow-2xs cursor-pointer"
            title="Exportar documento PDF de alta calidad para montaje"
          >
            <FileDown className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>

          {/* Save Plan Button */}
          <button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#8B3A4A] hover:bg-[#722F3D] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccessNotice ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Save className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{saveSuccessNotice ? '¡Guardado!' : 'Guardar Plano'}</span>
          </button>

          {/* Close modal */}
          <button
            onClick={onClose}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* 2. ERROR NOTICE / PDF ERROR BANNER */}
      {pdfError && (
        <div className="px-6 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{pdfError}</span>
          <button onClick={() => setPdfError(null)} className="font-bold underline text-rose-900 ml-4">
            Entendido
          </button>
        </div>
      )}

      {/* 2b. SYNC SUCCESS BANNER */}
      {syncSuccessNotice && (
        <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">
              ¡Mesas y asientos actualizados exitosamente con la distribución de invitados y acompañantes de la boda actual!
            </span>
          </div>
          <button
            onClick={() => setSyncSuccessNotice(false)}
            className="font-bold text-emerald-700 hover:text-emerald-900 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. MAIN 3-PANEL WORKSPACE (Toolbar | Canvas | Guest Manager) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar: Furniture & Properties */}
        <FloorPlanToolbar
          selectedElement={selectedElement}
          tables={tables}
          guests={guests}
          elements={elements}
          onAddElement={handleAddElement}
          onAddTableFromWedding={handleAddTableFromWedding}
          onLinkTableToElement={handleLinkTableToElement}
          onUpdateElement={handleUpdateElement}
          onDuplicateElement={handleDuplicateElement}
          onDeleteElement={handleDeleteElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
        />

        {/* Center: Interactive Canvas */}
        <div className="flex-1 h-full relative">
          <FloorPlanCanvas
            elements={elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onUpdateElements={setElements}
            onAssignGuestToSeat={handleAssignGuestToSeat}
            onUnassignGuestFromSeat={handleUnassignGuestFromSeat}
            backgroundImageUrl={backgroundImageUrl}
            backgroundOpacity={backgroundOpacity}
            scaleCalibration={scaleCalibration}
            gridSnap={gridSnap}
            gridSize={gridSize}
            isCalibratingScale={isCalibratingScale}
            onCalibrationLineDrawn={handleCalibrationLineDrawn}
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            draggedGuest={draggedGuest}
            onSeatClick={(elemId, seat, pos) => {
              setActiveSeatPicker({ elementId: elemId, seat, screenPos: pos });
            }}
          />

          {/* Background Image Opacity Slider Control (if background loaded) */}
          {backgroundImageUrl && (
            <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-xs p-2 rounded-xl shadow-lg border border-[#E8DCCF] flex items-center space-x-2 text-xs">
              <ImageIcon className="w-3.5 h-3.5 text-[#8B3A4A]" />
              <span className="text-[10px] font-semibold text-[#8C8276]">Fondo:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                className="w-20 accent-[#8B3A4A] cursor-pointer"
                title="Opacidad del fondo PDF"
              />
              <button
                onClick={() => {
                  setBackgroundImageUrl(undefined);
                  setBackgroundFileName(undefined);
                }}
                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold p-1 cursor-pointer"
                title="Quitar imagen de fondo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Seating Guest List */}
        <FloorPlanGuestSidebar
          guests={guests}
          elements={elements}
          onUnassignGuest={handleUnassignGuest}
          onDragStartGuest={(g) => setDraggedGuest(g)}
          onDragEndGuest={() => setDraggedGuest(null)}
          onFocusTable={(elemId) => {
            setSelectedElementId(elemId);
            const elem = elements.find((e) => e.id === elemId);
            if (elem) {
              setPan({
                x: -elem.x * zoom + 400,
                y: -elem.y * zoom + 300,
              });
            }
          }}
        />

      </div>

      {/* 4. MODAL: Scale Calibration Distance Input */}
      {showCalibrationPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl border border-[#E8DCCF] space-y-4 text-[#2D2A26]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8B3A4A] border border-amber-200 flex items-center justify-center">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base font-serif">Calibrar Escala del Plano</h3>
                <p className="text-xs text-[#8C8276]">
                  Línea trazada: <strong className="text-[#2D2A26]">{tempDrawnPixelDist.toFixed(0)} píxeles</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#8C8276] uppercase">
                Distancia Real de esta pared / objeto (Metros)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={calibrationRealMetersInput}
                  onChange={(e) => setCalibrationRealMetersInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-[#FAF8F5] border border-[#D9CEBF] rounded-xl text-sm font-bold focus:outline-hidden focus:border-[#8B3A4A]"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8C8276]">
                  metros
                </span>
              </div>
              <p className="text-[11px] text-[#8C8276]">
                Resultado: 1 metro equivaldrá a {(tempDrawnPixelDist / (parseFloat(calibrationRealMetersInput) || 1)).toFixed(1)} px.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#E8DCCF]">
              <button
                onClick={() => setShowCalibrationPrompt(false)}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#E8DCCF] text-xs font-semibold text-[#2D2A26] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={applyCalibrationScale}
                className="px-5 py-2 rounded-xl bg-[#8B3A4A] hover:bg-[#722F3D] text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                Aplicar Escala
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Seat Click Quick Guest Picker */}
      {activeSeatPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-[#E8DCCF] space-y-3 text-[#2D2A26] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-2">
              <div className="font-bold text-sm">
                <span>Asiento #{activeSeatPicker.seat.seatNumber}</span>
              </div>
              <button
                onClick={() => setActiveSeatPicker(null)}
                className="text-[#8C8276] hover:text-[#2D2A26] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeSeatPicker.seat.guestId ? (
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B3A4A]">Invitado Asignado:</span>
                  <span className="text-[10px] text-[#8C8276]">Ocupado</span>
                </div>
                <p className="font-bold text-sm text-[#2D2A26]">{activeSeatPicker.seat.guestName}</p>
                <button
                  onClick={() => {
                    handleUnassignGuestFromSeat(activeSeatPicker.elementId, activeSeatPicker.seat.id);
                    setActiveSeatPicker(null);
                  }}
                  className="w-full py-1.5 rounded-lg bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Desasignar Asiento
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#8C8276]">Selecciona un invitado disponible para este asiento:</p>
            )}

            <div className="flex-1 overflow-y-auto space-y-1 max-h-60 pr-1">
              {guests.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    handleAssignGuestToSeat(activeSeatPicker.elementId, activeSeatPicker.seat.id, g);
                    setActiveSeatPicker(null);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#FAF8F5] border border-transparent hover:border-[#D9CEBF] transition-colors flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-[#2D2A26] group-hover:text-[#8B3A4A] truncate">
                      {g.fullName}
                    </div>
                    {g.assignedTable && (
                      <div className="text-[10px] text-[#8B3A4A] truncate">
                        {g.assignedTable}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8C8276] shrink-0">
                    {g.confirmedPasses || g.totalPasses ? `${g.confirmedPasses || g.totalPasses} p.` : '1 p.'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: PHP Endpoints & SQL Viewer */}
      <FloorPlanPhpSqlModal
        isOpen={showPhpSqlModal}
        onClose={() => setShowPhpSqlModal(false)}
      />

    </div>
  );
};
