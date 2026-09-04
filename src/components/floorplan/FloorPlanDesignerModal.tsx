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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Undo2,
  Users,
  Redo2,
  AlertCircle,
  AlertTriangle
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
import {
  buildFloorPlanFromWedding,
  buildTableSeats,
  extractTableNumber,
  ensureUniqueTableIdentities,
  normalizeTableText,
  getGuestGroupInfo,
  checkFloorPlanElementCapacityForGroup,
} from './floorPlanSyncUtils';
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
    updateGuest,
  } = useWedding();

  // Floor plan layout state
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | undefined>(undefined);
  const [backgroundFileName, setBackgroundFileName] = useState<string | undefined>(undefined);
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.85);

  // Canvas Viewport State
  const [zoom, setZoom] = useState<number>(1.0);
  const [canvasRotation, setCanvasRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(30);
  const [canvasWidth, setCanvasWidth] = useState<number>(1600);
  const [canvasHeight, setCanvasHeight] = useState<number>(1200);

  // Mobile sidebar toggles
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(window.innerWidth > 768);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(window.innerWidth > 768);
  const [showMobileTopBar, setShowMobileTopBar] = useState<boolean>(false);

  // Auto-show toolbar (which has properties) on mobile when element selected
  useEffect(() => {
    if (selectedElementId && window.innerWidth < 768) {
      setShowLeftSidebar(true);
      if (window.innerWidth <= 768) setShowRightSidebar(false);
    }
  }, [selectedElementId]);


  // Scale Calibration State
  const [scaleCalibration, setScaleCalibration] = useState({
    isCalibrated: false,
    pixelDistance: 50,
    realMeters: 1.0,
    pixelsPerMeter: 50.0,
  });

  // History State for Undo/Redo
  const [history, setHistory] = useState<{
    past: FloorPlanElement[][];
    future: FloorPlanElement[][];
  }>({ past: [], future: [] });
  const isUndoRedo = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.past.length <= 1) return prev;
      const newPast = [...prev.past];
      const currentState = newPast.pop()!;
      const previousState = newPast[newPast.length - 1];

      isUndoRedo.current = true;
      setElements(previousState);

      return {
        past: newPast,
        future: [currentState, ...prev.future]
      };
    });
  };

  const handleRedo = () => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const newFuture = [...prev.future];
      const nextState = newFuture.shift()!;

      isUndoRedo.current = true;
      setElements(nextState);

      return {
        past: [...prev.past, nextState],
        future: newFuture
      };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHistory((prev) => {
        if (prev.past.length > 0) {
          const lastState = prev.past[prev.past.length - 1];
          if (JSON.stringify(lastState) === JSON.stringify(elements)) {
            return prev;
          }
        } else if (prev.past.length === 0 && elements.length === 0) {
          return prev;
        }

        const newPast = [...prev.past, elements].slice(-11);
        return {
          past: newPast,
          future: []
        };
      });
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [elements]);

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
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState<boolean>(false);

  const showCapacityWarning = (msg: string) => {
    setCapacityWarning(msg);
    setTimeout(() => {
      setCapacityWarning((prev) => (prev === msg ? null : prev));
    }, 6000);
  };
  const [syncConfirmAction, setSyncConfirmAction] = useState<'auto' | 'manual' | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

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
      let loadedElements = null;
      let loadedData = null;

      try {
        // Try Firestore
        const docRef = doc(db, 'floor_plans', activeWeddingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && isMounted) {
          loadedData = docSnap.data();
          loadedElements = loadedData.elements;
        }
      } catch (err) {
        console.info('[FloorPlan] Firestore read note (using local fallback):', err);
      }

      if (!loadedElements && isMounted) {
        // Try Local Storage fallback
        try {
          const localData = localStorage.getItem(`casanovia_floor_plan_${activeWeddingId}`);
          if (localData) {
            loadedData = JSON.parse(localData);
            loadedElements = loadedData.elements;
          }
        } catch (err) {}
      }

      if (isMounted) {
        if (loadedElements) {
          // We have a saved plan
          if (autoSync) {
            setElements(ensureUniqueTableIdentities(buildFloorPlanFromWedding(tables, guests, loadedElements), tables));
          } else {
            setElements(ensureUniqueTableIdentities(loadedElements, tables));
          }
          if (loadedData.backgroundImageUrl) setBackgroundImageUrl(loadedData.backgroundImageUrl);
          if (loadedData.backgroundFileName) setBackgroundFileName(loadedData.backgroundFileName);
          if (loadedData.backgroundOpacity !== undefined) setBackgroundOpacity(loadedData.backgroundOpacity);
          if (loadedData.scale) setScaleCalibration(loadedData.scale);
          if (loadedData.gridSnap !== undefined) setGridSnap(loadedData.gridSnap);
          if (loadedData.gridSize) setGridSize(loadedData.gridSize);
          if (loadedData.canvasWidth) setCanvasWidth(loadedData.canvasWidth);
          if (loadedData.canvasHeight) setCanvasHeight(loadedData.canvasHeight);
        } else {
          // NO saved plan
          if (autoSync) {
            setElements(ensureUniqueTableIdentities(buildFloorPlanFromWedding(tables, guests), tables));
          } else {
            setElements([]);
          }
        }
      }
    };

    loadPlan();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeWeddingId, tables, guests, autoSync]);

  const selectedElement = useMemo(
    () => elements.find((e) => e.id === selectedElementId) || null,
    [elements, selectedElementId]
  );

  if (!isOpen) return null;

  const weddingTitle =
    activeWedding?.coupleNames ||
    settings.coupleNames ||
    `${settings.brideName || ''} & ${settings.groomName || ''}`.trim() ||
    'Evento Actual';

  // Add Element to Canvas
  const handleAddElement = (type: FloorPlanElementType) => {
    const newId = `elem_${type}_${Date.now()}`;
    const isTable = type === 'round_table' || type === 'rectangular_table';

    let nextTableNumber = 1;
    let newTableName = '';

    if (isTable) {
      const usedNumbers = new Set<number>();
      const usedNames = new Set<string>();

      elements.forEach((e) => {
        if (e.name) usedNames.add(normalizeTableText(e.name));
        if (e.tableNumber) usedNumbers.add(e.tableNumber);
        const extracted = extractTableNumber(e.name);
        if (extracted !== null) usedNumbers.add(extracted);
      });

      tables.forEach((t) => {
        if (t.name) usedNames.add(normalizeTableText(t.name));
        const extracted = extractTableNumber(t.name);
        if (extracted !== null) usedNumbers.add(extracted);
      });

      let candidateNum = Math.max(0, ...Array.from(usedNumbers)) + 1;
      while (usedNumbers.has(candidateNum) || usedNames.has(`mesa ${candidateNum}`)) {
        candidateNum++;
      }
      nextTableNumber = candidateNum;
      newTableName = `Mesa ${nextTableNumber}`;
    }

    let newElem: FloorPlanElement;

    // Viewport center spawn
    const spawnX = -pan.x / zoom + 400;
    const spawnY = -pan.y / zoom + 300;

    switch (type) {
      case 'round_table':
        newElem = {
          id: newId,
          type: 'round_table',
          name: newTableName,
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
          name: newTableName,
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


      case 'single_chair':
        newElem = {
          id: newId,
          type: 'single_chair',
          name: 'Silla',
          x: spawnX,
          y: spawnY,
          width: 40,
          height: 40,
          rotation: 0,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
      case 'chair_row':
        newElem = {
          id: newId,
          type: 'chair_row',
          name: 'Fila de Sillas',
          x: spawnX,
          y: spawnY,
          width: 200,
          height: 40,
          rotation: 0,
          chairCount: 5,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
      case 'armchair_luis_xv':
        newElem = {
          id: newId,
          type: 'armchair_luis_xv',
          name: 'Sillón Luis XV',
          x: spawnX,
          y: spawnY,
          width: 60,
          height: 60,
          rotation: 0,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
      case 'sofa_1_seat':
        newElem = {
          id: newId,
          type: 'sofa_1_seat',
          name: 'Butaca (1 Cpo)',
          x: spawnX,
          y: spawnY,
          width: 60,
          height: 60,
          rotation: 0,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
      case 'sofa_2_seat':
        newElem = {
          id: newId,
          type: 'sofa_2_seat',
          name: 'Butaca (2 Cpos)',
          x: spawnX,
          y: spawnY,
          width: 120,
          height: 60,
          rotation: 0,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
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
      textColor: isHonor ? '#2D3748' : '#2D2A26',
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
      textColor: isHonor ? '#2D3748' : '#2D2A26',
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
    const isTable = elem.type === 'round_table' || elem.type === 'rectangular_table';

    const usedNumbers = new Set<number>();
    const usedNames = new Set<string>();

    elements.forEach((e) => {
      if (e.name) usedNames.add(normalizeTableText(e.name));
      if (e.tableNumber) usedNumbers.add(e.tableNumber);
      const extracted = extractTableNumber(e.name);
      if (extracted !== null) usedNumbers.add(extracted);
    });

    tables.forEach((t) => {
      if (t.name) usedNames.add(normalizeTableText(t.name));
      const extracted = extractTableNumber(t.name);
      if (extracted !== null) usedNumbers.add(extracted);
    });

    let nextTableNum: number | undefined = undefined;
    let newName = '';

    if (isTable) {
      let candidateNum = Math.max(0, ...Array.from(usedNumbers)) + 1;
      while (usedNumbers.has(candidateNum) || usedNames.has(`mesa ${candidateNum}`)) {
        candidateNum++;
      }
      nextTableNum = candidateNum;
      newName = `Mesa ${nextTableNum}`;
    } else {
      const baseName = elem.name.replace(/\s*\(Copia(\s+\d+)?\)$/i, '').trim();
      let candidateName = `${baseName} (Copia)`;
      let copyIdx = 2;
      while (usedNames.has(normalizeTableText(candidateName))) {
        candidateName = `${baseName} (Copia ${copyIdx})`;
        copyIdx++;
      }
      newName = candidateName;
    }

    const duplicateSeats = (elem.seats || []).map((s, idx) => ({
      id: `seat_${newId}_${idx + 1}`,
      seatNumber: idx + 1,
      // Clear assigned guest on duplicate
    }));

    const duplicated: FloorPlanElement = {
      ...elem,
      id: newId,
      name: newName,
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
  const handleAssignGuestToSeat = async (elementId: string, seatId: string, guest: Guest) => {
    const targetElem = elements.find((e) => e.id === elementId);
    if (!targetElem) return;

    // 1. Validar que la mesa tenga capacidad suficiente para el invitado y su(s) acompañante(s)
    const capacityCheck = checkFloorPlanElementCapacityForGroup(targetElem, guest, guests);
    if (!capacityCheck.canFit) {
      showCapacityWarning(
        capacityCheck.warningMessage ||
          `La mesa "${targetElem.name}" sobrepasa su capacidad.`
      );
      return;
    }

    const groupInfo = getGuestGroupInfo(guest, guests);
    const mainGuest = groupInfo.mainGuest;
    const registeredCompanions = groupInfo.registeredCompanions;
    const groupMemberIds = new Set([mainGuest.id, ...registeredCompanions.map((c) => c.id), guest.id]);

    setElements((prev) => {
      // 2. Primero desasignar al invitado, a sus acompañantes y a sus pases de cualquier asiento previo
      const cleaned = prev.map((elem) => ({
        ...elem,
        seats: (elem.seats || []).map((seat) =>
          (seat.guestId && (groupMemberIds.has(seat.guestId) || seat.guestId.startsWith(`companion_${mainGuest.id}_`) || seat.guestId.startsWith(`companion_${guest.id}_`)))
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

      // 3. Asignar en la mesa destino
      return cleaned.map((elem) => {
        if (elem.id !== elementId) return elem;

        const currentSeats = [...(elem.seats || [])];
        const primaryGuest = guest;
        const initials = primaryGuest.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        const targetSeatIndex = currentSeats.findIndex((s) => s.id === seatId);
        if (targetSeatIndex !== -1) {
          currentSeats[targetSeatIndex] = {
            ...currentSeats[targetSeatIndex],
            guestId: primaryGuest.id,
            guestName: primaryGuest.fullName,
            guestInitials: initials,
            guestPhone: primaryGuest.phone,
            dietaryRequirement: primaryGuest.dietaryRestrictions,
            companionCount: groupInfo.requiredSeats,
          };
        }

        // Asignar acompañantes registrados a los siguientes asientos libres
        let companionIndex = 0;
        for (const comp of registeredCompanions) {
          if (comp.id === primaryGuest.id) continue;
          const nextFreeIdx = currentSeats.findIndex(
            (s, idx) => idx !== targetSeatIndex && (!s.guestId || s.guestId.trim() === '')
          );
          if (nextFreeIdx !== -1) {
            const compInitials = comp.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();
            currentSeats[nextFreeIdx] = {
              ...currentSeats[nextFreeIdx],
              guestId: comp.id,
              guestName: comp.fullName,
              guestInitials: compInitials,
              guestPhone: comp.phone,
              dietaryRequirement: comp.dietaryRestrictions,
              companionCount: 1,
            };
            companionIndex++;
          }
        }

        // Asignar pases extra adicionales sin acompañante registrado
        const remainingPasses = groupInfo.requiredSeats - 1 - companionIndex;
        for (let i = 0; i < remainingPasses; i++) {
          const nextFreeIdx = currentSeats.findIndex(
            (s, idx) => idx !== targetSeatIndex && (!s.guestId || s.guestId.trim() === '')
          );
          if (nextFreeIdx !== -1) {
            currentSeats[nextFreeIdx] = {
              ...currentSeats[nextFreeIdx],
              guestId: `companion_${mainGuest.id}_${i + 1}`,
              guestName: `Acompañante de ${mainGuest.fullName}`,
              guestInitials: `A${i + 1}`,
              companionCount: 1,
            };
          }
        }

        return {
          ...elem,
          seats: currentSeats,
        };
      });
    });

    // Actualizar mesa asignada en WeddingContext
    try {
      await updateGuest(mainGuest.id, { assignedTable: targetElem.name });
    } catch (err) {
      console.warn('Error al actualizar mesa de invitado:', err);
    }

    const companionCount = groupInfo.requiredSeats - 1;
    setAssignmentNotice(
      companionCount > 0
        ? `¡"${guest.fullName}" y ${companionCount === 1 ? 'su acompañante' : `${companionCount} acompañantes`} ubicados en "${targetElem.name}"!`
        : `¡"${guest.fullName}" ubicado en "${targetElem.name}"!`
    );
    setTimeout(() => setAssignmentNotice(null), 3500);
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

    const sanitizedElements = ensureUniqueTableIdentities(elements, tables);
    setElements(sanitizedElements);

    const planPayload: WeddingFloorPlan = {
      id: activeWeddingId,
      weddingId: activeWeddingId,
      backgroundImageUrl,
      backgroundFileName,
      backgroundOpacity,
      scale: scaleCalibration,
      elements: sanitizedElements,
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
  const handleExportPdf = async (mode: 'all' | 'plan_only' | 'list_only' = 'all') => {
    setShowExportMenu(false);
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
        exportMode: mode,
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
    link.download = `Plano_${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF8F5] select-none animate-in fade-in duration-200">
      
      {/* 1. TOP MASTER HEADER BAR */}
      <div className={`relative flex flex-col md:flex-row md:items-center justify-between border-b border-transparent bg-[#EBEBEB] shadow-2xs z-[70] transition-all duration-300 ${showMobileTopBar || showExportMenu ? 'h-auto pb-3 md:pb-0 overflow-visible' : 'h-14 overflow-hidden md:overflow-visible'}`}>
        
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 w-full md:w-auto shrink-0">
          {/* Left: Brand & Wedding Selector */}
          <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#2D3748] border border-rose-200 flex items-center justify-center font-serif font-bold text-sm shadow-2xs">
            {weddingTitle.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-xs sm:text-sm text-[#2D2A26] font-serif">
                  {weddingTitle}
                </h1>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-[#8C8276]">
                {scaleCalibration.isCalibrated && (
                  <span className="text-emerald-700 font-semibold hidden sm:inline">
                    📏 1m = {scaleCalibration.pixelsPerMeter.toFixed(1)}px
                  </span>
                )}
              </div>
            </div>

            {/* Canvas Dimensions Editor */}
            <div className="hidden md:flex items-center space-x-2 bg-blue-50 p-1.5 rounded-lg border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase">Lienzo</span>
              <input 
                type="number" 
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value) || 1600)}
                className="w-16 h-6 px-1 text-xs border border-blue-300 rounded focus:outline-hidden text-center"
                title="Ancho del lienzo (px)"
              />
              <span className="text-xs text-blue-500 font-bold">x</span>
              <input 
                type="number" 
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value) || 1200)}
                className="w-16 h-6 px-1 text-xs border border-blue-300 rounded focus:outline-hidden text-center"
                title="Alto del lienzo (px)"
              />
            </div>
          </div>
        </div>
        
        {/* Mobile Handle & Close */}
        <div className="flex items-center space-x-1 md:hidden">
          <button
            onClick={() => setShowMobileTopBar(!showMobileTopBar)}
            className="p-2 text-[#2D3748] bg-rose-50 rounded-xl transition-colors"
          >
            {showMobileTopBar ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tools & Actions Row */}
      <div className={`flex flex-wrap md:flex-nowrap items-center justify-center md:justify-end gap-2 px-4 sm:px-6 w-full md:flex-1`}>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          
          {/* Undo / Redo */}
          <div className="flex items-center space-x-1 mr-1">
            <button
              onClick={handleUndo}
              disabled={history.past.length <= 1}
              className="p-1.5 rounded-xl bg-[#EBEBEB] hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[#2D2A26] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={history.future.length === 0}
              className="p-1.5 rounded-xl bg-[#EBEBEB] hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[#2D2A26] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Sync Tables & Guests button */}
          <div className="flex items-center bg-[#EBEBEB] border border-rose-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              onClick={() => setSyncConfirmAction('manual')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                syncSuccessNotice
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'hover:bg-rose-50 text-[#2D3748]'
              }`}
              title="Sincronizar mesas y asientos con la distribución actual de invitados y acompañantes"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#2D3748] ${syncSuccessNotice ? 'animate-spin' : ''}`} />
              <span className="font-bold">
                {syncSuccessNotice ? '¡Sincronizado!' : 'Sincronizar Mesas'}
              </span>
            </button>
            <div className="w-px h-5 bg-rose-100"></div>
            <label className="flex items-center space-x-1 px-2 py-1.5 cursor-pointer hover:bg-rose-50 transition-colors" title="Sincronización Automática al cargar">
              <input 
                type="checkbox" 
                checked={autoSync}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSyncConfirmAction('auto');
                  } else {
                    setAutoSync(false);
                  }
                }}
                className="w-3 h-3 text-[#2D3748] border-rose-200 rounded focus:ring-[#d1d1d1]"
              />
              <span className="text-[10px] font-bold text-[#8C8276]">Auto</span>
            </label>
          </div>

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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EBEBEB] hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Importar plano de local desde PDF o Imagen"
          >
            {isProcessingPdf ? (
              <Loader2 className="w-3.5 h-3.5 text-[#2D3748] animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#2D3748]" />
            )}
            <span className="hidden sm:inline">Importar Plano (PDF)</span>
          </button>

          {/* Calibrate Scale button */}
          <button
            onClick={() => setIsCalibratingScale((c) => !c)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
              isCalibratingScale
                ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent ring-2 ring-rose-300'
                : 'bg-[#EBEBEB] text-[#2D2A26] border-[#D9CEBF] hover:bg-[#F3EFEA]'
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
          <div className="relative" ref={exportMenuRef}>
            <button
              id="btn-export-floorplan"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EBEBEB] hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors shadow-2xs cursor-pointer"
              title="Exportar plano y distribución de invitados"
            >
              <FileDown className="w-3.5 h-3.5 text-[#2D3748]" />
              <span className="hidden sm:inline">Exportar plano</span>
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-stone-300 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1">
                <div className="p-1.5 flex flex-col space-y-1">
                  <button 
                    id="btn-export-plan-only"
                    onClick={() => { setShowExportMenu(false); handleExportPdf('plan_only'); }} 
                    className="text-left px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <span className="text-base">🖼️</span>
                    <div>
                      <div className="font-bold">Solo plano de Distribución</div>
                      <div className="text-[10px] text-stone-500 font-normal">Ajustado 100% en A4 horizontal, fondo blanco</div>
                    </div>
                  </button>
                  <button 
                    id="btn-export-list-only"
                    onClick={() => { setShowExportMenu(false); handleExportPdf('list_only'); }} 
                    className="text-left px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <span className="text-base">👥</span>
                    <div>
                      <div className="font-bold">Solo Lista de Invitados</div>
                      <div className="text-[10px] text-stone-500 font-normal">Mesas y asientos detallados</div>
                    </div>
                  </button>
                  <button 
                    id="btn-export-all"
                    onClick={() => { setShowExportMenu(false); handleExportPdf('all'); }} 
                    className="text-left px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer flex items-center space-x-2 border-t border-stone-200 pt-1.5"
                  >
                    <span className="text-base">📄</span>
                    <div>
                      <div className="font-bold">Todo (Plano + Lista)</div>
                      <div className="text-[10px] text-stone-500 font-normal">Documento completo de montaje</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Plan Button */}
          <button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#722F3D] text-[#2D3748] text-xs font-bold transition-all shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccessNotice ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Save className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span className="hidden sm:inline">{saveSuccessNotice ? '¡Guardado!' : 'Guardar Plano'}</span>
          </button>

          {/* Close modal */}
          <button
            onClick={onClose}
            className="hidden md:flex p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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

      {/* 2a. CAPACITY WARNING BANNER */}
      {capacityWarning && (
        <div className="px-6 py-3 bg-rose-50 border-b-2 border-rose-400 text-rose-950 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 shadow-md z-30">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="font-medium text-rose-900 leading-snug">
              <span className="font-bold uppercase tracking-wider text-[11px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded-md mr-1.5">
                Capacidad Excedida
              </span>
              <span>{capacityWarning}</span>
            </div>
          </div>
          <button
            onClick={() => setCapacityWarning(null)}
            className="font-bold text-rose-700 hover:text-rose-950 ml-4 px-2 py-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
            title="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2b. ASSIGNMENT NOTICE BANNER */}
      {assignmentNotice && (
        <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in z-30">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{assignmentNotice}</span>
          </div>
          <button
            onClick={() => setAssignmentNotice(null)}
            className="font-bold text-emerald-700 hover:text-emerald-900 ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2c. SYNC SUCCESS BANNER */}
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
        
        {/* Universal Zoom Controls (Footer) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-1.5 bg-[#EBEBEB]/90 backdrop-blur-sm p-1.5 rounded-2xl border border-transparent shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.15, 3.5))}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Acercar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#2D2A26] px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(z * 0.85, 0.25))}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Alejar (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const isMobile = window.innerWidth <= 768;
              const availableWidth = window.innerWidth - (showLeftSidebar && !isMobile ? 320 : 0) - (showRightSidebar && !isMobile ? 320 : 0);
              const availableHeight = window.innerHeight - 120;
              const zoomX = availableWidth / canvasWidth;
              const zoomY = availableHeight / canvasHeight;
              const newZoom = Math.min(zoomX, zoomY, 3.5);
              setZoom(Math.max(0.1, newZoom - 0.05));
              setPan({ x: 50, y: 50 });
            }}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Restablecer vista"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#D9CEBF] mx-1" />
          <button
            onClick={() => setCanvasRotation((r) => (r + 90) % 360)}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors flex items-center shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Girar Plano 90°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="relative flex items-center">
            <input
              type="number"
              value={canvasRotation}
              onChange={(e) => setCanvasRotation(Number(e.target.value))}
              className="w-12 h-8 bg-transparent text-xs font-mono font-bold text-[#2D2A26] text-center focus:outline-hidden focus:ring-1 focus:ring-[#8C8276] rounded-md"
              title="Giro del plano (grados)"
            />
            <span className="absolute right-1 text-[10px] font-bold text-[#2D2A26] pointer-events-none">°</span>
          </div>
          <div className="w-px h-5 bg-[#D9CEBF] mx-1" />
          <button
            onClick={() => setGridSnap((s) => !s)}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
              gridSnap ? 'bg-[#EBEBEB] text-[#2D3748] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]' : 'text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]'
            }`}
            title="Ajustar a la cuadrícula"
          >
            <Magnet className="w-4 h-4" />
          </button>
        </div>

        {/* Left Sidebar: Furniture & Properties */}
        <div className={`absolute md:relative z-50 h-full transition-all duration-300 flex shadow-2xl md:shadow-none ${showLeftSidebar ? 'translate-x-0 md:ml-0' : '-translate-x-full md:translate-x-0 md:-ml-80'}`}>
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
          {/* Collapse/Expand Handle Left */}
          <button
            onClick={() => { setShowLeftSidebar(!showLeftSidebar); if (window.innerWidth <= 768) setShowRightSidebar(false); }}
            className="absolute -right-8 bottom-4 w-8 h-16 bg-[#EBEBEB] border border-l-0 border-[#D9CEBF] rounded-r-xl flex items-center justify-center shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"
          >
            {showLeftSidebar ? <ChevronLeft className="w-5 h-5 text-[#2D3748]" /> : <ChevronRight className="w-5 h-5 text-[#2D3748]" />}
          </button>
        </div>

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
            canvasRotation={canvasRotation}
            pan={pan}
            setPan={setPan}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            draggedGuest={draggedGuest}
            guests={guests}
            onSeatClick={(elemId, seat, pos) => {
              setActiveSeatPicker({ elementId: elemId, seat, screenPos: pos });
            }}
          />

          {/* Background Image Opacity Slider Control (if background loaded) */}
          {backgroundImageUrl && (
            <div className="absolute bottom-4 right-4 z-20 bg-[#EBEBEB]/95 backdrop-blur-xs p-2 rounded-xl shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] border border-transparent flex items-center space-x-2 text-xs">
              <ImageIcon className="w-3.5 h-3.5 text-[#2D3748]" />
              <span className="text-[10px] font-semibold text-[#8C8276]">Fondo:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                className="w-20 accent-[#2D3748] cursor-pointer"
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
        <div className={`absolute right-0 md:relative z-50 h-full transition-all duration-300 flex shadow-2xl md:shadow-none ${showRightSidebar ? 'translate-x-0 md:mr-0' : 'translate-x-full md:translate-x-0 md:-mr-80'}`}>
          {/* Collapse/Expand Handle Right */}
          <button
            onClick={() => { setShowRightSidebar(!showRightSidebar); if (window.innerWidth <= 768) setShowLeftSidebar(false); }}
            className="absolute -left-8 bottom-4 w-8 h-16 bg-[#EBEBEB] border border-r-0 border-[#D9CEBF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"
          >
            {showRightSidebar ? <ChevronRight className="w-5 h-5 text-[#2D3748]" /> : <ChevronLeft className="w-5 h-5 text-[#2D3748]" />}
          </button>
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

      </div>

      {/* 4. MODAL: Scale Calibration Distance Input */}
      {showCalibrationPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#EBEBEB] w-full max-w-md rounded-2xl p-5 shadow-2xl border border-transparent space-y-4 text-[#2D2A26]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#2D3748] border border-amber-200 flex items-center justify-center">
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
                  className="w-full pl-3 pr-10 py-2 bg-[#FAF8F5] border border-[#D9CEBF] rounded-xl text-sm font-bold focus:outline-hidden focus:border-transparent"
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

            <div className="flex justify-end space-x-2 pt-2 border-t border-transparent">
              <button
                onClick={() => setShowCalibrationPrompt(false)}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#E8DCCF] text-xs font-semibold text-[#2D2A26] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={applyCalibrationScale}
                className="px-5 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#722F3D] text-[#2D3748] text-xs font-bold transition-colors cursor-pointer shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]"
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
          <div className="bg-[#EBEBEB] w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-transparent space-y-3 text-[#2D2A26] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-transparent pb-2">
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
                  <span className="text-xs font-bold text-[#2D3748]">Invitado Asignado:</span>
                  <span className="text-[10px] text-[#8C8276]">Ocupado</span>
                </div>
                <p className="font-bold text-sm text-[#2D2A26]">{activeSeatPicker.seat.guestName}</p>
                <button
                  onClick={() => {
                    handleUnassignGuestFromSeat(activeSeatPicker.elementId, activeSeatPicker.seat.id);
                    setActiveSeatPicker(null);
                  }}
                  className="w-full py-1.5 rounded-lg bg-[#EBEBEB] hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
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
                    <div className="font-semibold text-[#2D2A26] group-hover:text-[#2D3748] truncate">
                      {g.fullName}
                    </div>
                    {g.assignedTable && (
                      <div className="text-[10px] text-[#2D3748] truncate">
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

      {/* CONFIRM MODAL FOR SYNC */}
      {syncConfirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D2A26]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#EBEBEB] p-6 rounded-2xl shadow-2xl w-80 max-w-[90vw] text-center border border-transparent">
            <h3 className="text-lg font-bold text-[#2D2A26] mb-2 font-serif">¿Está seguro/a?</h3>
            <p className="text-sm text-[#8C8276] mb-6">
              {syncConfirmAction === 'manual' 
                ? 'Esto actualizará las mesas en el plano para que coincidan con la lista de invitados actual. Puede alterar mesas existentes.' 
                : 'Esto habilitará la sincronización automática de mesas al cargar el plano en el futuro.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setSyncConfirmAction(null)}
                className="px-5 py-2.5 rounded-xl border border-transparent text-[#8C8276] font-semibold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                NO
              </button>
              <button 
                onClick={() => {
                  if (syncConfirmAction === 'manual') {
                    handleSyncWithWedding();
                  } else {
                    setAutoSync(true);
                  }
                  setSyncConfirmAction(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] font-semibold hover:bg-[#722F3D] transition-colors cursor-pointer shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]"
              >
                SÍ
              </button>
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
