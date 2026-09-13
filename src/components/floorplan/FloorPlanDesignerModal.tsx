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
  AlertTriangle,
  Palette,
  Trash2,
  RotateCw,
  Lock,
  Unlock,
  Copy,
  Armchair,
  Type,
  UserCheck,
  UserPlus,
  Check,
  Plus,
  Minus
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
import { FloorPlanToolbar, PRESET_COLORS } from './FloorPlanToolbar';
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
import { doc, getDoc, setDoc, deleteField, onSnapshot } from 'firebase/firestore';
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
    accessibleWeddings,
    setActiveWeddingId,
    selectWedding,
    guests,
    tables,
    settings,
    isLevel1Admin,
    updateGuest,
    updateTable,
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
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string>('#EBEBEB');

  // Mobile sidebar toggles
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(window.innerWidth > 768);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(window.innerWidth > 768);
  const [showMobileTopBar, setShowMobileTopBar] = useState<boolean>(false);
  const [weddingDropdownOpen, setWeddingDropdownOpen] = useState<boolean>(false);
  const weddingDropdownRef = useRef<HTMLDivElement>(null);

  // Close wedding dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (weddingDropdownRef.current && !weddingDropdownRef.current.contains(event.target as Node)) {
        setWeddingDropdownOpen(false);
      }
    };
    if (weddingDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [weddingDropdownOpen]);

  // Canvas viewport container ref
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Reset canvas view: dynamically scales and centers the canvas sheet so it fits completely in available screen space
  const handleResetView = () => {
    const container = canvasContainerRef.current;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Dimensions of the overall workspace containing sidebars and canvas
    const parentElem = container?.parentElement;
    const workspaceWidth = parentElem?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const workspaceHeight = parentElem?.clientHeight || container?.clientHeight || (typeof window !== 'undefined' ? window.innerHeight - 130 : 800);

    // Calculate space occupied by sidebars depending on whether they are expanded or collapsed
    const leftSidebarWidth = !isMobile && showLeftSidebar ? 320 : 0;
    const rightSidebarWidth = !isMobile && showRightSidebar ? 320 : 0;

    // Available space unobstructed by sidebars
    const availableWidth = Math.max(160, workspaceWidth - leftSidebarWidth - rightSidebarWidth);
    const availableHeight = Math.max(160, workspaceHeight);

    // Effective bounding box of the canvas sheet under current rotation
    const rad = ((canvasRotation || 0) % 360) * (Math.PI / 180);
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));

    const effectiveSheetWidth = (canvasWidth || 1600) * cos + (canvasHeight || 1200) * sin;
    const effectiveSheetHeight = (canvasWidth || 1600) * sin + (canvasHeight || 1200) * cos;

    // Clean margin around canvas sheet so it fits comfortably within the view without touching borders
    const margin = 48; // 24px each side
    const fitWidth = Math.max(100, availableWidth - margin);
    const fitHeight = Math.max(100, availableHeight - margin);

    const zoomX = fitWidth / effectiveSheetWidth;
    const zoomY = fitHeight / effectiveSheetHeight;
    const newZoom = Math.min(zoomX, zoomY);
    const clampedZoom = Math.max(0.1, Math.min(newZoom, 3.0));

    // Centering calculation:
    // FloorPlanCanvas transforms the canvas drawing context as:
    // ctx.translate(pan.x, pan.y);
    // ctx.translate(width / 2, height / 2);
    // ctx.rotate(rot);
    // ctx.translate(-width / 2, -height / 2);
    // ctx.scale(zoom, zoom);
    //
    // The center of the sheet (canvasWidth / 2, canvasHeight / 2) transformed before rotation:
    // p2.x = (canvasWidth * clampedZoom - containerW) / 2
    // p2.y = (canvasHeight * clampedZoom - containerH) / 2
    // Rotated by rad:
    // p3.x = p2.x * cos(rad) - p2.y * sin(rad)
    // p3.y = p2.x * sin(rad) + p2.y * cos(rad)
    const containerW = container?.clientWidth || availableWidth;
    const containerH = container?.clientHeight || availableHeight;

    const p2x = ((canvasWidth || 1600) * clampedZoom - containerW) / 2;
    const p2y = ((canvasHeight || 1200) * clampedZoom - containerH) / 2;
    const p3x = p2x * Math.cos(rad) - p2y * Math.sin(rad);
    const p3y = p2x * Math.sin(rad) + p2y * Math.cos(rad);

    let newPanX = -p3x;
    let newPanY = -p3y;

    if (isMobile) {
      if (showLeftSidebar) {
        newPanX = (leftSidebarWidth / 2) - p3x;
      } else if (showRightSidebar) {
        newPanX = -(rightSidebarWidth / 2) - p3x;
      }
    }

    setZoom(clampedZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

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
  const isLocalSavingRef = useRef(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Set up Real-time Firestore Listener with onSnapshot so all devices see changes in real time
  useEffect(() => {
    if (!isOpen || !activeWeddingId) return;

    let isMounted = true;
    isInitialLoadRef.current = true;

    const docRef = doc(db, 'floor_plans', activeWeddingId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (!isMounted) return;

        // Skip applying remote snapshot if this local client is currently performing a local write
        if (docSnap.metadata.hasPendingWrites || isLocalSavingRef.current) {
          return;
        }

        if (docSnap.exists()) {
          const loadedData = docSnap.data();
          const loadedElements = loadedData.elements;
          if (loadedElements) {
            // If autoSync is enabled, reconcile with registered tables and guests; otherwise keep loaded elements exactly as placed
            if (autoSync) {
              setElements(ensureUniqueTableIdentities(buildFloorPlanFromWedding(tables, guests, loadedElements), tables));
            } else {
              setElements(loadedElements);
            }
          }
          if (loadedData.backgroundImageUrl !== undefined) setBackgroundImageUrl(loadedData.backgroundImageUrl || null);
          if (loadedData.backgroundFileName !== undefined) setBackgroundFileName(loadedData.backgroundFileName || null);
          if (loadedData.backgroundOpacity !== undefined) setBackgroundOpacity(loadedData.backgroundOpacity);
          if (loadedData.scale) setScaleCalibration(loadedData.scale);
          if (loadedData.gridSnap !== undefined) setGridSnap(loadedData.gridSnap);
          if (loadedData.gridSize) setGridSize(loadedData.gridSize);
          if (loadedData.canvasWidth) setCanvasWidth(loadedData.canvasWidth);
          if (loadedData.canvasHeight) setCanvasHeight(loadedData.canvasHeight);
          if (loadedData.canvasBackgroundColor) setCanvasBackgroundColor(loadedData.canvasBackgroundColor);
        } else {
          // Document doesn't exist yet in Firestore, try local storage fallback
          try {
            const localData = localStorage.getItem(`casanovia_floor_plan_${activeWeddingId}`);
            if (localData) {
              const parsed = JSON.parse(localData);
              if (parsed.elements) {
                setElements(parsed.elements);
              }
              if (parsed.backgroundImageUrl !== undefined) {
                setBackgroundImageUrl(parsed.backgroundImageUrl || null);
              }
            } else {
              setElements(ensureUniqueTableIdentities(buildFloorPlanFromWedding(tables, guests), tables));
              setBackgroundImageUrl(null);
              setBackgroundFileName(null);
            }
          } catch (e) {
            setElements(ensureUniqueTableIdentities(buildFloorPlanFromWedding(tables, guests), tables));
            setBackgroundImageUrl(null);
            setBackgroundFileName(null);
          }
        }

        setTimeout(() => {
          if (isMounted) isInitialLoadRef.current = false;
        }, 800);
      },
      (error) => {
        console.info('[FloorPlan] Real-time snapshot info:', error);
      }
    );

    const handlePlanCleared = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || customEvent.detail.weddingId === activeWeddingId) {
        setElements([]);
        setBackgroundImageUrl(null);
        setBackgroundFileName(null);
      }
    };
    window.addEventListener('casanovia_floor_plan_cleared', handlePlanCleared);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('casanovia_floor_plan_cleared', handlePlanCleared);
    };
  }, [isOpen, activeWeddingId]);

  // Debounced auto-save to Firestore so changes reflect automatically on all viewing devices
  useEffect(() => {
    if (!isOpen || !activeWeddingId || isInitialLoadRef.current) return;
    if (!elements || elements.length === 0) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        isLocalSavingRef.current = true;
        const docRef = doc(db, 'floor_plans', activeWeddingId);
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
          canvasBackgroundColor,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(`casanovia_floor_plan_${activeWeddingId}`, JSON.stringify(planPayload));
        const firestorePayload: any = cleanFirestoreData(planPayload);
        if (!backgroundImageUrl) {
          firestorePayload.backgroundImageUrl = deleteField();
          firestorePayload.backgroundFileName = deleteField();
        }
        await setDoc(docRef, firestorePayload, { merge: true });
      } catch (err) {
        console.info('[FloorPlan] Auto-sync to Firestore note:', err);
      } finally {
        setTimeout(() => {
          isLocalSavingRef.current = false;
        }, 600);
      }
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    elements,
    backgroundImageUrl,
    backgroundFileName,
    backgroundOpacity,
    scaleCalibration,
    gridSnap,
    gridSize,
    canvasWidth,
    canvasHeight,
    canvasBackgroundColor,
    isOpen,
    activeWeddingId,
  ]);

  const selectedElement = useMemo(
    () => elements.find((e) => e.id === selectedElementId) || null,
    [elements, selectedElementId]
  );

  // Mobile specific view states
  const [selectedGuestIdForMobile, setSelectedGuestIdForMobile] = useState<string>('');
  const [activeMobileProperty, setActiveMobileProperty] = useState<'none' | 'color' | 'seats' | 'size' | 'name'>('none');
  const [mobileTempName, setMobileTempName] = useState<string>('');
  const [mobileTempTableNum, setMobileTempTableNum] = useState<string>('');

  // Reset mobile sub-property and guest selection when selected element changes
  useEffect(() => {
    setSelectedGuestIdForMobile('');
    setActiveMobileProperty('none');
    if (selectedElement) {
      setMobileTempName(selectedElement.name || '');
      setMobileTempTableNum(selectedElement.tableNumber !== undefined ? String(selectedElement.tableNumber) : '');
    } else {
      setMobileTempName('');
      setMobileTempTableNum('');
    }
  }, [selectedElementId]);

  const isSelectedElementTable = useMemo(() => {
    if (!selectedElement) return false;
    return (
      selectedElement.type === 'round_table' ||
      selectedElement.type === 'rectangular_table' ||
      selectedElement.type === 'cake_table' ||
      (selectedElement.seats && selectedElement.seats.length > 0) ||
      selectedElement.tableNumber !== undefined
    );
  }, [selectedElement]);

  const sortedGuests = useMemo(() => {
    return [...guests].sort((a, b) =>
      (a.fullName || '').localeCompare(b.fullName || '', 'es', { sensitivity: 'base' })
    );
  }, [guests]);

  // Helper to assign a guest to the selected table on mobile
  const handleAssignGuestToSelectedTable = async (guestId: string) => {
    if (!selectedElement || !guestId) return;
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;

    // Check capacity first
    const capacityCheck = checkFloorPlanElementCapacityForGroup(selectedElement, guest, guests);
    if (!capacityCheck.canFit) {
      showCapacityWarning(
        capacityCheck.warningMessage ||
          `La mesa "${selectedElement.name}" sobrepasa su capacidad.`
      );
      return;
    }

    const seats = selectedElement.seats || [];
    const freeSeat = seats.find((s) => !s.guestId || s.guestId.trim() === '');
    const targetSeatId = freeSeat ? freeSeat.id : (seats[0]?.id || `seat_${selectedElement.id}_1`);

    await handleAssignGuestToSeat(selectedElement.id, targetSeatId, guest);
    setAssignmentNotice(`¡${guest.fullName} asignado a ${selectedElement.name || `Mesa ${selectedElement.tableNumber || ''}`}!`);
    setTimeout(() => setAssignmentNotice(null), 3500);
    setSelectedGuestIdForMobile('');
  };

  // Helper for adjusting seat count on mobile
  const handleMobileSeatCountChange = (newCount: number) => {
    if (!selectedElement || selectedElement.isLocked) return;
    const count = Math.max(2, Math.min(16, newCount));
    const currentSeats = selectedElement.seats || [];
    let updatedSeats: FloorPlanSeat[] = [...currentSeats];

    if (count > currentSeats.length) {
      for (let i = currentSeats.length + 1; i <= count; i++) {
        updatedSeats.push({
          id: `seat_${selectedElement.id}_${i}_${Date.now()}`,
          seatNumber: i,
        });
      }
    } else if (count < currentSeats.length) {
      updatedSeats = updatedSeats.slice(0, count);
    }

    handleUpdateElement(selectedElement.id, {
      seatCount: count,
      seats: updatedSeats,
    });
  };

  // Helper for adjusting rectangular table seats on mobile
  const handleMobileRectSeatsChange = (deltaLong: number) => {
    if (!selectedElement || selectedElement.isLocked) return;
    const currentLong = selectedElement.seatsLongSide !== undefined ? Math.abs(selectedElement.seatsLongSide) : 3;
    const newLong = Math.max(1, Math.min(8, currentLong + deltaLong));
    const heads = selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1;
    const actualHeadsCount = heads < 0 ? Math.abs(heads) : heads * 2;
    const actualLongCount = newLong * 2;
    const totalCount = actualLongCount + actualHeadsCount;
    const currentSeats = selectedElement.seats || [];
    let updatedSeats: FloorPlanSeat[] = [...currentSeats];

    if (totalCount > currentSeats.length) {
      for (let i = currentSeats.length + 1; i <= totalCount; i++) {
        updatedSeats.push({
          id: `seat_${selectedElement.id}_${i}_${Date.now()}`,
          seatNumber: i,
        });
      }
    } else {
      updatedSeats = updatedSeats.slice(0, totalCount);
    }

    handleUpdateElement(selectedElement.id, {
      seatsLongSide: newLong,
      seatsHead: heads,
      seatCount: totalCount,
      seats: updatedSeats,
    });
  };

  // Helper for adjusting element dimensions on mobile
  const handleMobileSizeChange = (delta: number) => {
    if (!selectedElement || selectedElement.isLocked) return;
    if (selectedElement.type === 'round_table' || selectedElement.type === 'cake_table') {
      const currentR = selectedElement.radius || 60;
      const newR = Math.max(30, Math.min(200, currentR + delta));
      handleUpdateElement(selectedElement.id, { radius: newR });
    } else {
      const currentW = selectedElement.width || 120;
      const currentH = selectedElement.height || 80;
      const aspect = currentH / (currentW || 1);
      const newW = Math.max(40, Math.min(600, currentW + delta * 2));
      const newH = Math.max(30, Math.min(400, Math.round(newW * aspect)));
      handleUpdateElement(selectedElement.id, { width: newW, height: newH });
    }
  };

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
      case 'rug':
        newElem = {
          id: newId,
          type: 'rug',
          name: 'Alfombra',
          x: spawnX,
          y: spawnY,
          width: 220,
          height: 120,
          rotation: 0,
          seats: [],
          color: '#DC2626', // Red by default as requested
          textColor: '#FFFFFF',
          zIndex: 1,
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
      prev.map((elem) => {
        if (elem.id !== id) return elem;
        // Si el objeto está bloqueado, rechazar cualquier cambio salvo conmutar el bloqueo (isLocked)
        if (elem.isLocked && updates.isLocked === undefined) {
          return elem;
        }
        return { ...elem, ...updates };
      })
    );

    // Synchronize manual element name/capacity updates to Banquet Table (Asignación de Mesas)
    if ((updates.name !== undefined && updates.name.trim() !== '') || updates.seatCount !== undefined) {
      const targetElem = elements.find((e) => e.id === id);
      if (targetElem && (targetElem.type === 'round_table' || targetElem.type === 'rectangular_table')) {
        const matchedTable = tables.find(
          (t) =>
            t.id === (targetElem as any).tableId ||
            id === `elem_table_${t.id}` ||
            id === t.id ||
            t.name.trim().toLowerCase() === targetElem.name?.trim().toLowerCase()
        );
        if (matchedTable) {
          const newName = updates.name !== undefined ? updates.name.trim() : matchedTable.name;
          const newCap = updates.seatCount !== undefined ? updates.seatCount : matchedTable.capacity;
          if (newName !== matchedTable.name || newCap !== matchedTable.capacity) {
            updateTable(matchedTable.id, {
              name: newName,
              capacity: newCap,
            }).catch((err) => console.warn('[FloorPlan] Sync to table error:', err));
          }
        }
      }
    }
  };

  const handleDuplicateElement = (id: string) => {
    const elem = elements.find((e) => e.id === id);
    if (!elem || elem.isLocked) return;

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
    const elem = elements.find((e) => e.id === id);
    if (elem?.isLocked) return;
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleBringToFront = (id: string) => {
    const elem = elements.find((e) => e.id === id);
    if (elem?.isLocked) return;
    const maxZ = Math.max(...elements.map((e) => e.zIndex || 0), 0);
    handleUpdateElement(id, { zIndex: maxZ + 1 });
  };

  const handleSendToBack = (id: string) => {
    const elem = elements.find((e) => e.id === id);
    if (elem?.isLocked) return;
    const minZ = Math.min(...elements.map((e) => e.zIndex || 0), 0);
    handleUpdateElement(id, { zIndex: minZ - 1 });
  };

  // Atajos de teclado: Suprimir/Delete para borrar, Flechas de dirección para mover, Ctrl+Z/Y, Ctrl+D duplicar, Escape deseleccionar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en algún campo de formulario
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        targetTag === 'select' ||
        (e.target as HTMLElement)?.isContentEditable;

      if (isInput) return;

      // 1. Deshacer (Ctrl+Z / Cmd+Z) y Rehacer (Ctrl+Shift+Z, Ctrl+Y)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // 2. Acciones sobre el objeto seleccionado
      if (selectedElementId) {
        const selectedObj = elements.find((elem) => elem.id === selectedElementId);

        // Borrar con Suprimir (Delete / Del / Backspace)
        if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Del') {
          if (selectedObj && !selectedObj.isLocked) {
            e.preventDefault();
            handleDeleteElement(selectedElementId);
            return;
          }
        }

        // Mover con las flechas de dirección (ArrowUp, ArrowDown, ArrowLeft, ArrowRight)
        if (
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight'
        ) {
          if (selectedObj && !selectedObj.isLocked) {
            e.preventDefault();
            // Desplazamiento: 20px con Shift, 5px normal, 1px con Alt para micro-ajuste
            const step = e.shiftKey ? 20 : e.altKey ? 1 : 5;
            let dx = 0;
            let dy = 0;
            if (e.key === 'ArrowLeft') dx = -step;
            else if (e.key === 'ArrowRight') dx = step;
            else if (e.key === 'ArrowUp') dy = -step;
            else if (e.key === 'ArrowDown') dy = step;

            setElements((prev) =>
              prev.map((el) => {
                if (el.id !== selectedElementId || el.isLocked) return el;
                return {
                  ...el,
                  x: Math.round(el.x + dx),
                  y: Math.round(el.y + dy),
                };
              })
            );
            return;
          }
        }

        // Duplicar con Ctrl+D / Cmd+D
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
          if (selectedObj && !selectedObj.isLocked) {
            e.preventDefault();
            handleDuplicateElement(selectedElementId);
            return;
          }
        }

        // Bloquear / Desbloquear con tecla L
        if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) {
          if (selectedObj) {
            e.preventDefault();
            handleUpdateElement(selectedElementId, { isLocked: !selectedObj.isLocked });
            return;
          }
        }

        // Deseleccionar con Escape
        if (e.key === 'Escape') {
          e.preventDefault();
          setSelectedElementId(null);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedElementId, elements]);

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

  // Borrar plano PDF o imagen importada
  const handleDeleteBackgroundImage = async () => {
    setBackgroundImageUrl(undefined);
    setBackgroundFileName(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (activeWeddingId) {
      try {
        const localKey = `casanovia_floor_plan_${activeWeddingId}`;
        const localData = localStorage.getItem(localKey);
        if (localData) {
          const parsed = JSON.parse(localData);
          delete parsed.backgroundImageUrl;
          delete parsed.backgroundFileName;
          localStorage.setItem(localKey, JSON.stringify(parsed));
        }

        const docRef = doc(db, 'floor_plans', activeWeddingId);
        await setDoc(
          docRef,
          {
            backgroundImageUrl: deleteField(),
            backgroundFileName: deleteField(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Error al borrar plano importado en almacenamiento:', err);
      }
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
  const handleSyncWithWedding = async () => {
    const synced = ensureUniqueTableIdentities(buildFloorPlanFromWedding(tables, guests, elements), tables);
    setElements(synced);
    setSyncSuccessNotice(true);
    setTimeout(() => setSyncSuccessNotice(false), 3500);

    // Persist immediately to Firestore so other devices see the synchronized distribution in real-time
    if (activeWeddingId) {
      try {
        isLocalSavingRef.current = true;
        const docRef = doc(db, 'floor_plans', activeWeddingId);
        const planPayload: WeddingFloorPlan = {
          id: activeWeddingId,
          weddingId: activeWeddingId,
          backgroundImageUrl,
          backgroundFileName,
          backgroundOpacity,
          scale: scaleCalibration,
          elements: synced,
          gridSnap,
          gridSize,
          canvasWidth,
          canvasHeight,
          canvasBackgroundColor,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`casanovia_floor_plan_${activeWeddingId}`, JSON.stringify(planPayload));
        const firestorePayload: any = cleanFirestoreData(planPayload);
        if (!backgroundImageUrl) {
          firestorePayload.backgroundImageUrl = deleteField();
          firestorePayload.backgroundFileName = deleteField();
        }
        await setDoc(docRef, firestorePayload, { merge: true });
      } catch (err) {
        console.warn('Error sincronizando plano con Firestore:', err);
      } finally {
        setTimeout(() => {
          isLocalSavingRef.current = false;
        }, 600);
      }
    }
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
      canvasBackgroundColor,
      updatedAt: new Date().toISOString(),
    };

    try {
      isLocalSavingRef.current = true;
      // Save locally
      localStorage.setItem(`casanovia_floor_plan_${activeWeddingId}`, JSON.stringify(planPayload));

      // Save in Firestore
      const docRef = doc(db, 'floor_plans', activeWeddingId);
      const firestorePayload: any = cleanFirestoreData(planPayload);
      if (!backgroundImageUrl) {
        firestorePayload.backgroundImageUrl = deleteField();
        firestorePayload.backgroundFileName = deleteField();
      }
      await setDoc(docRef, firestorePayload, { merge: true });

      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err) {
      console.warn('Error guardando plano en Firestore:', err);
      // Still notify success because local persistence succeeded
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        isLocalSavingRef.current = false;
      }, 600);
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
      canvasBackgroundColor,
      updatedAt: new Date().toISOString(),
    };

    try {
      await exportFloorPlanToPdf({
        plan: planPayload,
        settings,
        canvasElement: canvas,
        weddingTitle,
        exportMode: mode,
        registeredTables: tables,
        guests: guests,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#EBEBEB] select-none animate-in fade-in duration-200">
      
      {/* 1. TOP MASTER HEADER BAR */}
      <div className={`relative flex flex-col md:flex-row md:items-center justify-between bg-[#EBEBEB] z-[70] transition-all duration-300 ${showMobileTopBar || showExportMenu ? 'h-auto pb-3 md:pb-0 overflow-visible' : 'h-14 overflow-hidden md:overflow-visible'}`}>
        
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 w-full md:w-auto shrink-0">
          {/* Mobile Screen Title (Hidden on desktop - Replaces Event Selector on Mobile) */}
          <div className="md:hidden flex items-center space-x-2">
            <span className="font-serif font-bold text-sm text-gray-800">
              Plano de Mesas
            </span>
          </div>

          {/* Left: Brand & Wedding Selector (Only visible on Desktop/Tablet - Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative" ref={weddingDropdownRef}>
              <button
                type="button"
                onClick={() => accessibleWeddings && accessibleWeddings.length > 1 && setWeddingDropdownOpen(!weddingDropdownOpen)}
                className={`flex items-center space-x-2.5 text-left border-none bg-transparent ${accessibleWeddings && accessibleWeddings.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="w-9 h-9 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-800 flex items-center justify-center font-serif font-bold text-sm shrink-0">
                  {weddingTitle.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h1 className="font-bold text-xs sm:text-sm text-gray-800 font-serif">
                      {weddingTitle}
                    </h1>
                    {accessibleWeddings && accessibleWeddings.length > 1 && (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                    {scaleCalibration.isCalibrated && (
                      <span className="text-emerald-700 font-semibold hidden sm:inline">
                        📏 1m = {scaleCalibration.pixelsPerMeter.toFixed(1)}px
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {weddingDropdownOpen && accessibleWeddings && accessibleWeddings.length > 1 && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#EBEBEB] rounded-2xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] z-[90] overflow-hidden py-1 border border-stone-200">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Seleccionar Evento
                  </div>
                  {accessibleWeddings.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        selectWedding(w.id);
                        setWeddingDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors border-none cursor-pointer ${
                        w.id === activeWeddingId
                          ? 'bg-gray-200 text-gray-900 font-bold'
                          : 'bg-transparent text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate">{w.coupleNames}</span>
                      {w.id === activeWeddingId && <span className="text-emerald-600 font-bold ml-1">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">

            {/* Canvas Dimensions Editor */}
            <div className="hidden md:flex items-center space-x-1.5 bg-[#EBEBEB] px-2.5 py-1 rounded-2xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Lienzo</span>
              <input 
                type="number" 
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value) || 1600)}
                className="w-14 h-6 px-1 text-xs bg-[#EBEBEB] rounded-lg shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800 focus:outline-hidden text-center border-none"
                title="Ancho del lienzo (px)"
              />
              <span className="text-xs text-gray-400 font-bold">x</span>
              <input 
                type="number" 
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value) || 1200)}
                className="w-14 h-6 px-1 text-xs bg-[#EBEBEB] rounded-lg shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800 focus:outline-hidden text-center border-none"
                title="Alto del lienzo (px)"
              />
            </div>

            {/* Canvas Background Color Editor */}
            <div 
              className="hidden md:flex items-center space-x-1.5 bg-[#EBEBEB] px-2.5 py-1 rounded-2xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
              title="Color de fondo del lienzo"
            >
              <Palette className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Fondo</span>
              <label className="relative flex items-center justify-center w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] overflow-hidden border border-gray-300 shrink-0">
                <span
                  className="w-full h-full block"
                  style={{ backgroundColor: canvasBackgroundColor }}
                />
                <input
                  type="color"
                  value={canvasBackgroundColor}
                  onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  title="Seleccionar color de fondo del lienzo"
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Mobile Handle & Close */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={() => setShowMobileTopBar(!showMobileTopBar)}
            className="p-2 text-gray-700 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl transition-all"
          >
            {showMobileTopBar ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl transition-all cursor-pointer"
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
              className="p-1.5 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-700 transition-all disabled:opacity-40 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed border-none"
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={history.future.length === 0}
              className="p-1.5 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-700 transition-all disabled:opacity-40 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed border-none"
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Sync Tables & Guests button */}
          <div className="flex items-center bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-0.5 border-none">
            <button
              onClick={() => setSyncConfirmAction('manual')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                syncSuccessNotice
                  ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-emerald-600'
                  : 'hover:text-gray-900 active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-700'
              }`}
              title="Sincronizar mesas y asientos con la distribución actual de invitados y acompañantes"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-700 ${syncSuccessNotice ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="font-bold">
                {syncSuccessNotice ? '¡Sincronizado!' : 'Sincronizar Mesas'}
              </span>
            </button>
            <div className="w-px h-5 bg-gray-300"></div>
            <label className="flex items-center space-x-1 px-2 py-1.5 cursor-pointer rounded-xl transition-colors hover:text-gray-900" title="Sincronización Automática al cargar">
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
                className="w-3 h-3 text-gray-800 rounded focus:ring-0 cursor-pointer"
              />
              <span className="text-[10px] font-bold text-gray-500">Auto</span>
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
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-xs font-semibold text-gray-700 border-none transition-all cursor-pointer disabled:opacity-50"
            title="Importar plano de local desde PDF o Imagen"
          >
            {isProcessingPdf ? (
              <Loader2 className="w-3.5 h-3.5 text-gray-700 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-gray-700" />
            )}
            <span className="hidden sm:inline">Importar Plano (PDF)</span>
          </button>

          {/* Botón para borrar plano PDF importado */}
          {backgroundImageUrl && (
            <button
              id="btn-delete-imported-floorplan"
              type="button"
              onClick={handleDeleteBackgroundImage}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-rose-600 hover:text-rose-800 border-none transition-all cursor-pointer"
              title="Borrar plano PDF importado"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Borrar Plano Importado</span>
            </button>
          )}

          {/* Calibrate Scale button */}
          <button
            onClick={() => setIsCalibratingScale((c) => !c)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-[#EBEBEB] text-xs font-semibold text-gray-700 border-none transition-all cursor-pointer ${
              isCalibratingScale
                ? 'shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-amber-800'
                : 'shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]'
            }`}
            title="Trazar una línea de referencia para calibrar escala en metros"
          >
            <Ruler className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Calibrar Escala</span>
          </button>

          {/* PHP Endpoints & SQL view button */}
          {isLevel1Admin && (
            <button
              onClick={() => setShowPhpSqlModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-700 text-xs font-semibold border-none transition-all cursor-pointer"
              title="Ver endpoints PHP y SQL"
            >
              <Server className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden lg:inline">Endpoints PHP</span>
            </button>
          )}

          {/* Toggle Guest List Sidebar (Desktop/Tablet) */}
          <button
            onClick={() => {
              setShowRightSidebar((s) => {
                const next = !s;
                if (next && window.innerWidth <= 768) setShowLeftSidebar(false);
                return next;
              });
            }}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border-none transition-all cursor-pointer ${
              showRightSidebar
                ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-amber-800'
                : 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-700'
            }`}
            title={showRightSidebar ? "Ocultar panel de invitados" : "Ver lista de invitados y mesas"}
          >
            <Users className="w-3.5 h-3.5 text-gray-700" />
            <span className="hidden sm:inline">Invitados</span>
          </button>

          {/* Export PDF */}
          <div className="relative" ref={exportMenuRef}>
            <button
              id="btn-export-floorplan"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-xs font-semibold text-gray-700 border-none transition-all cursor-pointer"
              title="Exportar plano y distribución de invitados"
            >
              <FileDown className="w-3.5 h-3.5 text-gray-700" />
              <span className="hidden sm:inline">Exportar plano</span>
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] rounded-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1 border-none p-1.5">
                <div className="flex flex-col space-y-1">
                  <button 
                    id="btn-export-plan-only"
                    onClick={() => { setShowExportMenu(false); handleExportPdf('plan_only'); }} 
                    className="text-left px-3 py-2 text-xs font-semibold text-gray-800 hover:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-xl transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <span className="text-base">🖼️</span>
                    <div>
                      <div className="font-bold">Solo plano de Distribución</div>
                      <div className="text-[10px] text-gray-500 font-normal">Ajustado 100% en A4 horizontal, fondo blanco</div>
                    </div>
                  </button>
                  <button 
                    id="btn-export-list-only"
                    onClick={() => { setShowExportMenu(false); handleExportPdf('list_only'); }} 
                    className="text-left px-3 py-2 text-xs font-semibold text-gray-800 hover:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-xl transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <span className="text-base">👥</span>
                    <div>
                      <div className="font-bold">Solo Lista de Invitados</div>
                      <div className="text-[10px] text-gray-500 font-normal">Mesas y asientos detallados</div>
                    </div>
                  </button>
                  <button 
                    id="btn-export-all"
                    onClick={() => { setShowExportMenu(false); handleExportPdf('all'); }} 
                    className="text-left px-3 py-2 text-xs font-semibold text-gray-800 hover:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-xl transition-all cursor-pointer flex items-center space-x-2 pt-1.5"
                  >
                    <span className="text-base">📄</span>
                    <div>
                      <div className="font-bold">Todo (Plano + Lista)</div>
                      <div className="text-[10px] text-gray-500 font-normal">Documento completo de montaje</div>
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
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-900 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 border-none"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccessNotice ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Save className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span className="hidden sm:inline">{saveSuccessNotice ? '¡Guardado!' : 'Guardar Plano'}</span>
          </button>

          {/* Close modal */}
          <button
            onClick={onClose}
            className="hidden md:flex p-2 text-gray-600 hover:text-gray-900 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl transition-all cursor-pointer ml-1 border-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      </div>

      {/* 1b. BARRA DESPLEGABLE DE INVITADOS PARA VISTA MÓVIL AL SELECCIONAR UNA MESA */}
      {isSelectedElementTable && (
        <div className="md:hidden w-full bg-[#EBEBEB] px-4 py-2.5 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] z-40 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-800">
                {selectedElement?.name || `Mesa ${selectedElement?.tableNumber !== undefined ? selectedElement.tableNumber : ''}`}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] text-gray-600">
                {selectedElement?.seats?.filter((s) => Boolean(s.guestId)).length || 0} / {selectedElement?.seats?.length || 0} sillas
              </span>
            </div>
            <button
              onClick={() => setSelectedElementId(null)}
              className="p-1 text-gray-500 hover:text-gray-800 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
              title="Deseleccionar mesa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Barra desplegable con solo los nombres de invitados */}
            <div className="relative flex-1">
              <select
                value={selectedGuestIdForMobile}
                onChange={(e) => setSelectedGuestIdForMobile(e.target.value)}
                className="w-full bg-[#EBEBEB] text-gray-800 text-xs font-semibold py-2 px-3 pr-8 rounded-xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border-none focus:outline-hidden appearance-none cursor-pointer"
              >
                <option value="">Seleccionar invitado...</option>
                {sortedGuests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Opción para asignar a la mesa cuando se seleccione uno */}
            {selectedGuestIdForMobile && (
              <button
                onClick={() => handleAssignGuestToSelectedTable(selectedGuestIdForMobile)}
                className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-emerald-800 border-none transition-all cursor-pointer hover:scale-105"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Asignar a mesa</span>
              </button>
            )}
          </div>
        </div>
      )}

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
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-40 items-center space-x-1.5 bg-[#EBEBEB] p-2 rounded-full shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border-none ${selectedElement ? 'hidden md:flex' : 'flex'}`}>
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.15, 3.5))}
            className="p-2 text-gray-700 hover:text-gray-900 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all border-none cursor-pointer"
            title="Acercar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-gray-800 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(z * 0.85, 0.25))}
            className="p-2 text-gray-700 hover:text-gray-900 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all border-none cursor-pointer"
            title="Alejar (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 text-gray-700 hover:text-gray-900 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all border-none cursor-pointer"
            title="Restablecer vista"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button
            onClick={() => setCanvasRotation((r) => (r + 90) % 360)}
            className="p-2 text-gray-700 hover:text-gray-900 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center border-none cursor-pointer"
            title="Girar Plano 90°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="relative flex items-center">
            <input
              type="number"
              value={canvasRotation}
              onChange={(e) => setCanvasRotation(Number(e.target.value))}
              className="w-10 h-7 bg-[#EBEBEB] text-xs font-mono font-bold text-gray-800 text-center rounded-lg shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border-none focus:outline-hidden"
              title="Giro del plano (grados)"
            />
            <span className="absolute right-1 text-[10px] font-bold text-gray-500 pointer-events-none">°</span>
          </div>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button
            onClick={() => setGridSnap((s) => !s)}
            className={`p-2 rounded-full transition-all flex items-center justify-center border-none cursor-pointer ${
              gridSnap
                ? 'bg-[#EBEBEB] text-gray-900 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]'
                : 'bg-[#EBEBEB] text-gray-500 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
            }`}
            title="Ajustar a la cuadrícula"
          >
            <Magnet className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <label
            className="p-2 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center justify-center cursor-pointer relative"
            title="Cambiar color del lienzo"
          >
            <span
              className="w-4 h-4 rounded-full border border-gray-400/60 shadow-xs"
              style={{ backgroundColor: canvasBackgroundColor }}
            />
            <input
              type="color"
              value={canvasBackgroundColor}
              onChange={(e) => setCanvasBackgroundColor(e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              title="Color de fondo del lienzo"
            />
          </label>
        </div>

        {/* Mobile Object Properties Bar (Footer) */}
        {selectedElement && (
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-[96vw]">
            {/* Popovers for individual properties */}
            {activeMobileProperty === 'color' && (
              <div className="bg-[#EBEBEB] p-2 rounded-2xl shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] flex items-center space-x-2 overflow-x-auto max-w-[90vw] animate-in fade-in zoom-in-95">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => {
                      if (!selectedElement.isLocked) {
                        handleUpdateElement(selectedElement.id, { color: col.bg, textColor: col.text });
                      }
                    }}
                    title={col.name}
                    style={{ backgroundColor: col.bg }}
                    className={`w-7 h-7 rounded-full border border-gray-300 shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] shrink-0 transition-transform active:scale-95 cursor-pointer ${
                      selectedElement.color === col.bg ? 'ring-2 ring-gray-800 ring-offset-2' : ''
                    }`}
                  />
                ))}
              </div>
            )}

            {activeMobileProperty === 'seats' && (
              <div className="bg-[#EBEBEB] p-2.5 px-4 rounded-2xl shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] flex items-center space-x-4 animate-in fade-in zoom-in-95">
                <span className="text-xs font-bold text-gray-700">
                  {selectedElement.type === 'rectangular_table'
                    ? `Largo: ${selectedElement.seatsLongSide !== undefined ? Math.abs(selectedElement.seatsLongSide) : 3} por lado`
                    : `${selectedElement.seats?.length || selectedElement.seatCount || 8} Sillas`}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (selectedElement.type === 'rectangular_table') {
                        handleMobileRectSeatsChange(-1);
                      } else {
                        handleMobileSeatCountChange((selectedElement.seats?.length || selectedElement.seatCount || 8) - 1);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-800 font-bold cursor-pointer border-none"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedElement.type === 'rectangular_table') {
                        handleMobileRectSeatsChange(1);
                      } else {
                        handleMobileSeatCountChange((selectedElement.seats?.length || selectedElement.seatCount || 8) + 1);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-800 font-bold cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeMobileProperty === 'size' && (
              <div className="bg-[#EBEBEB] p-2.5 px-4 rounded-2xl shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] flex items-center space-x-4 animate-in fade-in zoom-in-95">
                <span className="text-xs font-bold text-gray-700">
                  {selectedElement.type === 'round_table' || selectedElement.type === 'cake_table'
                    ? `Radio: ${Math.round(selectedElement.radius || 60)}px`
                    : `${Math.round(selectedElement.width || 120)} × ${Math.round(selectedElement.height || 80)}px`}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMobileSizeChange(-10)}
                    className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-800 font-bold cursor-pointer border-none"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMobileSizeChange(10)}
                    className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-800 font-bold cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeMobileProperty === 'name' && (
              <div className="bg-[#EBEBEB] p-2.5 px-3 rounded-2xl shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] flex items-center space-x-2 animate-in fade-in zoom-in-95">
                <input
                  type="text"
                  value={mobileTempName}
                  onChange={(e) => setMobileTempName(e.target.value)}
                  placeholder="Nombre..."
                  className="w-32 bg-[#EBEBEB] text-gray-900 text-xs px-2.5 py-1.5 rounded-xl shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] focus:outline-hidden"
                />
                {(selectedElement.type === 'round_table' || selectedElement.type === 'rectangular_table') && (
                  <input
                    type="number"
                    value={mobileTempTableNum}
                    onChange={(e) => setMobileTempTableNum(e.target.value)}
                    placeholder="#"
                    className="w-14 bg-[#EBEBEB] text-gray-900 text-xs px-2 py-1.5 rounded-xl shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] focus:outline-hidden text-center"
                  />
                )}
                <button
                  onClick={() => {
                    handleUpdateElement(selectedElement.id, {
                      name: mobileTempName.trim() || undefined,
                      tableNumber: mobileTempTableNum ? parseInt(mobileTempTableNum, 10) : undefined,
                    });
                    setActiveMobileProperty('none');
                  }}
                  className="p-1.5 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-emerald-700 hover:text-emerald-900 cursor-pointer border-none"
                  title="Guardar nombre"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Primary Action Icons Bar */}
            <div className="flex items-center space-x-1.5 bg-[#EBEBEB] p-1.5 px-3 rounded-2xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] overflow-x-auto max-w-full">
              {/* Rotate 45° */}
              <button
                onClick={() => {
                  if (selectedElement.isLocked) return;
                  handleUpdateElement(selectedElement.id, {
                    rotation: ((selectedElement.rotation || 0) + 45) % 360,
                  });
                  setActiveMobileProperty('none');
                }}
                disabled={selectedElement.isLocked}
                className="p-2 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 disabled:opacity-40 transition-all cursor-pointer border-none shrink-0"
                title="Girar 45°"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Seats count (if table or chair row) */}
              {(selectedElement.type === 'round_table' || selectedElement.type === 'rectangular_table' || (selectedElement.seats && selectedElement.seats.length > 0)) && (
                <button
                  onClick={() => setActiveMobileProperty(activeMobileProperty === 'seats' ? 'none' : 'seats')}
                  disabled={selectedElement.isLocked}
                  className={`p-2 rounded-xl bg-[#EBEBEB] text-gray-700 disabled:opacity-40 transition-all cursor-pointer border-none shrink-0 ${
                    activeMobileProperty === 'seats'
                      ? 'shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900'
                      : 'shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                  }`}
                  title="Sillas / Capacidad"
                >
                  <Armchair className="w-4 h-4" />
                </button>
              )}

              {/* Size */}
              <button
                onClick={() => setActiveMobileProperty(activeMobileProperty === 'size' ? 'none' : 'size')}
                disabled={selectedElement.isLocked}
                className={`p-2 rounded-xl bg-[#EBEBEB] text-gray-700 disabled:opacity-40 transition-all cursor-pointer border-none shrink-0 ${
                  activeMobileProperty === 'size'
                    ? 'shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900'
                    : 'shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                }`}
                title="Dimensiones / Tamaño"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Color */}
              <button
                onClick={() => setActiveMobileProperty(activeMobileProperty === 'color' ? 'none' : 'color')}
                disabled={selectedElement.isLocked}
                className={`p-2 rounded-xl bg-[#EBEBEB] text-gray-700 disabled:opacity-40 transition-all cursor-pointer border-none shrink-0 ${
                  activeMobileProperty === 'color'
                    ? 'shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900'
                    : 'shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                }`}
                title="Color del objeto"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* Name / Table Number */}
              <button
                onClick={() => setActiveMobileProperty(activeMobileProperty === 'name' ? 'none' : 'name')}
                disabled={selectedElement.isLocked}
                className={`p-2 rounded-xl bg-[#EBEBEB] text-gray-700 disabled:opacity-40 transition-all cursor-pointer border-none shrink-0 ${
                  activeMobileProperty === 'name'
                    ? 'shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900'
                    : 'shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                }`}
                title="Nombre y número"
              >
                <Type className="w-4 h-4" />
              </button>

              {/* Lock / Unlock */}
              <button
                onClick={() => {
                  handleUpdateElement(selectedElement.id, { isLocked: !selectedElement.isLocked });
                  setActiveMobileProperty('none');
                }}
                className="p-2 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer border-none shrink-0"
                title={selectedElement.isLocked ? 'Desbloquear objeto' : 'Bloquear objeto'}
              >
                {selectedElement.isLocked ? (
                  <Lock className="w-4 h-4 text-amber-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Bring to Front */}
              <button
                onClick={() => handleBringToFront(selectedElement.id)}
                className="p-2 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 transition-all cursor-pointer border-none shrink-0"
                title="Traer al frente"
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Duplicate */}
              <button
                onClick={() => handleDuplicateElement(selectedElement.id)}
                className="p-2 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 transition-all cursor-pointer border-none shrink-0"
                title="Duplicar"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                onClick={() => {
                  handleDeleteElement(selectedElement.id);
                  setSelectedElementId(null);
                  setActiveMobileProperty('none');
                }}
                className="p-2 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-rose-600 transition-all cursor-pointer border-none shrink-0"
                title="Eliminar objeto"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-gray-300 mx-0.5 shrink-0" />

              {/* Close/Deselect */}
              <button
                onClick={() => {
                  setSelectedElementId(null);
                  setActiveMobileProperty('none');
                }}
                className="p-2 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-500 hover:text-gray-900 transition-all cursor-pointer border-none shrink-0"
                title="Cerrar y restablecer zoom"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Left Sidebar: Furniture & Properties (Desktop/Tablet) */}
        <div className={`hidden md:flex md:relative z-50 h-full transition-all duration-300 shadow-2xl md:shadow-none ${showLeftSidebar ? 'translate-x-0 md:ml-0' : '-translate-x-full md:translate-x-0 md:-ml-80'}`}>
          <FloorPlanToolbar
          selectedElement={selectedElement}
          tables={tables}
          guests={guests}
          elements={elements}
          canvasBackgroundColor={canvasBackgroundColor}
          onChangeCanvasBackgroundColor={setCanvasBackgroundColor}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onChangeCanvasDimensions={(w, h) => {
            setCanvasWidth(w);
            setCanvasHeight(h);
          }}
          onAddElement={handleAddElement}
          onAddTableFromWedding={handleAddTableFromWedding}
          onLinkTableToElement={handleLinkTableToElement}
          onUpdateElement={handleUpdateElement}
          onDuplicateElement={handleDuplicateElement}
          onDeleteElement={handleDeleteElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
        />
          {/* Collapse Handle Left (when open) */}
          {showLeftSidebar && (
            <button
              id="btn-collapse-left-sidebar"
              onClick={() => {
                setShowLeftSidebar(false);
              }}
              className="hidden md:flex absolute -right-9 bottom-4 w-9 h-14 bg-[#EBEBEB] rounded-r-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] items-center justify-center cursor-pointer z-50 border-none transition-all group"
              title="Contraer panel de herramientas"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Floating Expand Left Sidebar Handle (when collapsed, at footer height) */}
        {!showLeftSidebar && (
          <button
            id="btn-expand-left-sidebar"
            onClick={() => {
              setShowLeftSidebar(true);
              if (window.innerWidth <= 768) setShowRightSidebar(false);
            }}
            className="hidden md:flex absolute left-0 bottom-4 w-9 h-14 bg-[#EBEBEB] rounded-r-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] items-center justify-center cursor-pointer z-50 border-none transition-all group"
            title="Expandir catálogo y propiedades"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Center: Interactive Canvas */}
        <div ref={canvasContainerRef} className="flex-1 min-w-0 h-full relative">


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
            canvasBackgroundColor={canvasBackgroundColor}
            draggedGuest={draggedGuest}
            guests={guests}
            onSeatClick={(elemId, seat, pos) => {
              setActiveSeatPicker({ elementId: elemId, seat, screenPos: pos });
            }}
          />

          {/* Background Image Opacity Slider Control (if background loaded) */}
          {backgroundImageUrl && (
            <div className="absolute bottom-4 right-14 z-20 bg-[#EBEBEB]/95 backdrop-blur-xs p-2 rounded-xl shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] border border-transparent flex items-center space-x-2 text-xs">
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
                type="button"
                onClick={handleDeleteBackgroundImage}
                className="flex items-center space-x-1 text-rose-600 hover:text-rose-800 text-[10px] font-bold p-1 cursor-pointer transition-colors border-none bg-transparent"
                title="Borrar plano PDF importado"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden xs:inline">Borrar</span>
              </button>
            </div>
          )}
        </div>

        {/* Floating Expand Right Sidebar Handle (when collapsed, at footer height) */}
        {!showRightSidebar && (
          <button
            id="btn-expand-right-sidebar"
            onClick={() => {
              setShowRightSidebar(true);
              if (window.innerWidth <= 768) setShowLeftSidebar(false);
            }}
            className="hidden md:flex absolute right-0 bottom-4 w-9 h-14 bg-[#EBEBEB] rounded-l-2xl shadow-[-6px_6px_12px_#d1d1d1,6px_-6px_12px_#ffffff] hover:shadow-[-10px_10px_20px_#c8c8c8,10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] items-center justify-center cursor-pointer z-50 border-none transition-all group"
            title="Expandir lista de invitados y mesas"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Right Sidebar: Seating Guest List */}
        <div className={`hidden md:flex md:relative z-50 h-full transition-all duration-300 shadow-2xl md:shadow-none ${showRightSidebar ? 'translate-x-0 md:mr-0 pointer-events-auto' : 'translate-x-full md:translate-x-0 md:-mr-80 pointer-events-none'}`}>
          {/* Collapse Handle Right (when open) */}
          {showRightSidebar && (
            <button
              id="btn-collapse-right-sidebar"
              onClick={() => {
                setShowRightSidebar(false);
              }}
              className="hidden md:flex absolute -left-9 bottom-4 w-9 h-14 bg-[#EBEBEB] rounded-l-2xl shadow-[-6px_6px_12px_#d1d1d1,6px_-6px_12px_#ffffff] hover:shadow-[-10px_10px_20px_#c8c8c8,10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] items-center justify-center cursor-pointer z-50 border-none transition-all group"
              title="Contraer lista de invitados"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
            </button>
          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#EBEBEB] w-full max-w-md rounded-3xl p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border-none space-y-4 text-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-amber-600 flex items-center justify-center">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base font-serif text-gray-800">Calibrar Escala del Plano</h3>
                <p className="text-xs text-gray-500">
                  Línea trazada: <strong className="text-gray-800">{tempDrawnPixelDist.toFixed(0)} píxeles</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Distancia Real de esta pared / objeto (Metros)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={calibrationRealMetersInput}
                  onChange={(e) => setCalibrationRealMetersInput(e.target.value)}
                  className="w-full pl-4 pr-16 py-2.5 bg-[#EBEBEB] shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] rounded-2xl border-none text-sm font-bold text-gray-800 focus:outline-hidden"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                  metros
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Resultado: 1 metro equivaldrá a {(tempDrawnPixelDist / (parseFloat(calibrationRealMetersInput) || 1)).toFixed(1)} px.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowCalibrationPrompt(false)}
                className="px-4 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs font-semibold text-gray-700 transition-all border-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={applyCalibrationScale}
                className="px-5 py-2 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-900 text-xs font-bold transition-all border-none cursor-pointer"
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
          <div className="bg-[#EBEBEB] w-full max-w-sm rounded-3xl p-5 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border-none space-y-3 text-gray-800 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-1">
              <div className="font-bold text-sm text-gray-800">
                <span>Asiento #{activeSeatPicker.seat.seatNumber}</span>
              </div>
              <button
                onClick={() => setActiveSeatPicker(null)}
                className="p-1.5 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-600 hover:text-gray-900 border-none transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeSeatPicker.seat.guestId ? (
              <div className="p-3 bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Invitado Asignado:</span>
                  <span className="text-[10px] text-gray-500">Ocupado</span>
                </div>
                <p className="font-bold text-sm text-gray-900">{activeSeatPicker.seat.guestName}</p>
                <button
                  onClick={() => {
                    handleUnassignGuestFromSeat(activeSeatPicker.elementId, activeSeatPicker.seat.id);
                    setActiveSeatPicker(null);
                  }}
                  className="w-full py-1.5 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-rose-600 font-bold text-xs transition-all cursor-pointer border-none"
                >
                  Desasignar Asiento
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Selecciona un invitado disponible para este asiento:</p>
            )}

            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-60 pr-1">
              {guests.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    handleAssignGuestToSeat(activeSeatPicker.elementId, activeSeatPicker.seat.id, g);
                    setActiveSeatPicker(null);
                  }}
                  className="w-full text-left p-2.5 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all flex items-center justify-between text-xs cursor-pointer group border-none"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-gray-800 group-hover:text-gray-900 truncate">
                      {g.fullName}
                    </div>
                    {g.assignedTable && (
                      <div className="text-[10px] text-gray-500 truncate">
                        {g.assignedTable}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#EBEBEB] p-6 rounded-3xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] w-80 max-w-[90vw] text-center border-none">
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">¿Está seguro/a?</h3>
            <p className="text-sm text-gray-600 mb-6">
              {syncConfirmAction === 'manual' 
                ? 'Esto actualizará las mesas en el plano para que coincidan con la lista de invitados actual. Puede alterar mesas existentes.' 
                : 'Esto habilitará la sincronización automática de mesas al cargar el plano en el futuro.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setSyncConfirmAction(null)}
                className="px-5 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 font-semibold transition-all cursor-pointer border-none"
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
                className="px-5 py-2 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-900 font-bold transition-all cursor-pointer border-none"
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
