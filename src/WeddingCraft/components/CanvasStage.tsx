import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Stage, Layer, Transformer, Rect, Circle, Ellipse, RegularPolygon, Line, Group, Text as KonvaText, Image as KonvaImage, Shape as KonvaShape } from 'react-konva';
import { useEditorStore } from '../store/useEditorStore';
import { CanvasCountdown } from './CanvasCountdown';
import { CanvasInteractiveButton } from './CanvasInteractiveButton';
import useImage from 'use-image';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { saveElementToLibrary } from '../lib/libraryService';
import { CanvasElement } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const getGradientProps = (style: any, w: number, h: number) => {
    if (!style.gradientEnabled) return {};
    const colors = style.gradientColors || ['#ff0000', '#0000ff'];
    const stops = style.gradientStops || [0, 1];
    let colorStops: any[] = [];
    stops.forEach((stop: number, idx: number) => {
        colorStops.push(stop);
        colorStops.push(colors[idx] || colors[0]);
    });
    
    if (style.gradientType === 'radial') {
        return {
            fillRadialGradientStartPoint: { x: w/2, y: h/2 },
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: { x: w/2, y: h/2 },
            fillRadialGradientEndRadius: Math.max(w, h) / 2,
            fillRadialGradientColorStops: colorStops,
        };
    } else {
        return {
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: w, y: h },
            fillLinearGradientColorStops: colorStops,
        };
    }
};

// Helper component for Image
const URLImage = ({ image, ...props }: any) => {
  const [img] = useImage(image.src);
  return <KonvaImage image={img} {...props} />;
};

export const CanvasStage: React.FC = () => {
  const { document, updateElement, selectedElementIds, selectElements, deleteElements } = useEditorStore();
  const elements = document.pages[0]?.elements || [];
  const canvasConfig = document.canvas;
  const eventData = useEditorStore(state => state.eventData);
  const zoom = useEditorStore(state => state.zoom);
  const magnetEnabled = useEditorStore(state => state.magnetEnabled);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [guidelines, setGuidelines] = useState<any[]>([]);

  // Multi-selection marquee and group dragging state
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const frameFileInputRef = useRef<HTMLInputElement>(null);
  const activeFrameTargetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const store = useEditorStore.getState();
      
      if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
        if (selectedElementIds.length > 0) {
            const elementsToCopy = elements.filter(el => selectedElementIds.includes(el.id));
            const dataString = JSON.stringify({ wc_internal: true, elements: elementsToCopy });
            sessionStorage.setItem('wc_clipboard', dataString);
            navigator.clipboard.writeText(dataString).catch(() => {});
        }
      }
      
      if (selectedElementIds.length === 1) {
        const id = selectedElementIds[0];
        if (e.key === ']' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          store.bringToFront(id);
        } else if (e.key === '[' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          store.sendToBack(id);
        } else if (e.key === ']') {
          e.preventDefault();
          store.bringForward(id);
        } else if (e.key === '[') {
          e.preventDefault();
          store.sendBackward(id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, editingTextId, elements]);

  // Global Paste Event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignore if typing in an input or text area
      if (editingTextId || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const store = useEditorStore.getState();
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // 1. Check for image files in clipboardData.items (prioritizing image/png to preserve alpha transparency channel)
      let imageItem: DataTransferItem | null = null;
      for (let i = 0; i < clipboardData.items.length; i++) {
        const it = clipboardData.items[i];
        if (it.type === 'image/png') {
          imageItem = it;
          break;
        }
      }
      if (!imageItem) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const it = clipboardData.items[i];
          if (it.type.indexOf('image') !== -1) {
            imageItem = it;
            break;
          }
        }
      }

      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const src = event.target?.result as string;
            if (!src) return;
            const img = new Image();
            img.onload = () => {
              const maxW = Math.min(img.width, canvasConfig.width * 0.85);
              const ratio = img.width > maxW ? maxW / img.width : 1;
              const finalW = Math.round(img.width * ratio);
              const finalH = Math.round(img.height * ratio);
              const posX = Math.max(20, Math.round((canvasConfig.width - finalW) / 2));
              const posY = Math.max(20, Math.round((canvasConfig.height - finalH) / 2));

              const newEl: CanvasElement = {
                id: uuidv4(),
                type: 'image',
                content: { 
                  src, 
                  originalSrc: src, 
                  naturalWidth: img.width, 
                  naturalHeight: img.height,
                  isTransparent: true 
                },
                style: { 
                  maskId: null, 
                  frameId: null, 
                  objectFit: 'cover', 
                  cropX: 0, 
                  cropY: 0, 
                  cropScale: 1, 
                  filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } 
                },
                transform: { x: posX, y: posY, width: finalW, height: finalH, rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: store.document.pages[0].elements.length,
                visible: true,
                locked: false
              };

              store.addElement(newEl);
              store.selectElements([newEl.id]);
              saveElementToLibrary(newEl, 'Imágenes Pegadas (Ctrl+V)');
              store.triggerLibraryUpdate();
            };
            img.src = src;
          };
          reader.readAsDataURL(file);
          return;
        }
      }

      // 2. Check for SVG vector code in HTML or plain text (e.g. from Figma, Illustrator, or browser)
      const htmlText = clipboardData.getData('text/html');
      if (htmlText) {
        const svgMatch = htmlText.match(/<svg[\s\S]*?<\/svg>/i);
        if (svgMatch) {
          e.preventDefault();
          const svgData = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgMatch[0]);
          const img = new Image();
          img.onload = () => {
            const finalW = Math.min(img.width || 300, canvasConfig.width * 0.85);
            const ratio = (img.width || 300) > finalW ? finalW / (img.width || 300) : 1;
            const displayW = Math.round((img.width || 300) * ratio);
            const displayH = Math.round((img.height || 300) * ratio);
            const posX = Math.max(20, Math.round((canvasConfig.width - displayW) / 2));
            const posY = Math.max(20, Math.round((canvasConfig.height - displayH) / 2));

            const newEl: CanvasElement = {
              id: uuidv4(),
              type: 'image',
              content: { src: svgData, originalSrc: svgData, naturalWidth: img.width || 300, naturalHeight: img.height || 300, isTransparent: true },
              style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
              transform: { x: posX, y: posY, width: displayW, height: displayH, rotation: 0, scaleX: 1, scaleY: 1 },
              zIndex: store.document.pages[0].elements.length,
              visible: true,
              locked: false
            };
            store.addElement(newEl);
            store.selectElements([newEl.id]);
            saveElementToLibrary(newEl, 'Vectores SVG Pegados');
            store.triggerLibraryUpdate();
          };
          img.src = svgData;
          return;
        }
      }

      // 3. Plain text fallback (could be raw SVG, image DataURL, internal elements JSON, or regular text)
      const text = clipboardData.getData('text');
      if (text) {
        const trimmed = text.trim();
        if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
          e.preventDefault();
          const svgData = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(trimmed);
          const img = new Image();
          img.onload = () => {
            const displayW = Math.min(img.width || 300, canvasConfig.width * 0.85);
            const ratio = (img.width || 300) > displayW ? displayW / (img.width || 300) : 1;
            const w = Math.round((img.width || 300) * ratio);
            const h = Math.round((img.height || 300) * ratio);
            const newEl: CanvasElement = {
              id: uuidv4(),
              type: 'image',
              content: { src: svgData, originalSrc: svgData, naturalWidth: img.width || 300, naturalHeight: img.height || 300, isTransparent: true },
              style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
              transform: { x: Math.max(20, (canvasConfig.width - w) / 2), y: Math.max(20, (canvasConfig.height - h) / 2), width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
              zIndex: store.document.pages[0].elements.length,
              visible: true,
              locked: false
            };
            store.addElement(newEl);
            store.selectElements([newEl.id]);
            saveElementToLibrary(newEl, 'Vectores SVG Pegados');
            store.triggerLibraryUpdate();
          };
          img.src = svgData;
          return;
        }

        if (trimmed.startsWith('data:image/')) {
          e.preventDefault();
          const img = new Image();
          img.onload = () => {
            const maxW = Math.min(img.width, canvasConfig.width * 0.85);
            const ratio = img.width > maxW ? maxW / img.width : 1;
            const finalW = Math.round(img.width * ratio);
            const finalH = Math.round(img.height * ratio);
            const newEl: CanvasElement = {
              id: uuidv4(),
              type: 'image',
              content: { src: trimmed, originalSrc: trimmed, naturalWidth: img.width, naturalHeight: img.height, isTransparent: true },
              style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
              transform: { x: Math.max(20, (canvasConfig.width - finalW) / 2), y: Math.max(20, (canvasConfig.height - finalH) / 2), width: finalW, height: finalH, rotation: 0, scaleX: 1, scaleY: 1 },
              zIndex: store.document.pages[0].elements.length,
              visible: true,
              locked: false
            };
            store.addElement(newEl);
            store.selectElements([newEl.id]);
            saveElementToLibrary(newEl, 'Imágenes Pegadas (Ctrl+V)');
            store.triggerLibraryUpdate();
          };
          img.src = trimmed;
          return;
        }

        try {
          const parsed = JSON.parse(text);
          if (parsed.wc_internal && parsed.elements) {
            e.preventDefault();
            const newIds: string[] = [];
            parsed.elements.forEach((el: any) => {
              const { id, ...elWithoutId } = el;
              const newId = uuidv4();
              newIds.push(newId);
              const newEl: CanvasElement = { 
                ...elWithoutId, 
                id: newId,
                transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } 
              };
              store.addElement(newEl);
              saveElementToLibrary(newEl, 'Objetos Pegados (Ctrl+V)');
            });
            store.selectElements(newIds);
            store.triggerLibraryUpdate();
            return;
          }
        } catch(err) {
          e.preventDefault();
          const newEl: CanvasElement = {
            id: uuidv4(),
            type: 'text',
            content: { text: text },
            style: { fontFamily: 'Playfair Display', fontSize: 24, color: '#000000', align: 'left' },
            transform: { x: 50, y: 50, width: 300, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
            zIndex: store.document.pages[0].elements.length,
            visible: true,
            locked: false
          };
          store.addElement(newEl);
          store.selectElements([newEl.id]);
          saveElementToLibrary(newEl, 'Textos Pegados (Ctrl+V)');
          store.triggerLibraryUpdate();
          return;
        }
      }
      
      // Fallback to sessionStorage if system clipboard read failed but paste event fired
      const clip = sessionStorage.getItem('wc_clipboard');
      if (clip) {
        try {
          const parsed = JSON.parse(clip);
          if (parsed.wc_internal && parsed.elements) {
            e.preventDefault();
            const newIds: string[] = [];
            parsed.elements.forEach((el: any) => {
              const { id, ...elWithoutId } = el;
              const newId = uuidv4();
              newIds.push(newId);
              const newEl: CanvasElement = { 
                ...elWithoutId, 
                id: newId,
                transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } 
              };
              store.addElement(newEl);
              saveElementToLibrary(newEl, 'Objetos Pegados (Ctrl+V)');
            });
            store.selectElements(newIds);
            store.triggerLibraryUpdate();
          }
        } catch(err) {}
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [editingTextId, elements, canvasConfig]);


  useEffect(() => {
    if (trRef.current && stageRef.current) {
      if (selectedElementIds.length > 0) {
        const nodes = selectedElementIds.map(id => stageRef.current.findOne(`#${id}`)).filter(Boolean);
        trRef.current.nodes(nodes);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    }
  }, [selectedElementIds, elements]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    stageRef.current?.setPointersPositions(e);
    const pointerPosition = stageRef.current?.getPointerPosition();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = ev.target?.result as string;
          const img = new Image();
          img.onload = () => {
             const canvasPointerX = pointerPosition ? (pointerPosition.x - stageX) / scale : 50;
             const canvasPointerY = pointerPosition ? (pointerPosition.y - stageY) / scale : 50;

             // Check if dropped directly onto an image-frame container
             const targetFrame = elements.slice().reverse().find(el => 
               el.type === 'image-frame' &&
               canvasPointerX >= el.transform.x &&
               canvasPointerX <= el.transform.x + el.transform.width &&
               canvasPointerY >= el.transform.y &&
               canvasPointerY <= el.transform.y + el.transform.height
             );

             if (targetFrame) {
               updateElement(targetFrame.id, {
                 content: {
                   ...targetFrame.content,
                   imageSrc: src,
                   naturalWidth: img.width,
                   naturalHeight: img.height
                 }
               });
               selectElements([targetFrame.id]);
               saveElementToLibrary({
                 ...targetFrame,
                 content: { ...targetFrame.content, imageSrc: src }
               }, 'Marcos de Imagen');
               useEditorStore.getState().triggerLibraryUpdate();
             } else {
               const maxW = Math.min(img.width, canvasConfig.width * 0.8);
               const ratio = img.width > maxW ? maxW / img.width : 1;
               const finalW = Math.round(img.width * ratio);
               const finalH = Math.round(img.height * ratio);

               const newEl: CanvasElement = {
                  id: uuidv4(),
                  type: 'image',
                  content: { src, originalSrc: src, naturalWidth: img.width, naturalHeight: img.height },
                  style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                  transform: { x: canvasPointerX, y: canvasPointerY, width: finalW, height: finalH, rotation: 0, scaleX: 1, scaleY: 1 },
                  zIndex: elements.length,
                  visible: true,
                  locked: false
               };
               useEditorStore.getState().addElement(newEl);
               selectElements([newEl.id]);
               saveElementToLibrary(newEl, 'Imágenes');
               useEditorStore.getState().triggerLibraryUpdate();
             }
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const baseScale = Math.min(
    (stageSize.width - 40) / canvasConfig.width,
    (stageSize.height - 40) / canvasConfig.height
  );
  const scale = baseScale * zoom;
  
  const padding = 100;
  const contentWidth = canvasConfig.width * scale + padding;
  const contentHeight = canvasConfig.height * scale + padding;

  const actualStageWidth = Math.max(stageSize.width, contentWidth);
  const actualStageHeight = Math.max(stageSize.height, contentHeight);
  
  const stageX = (actualStageWidth - canvasConfig.width * scale) / 2;
  const stageY = (actualStageHeight - canvasConfig.height * scale) / 2;

  // Snapping logic
  const handleDragMove = (e: any) => {
    const node = e.target;
    if (node.name() === 'guideline') return;
    
    let guides: any[] = [];
    if (!magnetEnabled) {
        setGuidelines([]);
        return;
    }

    const box = node.getClientRect();
    const centerX = canvasConfig.width * scale / 2;
    const nodeCenterX = box.x - stageX + box.width / 2;

    if (Math.abs(nodeCenterX - centerX) < 2) {
        guides.push({ type: 'line', points: [canvasConfig.width / 2, -1000, canvasConfig.width / 2, canvasConfig.height + 1000] });
    }

    setGuidelines(guides);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const currentZoom = useEditorStore.getState().zoom;
    
    // Zoom in on scroll up (deltaY < 0), zoom out on scroll down
    let newZoom = e.evt.deltaY > 0 ? currentZoom / scaleBy : currentZoom * scaleBy;
    newZoom = Math.max(0.1, Math.min(newZoom, 5));
    
    useEditorStore.getState().setZoom(newZoom);
  };

  const handleDragEnd = (e: any) => {
    setGuidelines([]);
    const id = e.target.id();
    updateElement(id, {
      transform: {
        ...elements.find(el => el.id === id)?.transform,
        x: e.target.x(),
        y: e.target.y()
      }
    });
  };

  // Marquee multi-selection with mouse drag
  const handleStageMouseDown = (e: any) => {
    const isBg = e.target === e.target.getStage() || e.target.name() === 'canvas-bg';
    if (isBg) {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      selectionStartRef.current = { x: pos.x, y: pos.y };
      setIsSelecting(true);
      setSelectionBox(null);

      if (!e.evt.shiftKey) {
        selectElements([]);
      }
      setEditingTextId(null);
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (!isSelecting || !selectionStartRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const start = selectionStartRef.current;
    const box = {
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      width: Math.abs(pos.x - start.x),
      height: Math.abs(pos.y - start.y)
    };
    setSelectionBox(box);

    if (box.width > 4 || box.height > 4) {
      const matchedIds: string[] = [];

      elements.forEach(el => {
        if (el.locked || el.visible === false) return;

        const elStageX = stageX + el.transform.x * scale;
        const elStageY = stageY + el.transform.y * scale;
        const elStageW = el.transform.width * scale;
        const elStageH = el.transform.height * scale;

        const intersects = !(
          elStageX + elStageW < box.x ||
          elStageX > box.x + box.width ||
          elStageY + elStageH < box.y ||
          elStageY > box.y + box.height
        );

        if (intersects) {
          if (el.parentGroup) {
            elements.filter(s => s.parentGroup === el.parentGroup).forEach(s => {
              if (!matchedIds.includes(s.id)) matchedIds.push(s.id);
            });
          } else {
            if (!matchedIds.includes(el.id)) matchedIds.push(el.id);
          }
        }
      });

      selectElements(matchedIds);
    }
  };

  const handleStageMouseUp = () => {
    setIsSelecting(false);
    selectionStartRef.current = null;
    setSelectionBox(null);
  };

  return (
    <div 
      className="flex-1 bg-gray-100 flex items-start justify-start overflow-auto relative"
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={actualStageWidth}
        height={actualStageHeight}
        ref={stageRef}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onTouchStart={handleStageMouseDown}
        onTouchMove={handleStageMouseMove}
        onTouchEnd={handleStageMouseUp}
        onClick={(e) => {
          if (e.target === e.target.getStage() || e.target.name() === 'canvas-bg') {
            if (!e.evt.shiftKey) {
              selectElements([]);
            }
            setEditingTextId(null);
          }
        }}
      >
        <Layer>
          <Rect
            name="canvas-bg"
            x={stageX}
            y={stageY}
            width={canvasConfig.width * scale}
            height={canvasConfig.height * scale}
            fill={canvasConfig.backgroundColor}
            shadowColor="rgba(0,0,0,0.1)"
            shadowBlur={20}
            shadowOffsetY={10}
          />

          <Group x={stageX} y={stageY} scaleX={scale} scaleY={scale}>
            {elements.map((el) => {
                const commonProps = {
                    id: el.id,
                    name: "wc-element",
                    opacity: el.style.opacity ?? 1,
                    x: el.transform.x,
                    y: el.transform.y,
                    width: el.transform.width,
                    height: el.transform.height,
                    rotation: el.transform.rotation,
                    draggable: !el.locked,
                    dragBoundFunc: (pos: any) => {
                        if (!magnetEnabled) return pos;
                        let newX = pos.x;
                        const centerX = stageX + (canvasConfig.width * scale) / 2;
                        const nodeW = el.transform.width * scale;
                        const nodeCenterX = newX + nodeW / 2;
                        if (Math.abs(nodeCenterX - centerX) < 15) {
                            newX = centerX - nodeW / 2;
                        }
                        return { x: newX, y: pos.y };
                    },
                    onClick: (e: any) => {
                        e.cancelBubble = true;
                        const isShift = e.evt.shiftKey;
                        let targetIds = [el.id];
                        if (el.parentGroup) {
                            targetIds = elements.filter(s => s.parentGroup === el.parentGroup).map(s => s.id);
                        }
                        if (isShift) {
                            const isSelected = targetIds.every(id => selectedElementIds.includes(id));
                            if (isSelected) {
                                selectElements(selectedElementIds.filter(id => !targetIds.includes(id)));
                            } else {
                                selectElements(Array.from(new Set([...selectedElementIds, ...targetIds])));
                            }
                        } else {
                            selectElements(targetIds);
                        }
                    },
                    onTap: (e: any) => {
                        e.cancelBubble = true;
                        let targetIds = [el.id];
                        if (el.parentGroup) {
                            targetIds = elements.filter(s => s.parentGroup === el.parentGroup).map(s => s.id);
                        }
                        selectElements(targetIds);
                    },
                    onDragStart: (e: any) => {
                        const id = el.id;
                        const idsToMove = selectedElementIds.includes(id) ? selectedElementIds : [id];
                        const posMap: Record<string, { x: number; y: number }> = {};
                        idsToMove.forEach(mid => {
                            const node = stageRef.current?.findOne(`#${mid}`);
                            if (node) {
                                posMap[mid] = { x: node.x(), y: node.y() };
                            } else {
                                const mel = elements.find(item => item.id === mid);
                                if (mel) posMap[mid] = { x: mel.transform.x, y: mel.transform.y };
                            }
                        });
                        dragStartPositionsRef.current = posMap;
                    },
                    onDragMove: (e: any) => {
                        handleDragMove(e);
                        const id = el.id;
                        const startPos = dragStartPositionsRef.current[id];
                        if (!startPos) return;

                        const dx = e.target.x() - startPos.x;
                        const dy = e.target.y() - startPos.y;

                        Object.keys(dragStartPositionsRef.current).forEach(otherId => {
                            if (otherId === id) return;
                            const otherNode = stageRef.current?.findOne(`#${otherId}`);
                            const otherStart = dragStartPositionsRef.current[otherId];
                            if (otherNode && otherStart) {
                                otherNode.x(otherStart.x + dx);
                                otherNode.y(otherStart.y + dy);
                            }
                        });
                        trRef.current?.getLayer()?.batchDraw();
                    },
                    onDragEnd: (e: any) => {
                        setGuidelines([]);
                        const id = el.id;
                        const startPos = dragStartPositionsRef.current[id];
                        const idsToUpdate = Object.keys(dragStartPositionsRef.current);

                        if (idsToUpdate.length > 1 && startPos) {
                            const dx = e.target.x() - startPos.x;
                            const dy = e.target.y() - startPos.y;

                            idsToUpdate.forEach(targetId => {
                                const targetStart = dragStartPositionsRef.current[targetId];
                                if (targetStart) {
                                    const mel = elements.find(item => item.id === targetId);
                                    updateElement(targetId, {
                                        transform: {
                                            ...mel?.transform,
                                            x: targetStart.x + dx,
                                            y: targetStart.y + dy
                                        }
                                    });
                                }
                            });
                        } else {
                            // Check if dragged image was dropped onto an image-frame container!
                            const draggedEl = elements.find(item => item.id === id);
                            if (draggedEl && draggedEl.type === 'image') {
                                const targetX = e.target.x();
                                const targetY = e.target.y();
                                const centerX = targetX + draggedEl.transform.width / 2;
                                const centerY = targetY + draggedEl.transform.height / 2;

                                const targetFrame = elements.slice().reverse().find(f => 
                                    f.id !== id &&
                                    f.type === 'image-frame' &&
                                    centerX >= f.transform.x &&
                                    centerX <= f.transform.x + f.transform.width &&
                                    centerY >= f.transform.y &&
                                    centerY <= f.transform.y + f.transform.height
                                );

                                if (targetFrame) {
                                    const imageSrc = draggedEl.content.src || draggedEl.content.originalSrc;
                                    updateElement(targetFrame.id, {
                                        content: {
                                            ...targetFrame.content,
                                            imageSrc: imageSrc,
                                            naturalWidth: draggedEl.content.naturalWidth,
                                            naturalHeight: draggedEl.content.naturalHeight
                                        }
                                    });
                                    deleteElements([draggedEl.id]);
                                    selectElements([targetFrame.id]);
                                    saveElementToLibrary({
                                        ...targetFrame,
                                        content: { ...targetFrame.content, imageSrc: imageSrc }
                                    }, 'Marcos de Imagen');
                                    useEditorStore.getState().triggerLibraryUpdate();
                                    dragStartPositionsRef.current = {};
                                    return;
                                }
                            }

                            handleDragEnd(e);
                        }
                        dragStartPositionsRef.current = {};
                    },
                    onTransform: (e: any) => {
                        if (el.type === 'text') {
                            const node = e.target;
                            node.setAttrs({
                                width: Math.max(5, node.width() * node.scaleX()),
                                scaleX: 1,
                                scaleY: 1
                            });
                        }
                    },
                    onTransformEnd: (e: any) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        node.scaleX(1);
                        node.scaleY(1);
                        updateElement(el.id, {
                            transform: {
                                ...el.transform,
                                x: node.x(),
                                y: node.y(),
                                width: Math.max(5, node.width() * scaleX),
                                height: Math.max(5, node.height() * scaleY),
                                rotation: node.rotation(),
                                scaleX: 1,
                                scaleY: 1
                            }
                        });
                    }
                };

                if (el.type === 'svg-shape') {
                  const isDef = el.style.isDefaultStyle && document.theme;
                  const getCol = (defVal: any, propVal: any) => isDef ? defVal : propVal;
                  
                  const variant = el.style.variant || 'rectangle';
                  const isLine = variant === 'line';
                  const isCircle = variant === 'circle';
                  const isOval = variant === 'oval' || variant === 'ovalo';

                  // For Line: No fill
                  let fill = isLine ? 'transparent' : getCol(document.theme?.palette.primary, el.style.fill || '#cccccc');
                  if (isLine) fill = 'transparent';

                  // Stroke width and color defaults
                  let strokeWidth = el.style.strokeWidth ?? 0;
                  let stroke = el.style.stroke;

                  if (isLine) {
                    // Line must have default strokeWidth 2 and no fill, plus hitStrokeWidth so it is easily selectable
                    if (!strokeWidth || strokeWidth <= 0) strokeWidth = 2;
                    if (!stroke || stroke === 'transparent') {
                      stroke = el.style.fill && el.style.fill !== 'transparent' ? el.style.fill : '#2D3748';
                    }
                  } else if (isCircle || isOval) {
                    // Circle & Oval must have border by default
                    if (!strokeWidth || strokeWidth <= 0) strokeWidth = 2;
                    if (!stroke || stroke === 'transparent') {
                      stroke = '#2D3748';
                    }
                  } else {
                    if (stroke && stroke !== 'transparent' && (!strokeWidth || strokeWidth <= 0)) {
                      strokeWidth = 1;
                    }
                  }

                  const cornerRadius = el.style.borderRadius || 0;
                  const w = el.transform.width;
                  const h = el.transform.height;
                  
                  const isGradient = el.style.gradientEnabled && !isLine;
                  const gradientProps = getGradientProps(el.style, w, h);

                  let innerShape;
                  if (isLine) {
                    innerShape = (
                      <Line 
                        points={[0, h/2, w, h/2]} 
                        stroke={stroke} 
                        strokeWidth={strokeWidth} 
                        hitStrokeWidth={Math.max(24, strokeWidth + 16)}
                        lineCap="round"
                      />
                    );
                  } else if (isCircle) {
                    innerShape = (
                      <Circle 
                        x={w/2} 
                        y={h/2} 
                        radius={Math.min(w, h)/2} 
                        fill={fill !== 'transparent' ? fill : undefined}
                        stroke={stroke !== 'transparent' ? stroke : undefined}
                        strokeWidth={strokeWidth}
                        {...(isGradient ? gradientProps : {})}
                      />
                    );
                  } else if (isOval) {
                    innerShape = (
                      <Ellipse 
                        x={w/2} 
                        y={h/2} 
                        radiusX={w/2}
                        radiusY={h/2}
                        fill={fill !== 'transparent' ? fill : undefined}
                        stroke={stroke !== 'transparent' ? stroke : undefined}
                        strokeWidth={strokeWidth}
                        {...(isGradient ? gradientProps : {})}
                      />
                    );
                  } else if (variant === 'triangle') {
                    innerShape = (
                      <RegularPolygon 
                        x={w/2} 
                        y={h/2} 
                        sides={3} 
                        radius={Math.min(w, h)/2} 
                        fill={fill !== 'transparent' ? fill : undefined}
                        stroke={stroke !== 'transparent' ? stroke : undefined}
                        strokeWidth={strokeWidth}
                        {...(isGradient ? gradientProps : {})}
                      />
                    );
                  } else if (variant === 'pentagon') {
                    innerShape = (
                      <RegularPolygon 
                        x={w/2} 
                        y={h/2} 
                        sides={5} 
                        radius={Math.min(w, h)/2} 
                        fill={fill !== 'transparent' ? fill : undefined}
                        stroke={stroke !== 'transparent' ? stroke : undefined}
                        strokeWidth={strokeWidth}
                        {...(isGradient ? gradientProps : {})}
                      />
                    );
                  } else {
                    innerShape = (
                      <Rect 
                        width={w} 
                        height={h} 
                        cornerRadius={cornerRadius} 
                        fill={fill !== 'transparent' ? fill : undefined}
                        stroke={stroke !== 'transparent' ? stroke : undefined}
                        strokeWidth={strokeWidth}
                        {...(isGradient ? gradientProps : {})}
                      />
                    );
                  }
                  
                  return (
                    <Group key={el.id} {...commonProps}>
                      {innerShape}
                    </Group>
                  );
                }

                if (el.type === 'audio-player') {
                  const isDef = el.style.isDefaultStyle && document.theme;
                  const getCol = (defVal: any, propVal: any) => isDef ? defVal : propVal;
                  const bgColor = getCol(document.theme?.palette.background, el.style.backgroundColor || 'rgba(255,255,255,0.8)');
                  const iconColor = getCol(document.theme?.palette.primary, el.style.color || '#000000');
                  const w = el.transform.width;
                  const h = el.transform.height;
                  const radius = Math.min(w, h) / 2;
                  
                  return (
                    <Group key={el.id} {...commonProps}>
                      <Circle x={w/2} y={h/2} radius={radius} fill={bgColor} shadowColor="black" shadowBlur={5} shadowOpacity={0.2} shadowOffsetY={2} />
                      <RegularPolygon x={w/2 + radius/8} y={h/2} sides={3} radius={radius/3} fill={iconColor} rotation={90} />
                    </Group>
                  );
                }

                if (el.type === 'text') {
                    if (editingTextId === el.id) {
                      return (
                        <Group key={el.id} {...commonProps}>
                            {/* In-place HTML Input for editing would typically go here or be overlaid. We will just show normal text in the canvas and let the properties panel handle edits for now, or just a simple Text node. */}
                            <KonvaText
                                text={editingTextValue || el.content.text}
                                width={el.transform.width}
                                height={undefined}
                                fontSize={el.style.fontSize || 24}
                                fontFamily={el.style.fontFamily || 'Arial'}
                                fill={el.style.fill || el.style.color || '#000000'}
                                align={el.style.align || 'left'}
                                letterSpacing={el.style.letterSpacing || 0}
                                lineHeight={el.style.lineHeight || 1.2}
                            />
                        </Group>
                      );
                    }

                    let transformedText = el.content.text || '';
                    if (el.dataBinding && eventData) {
                      if (el.dataBinding.field === 'coupleNames' && eventData.coupleNames && eventData.coupleNames.length >= 2) {
                        transformedText = el.dataBinding.format
                          ? el.dataBinding.format.replace('{{0}}', eventData.coupleNames[0]).replace('{{1}}', eventData.coupleNames[1])
                          : `${eventData.coupleNames[0]} & ${eventData.coupleNames[1]}`;
                      } else if (el.dataBinding.field === 'eventDate' && eventData.eventDate) {
                        const rawDate = new Date(eventData.eventDate);
                        if (!isNaN(rawDate.getTime())) {
                          transformedText = rawDate.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          });
                        }
                      } else if (el.dataBinding.field === 'venueName' && eventData.venueName) {
                        transformedText = eventData.venueName;
                      } else if (el.dataBinding.field === 'romanticQuote' && eventData.romanticQuote) {
                        transformedText = `"${eventData.romanticQuote}"`;
                      }
                    }
                    if (el.style.textTransform === 'uppercase') transformedText = transformedText.toUpperCase();
                    else if (el.style.textTransform === 'lowercase') transformedText = transformedText.toLowerCase();
                    else if (el.style.textTransform === 'capitalize') transformedText = transformedText.replace(/\b\w/g, l => l.toUpperCase());
                    
                    const shadowProps = el.style.shadow?.enabled ? {
                        shadowColor: el.style.shadow.color || 'rgba(0,0,0,0.5)',
                        shadowBlur: el.style.shadow.blur || 5,
                        shadowOffsetX: el.style.shadow.offsetX || 2,
                        shadowOffsetY: el.style.shadow.offsetY || 2,
                        shadowOpacity: 1
                    } : {};

                    return (
                        <KonvaText
                            key={el.id}
                            {...commonProps}
                            height={undefined}
                            text={transformedText}
                            width={el.transform.width}
                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={!el.style.gradientEnabled ? (el.style.fill || el.style.color || '#000000') : undefined}
                            align={el.style.align || 'left'}
                            letterSpacing={el.style.letterSpacing || 0}
                            lineHeight={el.style.lineHeight || 1.2}
                            {...shadowProps}
                            {...getGradientProps(el.style, el.transform.width, el.style.fontSize || 24)}
                            onDblClick={() => setEditingTextId(el.id)}
                            onDblTap={() => setEditingTextId(el.id)}
                        />
                    );
                }

                if (el.type === 'image') {
                    return (
                        <Group key={el.id} {...commonProps}>
                            <URLImage image={el.content} width={el.transform.width} height={el.transform.height} />
                        </Group>
                    );
                }

                if (el.type === 'image-frame') {
                    const w = el.transform.width;
                    const h = el.transform.height;
                    const shapeVariant = el.content?.shapeVariant || 'rectangle';
                    const cornerRadius = el.style?.cornerRadius ?? 24;
                    const stroke = el.style?.stroke || '#CBD5E1';
                    const strokeWidth = el.style?.strokeWidth ?? 1;
                    const imageSrc = el.content?.imageSrc;

                    const clipFunc = (ctx: any) => {
                        if (shapeVariant === 'circle') {
                            const r = Math.min(w, h) / 2;
                            ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2, false);
                        } else if (shapeVariant === 'oval') {
                            if (ctx.ellipse) {
                                ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
                            } else {
                                ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2, false);
                            }
                        } else if (shapeVariant === 'arch') {
                            const r = w / 2;
                            ctx.beginPath();
                            ctx.moveTo(0, h);
                            ctx.lineTo(0, r);
                            ctx.arc(r, r, r, Math.PI, 0, false);
                            ctx.lineTo(w, h);
                            ctx.closePath();
                        } else if (shapeVariant === 'heart') {
                            const topCurveHeight = h * 0.3;
                            ctx.beginPath();
                            ctx.moveTo(w / 2, h / 5);
                            ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
                            ctx.bezierCurveTo(0, (h + topCurveHeight) / 2, w / 2, (h + topCurveHeight) / 2, w / 2, h);
                            ctx.bezierCurveTo(w / 2, (h + topCurveHeight) / 2, w, (h + topCurveHeight) / 2, w, topCurveHeight);
                            ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, h / 5);
                            ctx.closePath();
                        } else {
                            const r = Math.min(cornerRadius, w / 2, h / 2);
                            if (r <= 0) {
                                ctx.rect(0, 0, w, h);
                            } else {
                                ctx.beginPath();
                                ctx.moveTo(r, 0);
                                ctx.lineTo(w - r, 0);
                                ctx.quadraticCurveTo(w, 0, w, r);
                                ctx.lineTo(w, h - r);
                                ctx.quadraticCurveTo(w, h, w - r, h);
                                ctx.lineTo(r, h);
                                ctx.quadraticCurveTo(0, h, 0, h - r);
                                ctx.lineTo(0, r);
                                ctx.quadraticCurveTo(0, 0, r, 0);
                                ctx.closePath();
                            }
                        }
                    };

                    return (
                        <Group 
                            key={el.id} 
                            {...commonProps}
                            onDblClick={() => {
                                activeFrameTargetIdRef.current = el.id;
                                frameFileInputRef.current?.click();
                            }}
                            onDblTap={() => {
                                activeFrameTargetIdRef.current = el.id;
                                frameFileInputRef.current?.click();
                            }}
                        >
                            {/* Clipped content */}
                            <Group clipFunc={clipFunc}>
                                <Rect 
                                    x={0} 
                                    y={0} 
                                    width={w} 
                                    height={h} 
                                    fill={el.style?.fill || '#F8FAFC'} 
                                />
                                {imageSrc ? (
                                    <URLImage image={{ src: imageSrc }} width={w} height={h} />
                                ) : (
                                    <Group listening={false}>
                                        <KonvaText 
                                            x={10} 
                                            y={Math.max(10, h / 2 - 22)} 
                                            width={w - 20} 
                                            align="center" 
                                            text="🖼️ Doble clic para foto" 
                                            fontSize={Math.max(12, Math.min(16, w / 16))} 
                                            fontFamily="sans-serif"
                                            fill="#94A3B8" 
                                        />
                                        <KonvaText 
                                            x={10} 
                                            y={Math.max(34, h / 2 + 6)} 
                                            width={w - 20} 
                                            align="center" 
                                            text="(o arrastra una imagen)" 
                                            fontSize={Math.max(10, Math.min(12, w / 22))} 
                                            fontFamily="sans-serif"
                                            fill="#CBD5E1" 
                                        />
                                    </Group>
                                )}
                            </Group>

                            {/* Crisp shape border outline */}
                            {shapeVariant === 'circle' ? (
                                <Circle 
                                    x={w / 2} 
                                    y={h / 2} 
                                    radius={Math.min(w, h) / 2} 
                                    stroke={stroke} 
                                    strokeWidth={strokeWidth} 
                                    fill="transparent" 
                                    listening={false} 
                                />
                            ) : shapeVariant === 'oval' ? (
                                <Ellipse 
                                    x={w / 2} 
                                    y={h / 2} 
                                    radiusX={w / 2} 
                                    radiusY={h / 2} 
                                    stroke={stroke} 
                                    strokeWidth={strokeWidth} 
                                    fill="transparent" 
                                    listening={false} 
                                />
                            ) : shapeVariant === 'heart' ? (
                                <KonvaShape
                                    sceneFunc={(context, shape) => {
                                        const topCurveHeight = h * 0.3;
                                        context.beginPath();
                                        context.moveTo(w / 2, h / 5);
                                        context.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
                                        context.bezierCurveTo(0, (h + topCurveHeight) / 2, w / 2, (h + topCurveHeight) / 2, w / 2, h);
                                        context.bezierCurveTo(w / 2, (h + topCurveHeight) / 2, w, (h + topCurveHeight) / 2, w, topCurveHeight);
                                        context.bezierCurveTo(w, 0, w / 2, 0, w / 2, h / 5);
                                        context.closePath();
                                        context.fillStrokeShape(shape);
                                    }}
                                    stroke={stroke}
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    listening={false}
                                />
                            ) : (
                                <Rect 
                                    x={0} 
                                    y={0} 
                                    width={w} 
                                    height={h} 
                                    cornerRadius={shapeVariant === 'arch' ? [w / 2, w / 2, 0, 0] : cornerRadius} 
                                    stroke={stroke} 
                                    strokeWidth={strokeWidth} 
                                    fill="transparent" 
                                    listening={false} 
                                />
                            )}
                        </Group>
                    );
                }
                
                if (el.type === 'countdown-widget') {
                    return (
                        <CanvasCountdown key={el.id} el={el} commonProps={commonProps} theme={document.theme} />
                    );
                }
                
                if (el.type === 'interactive-button') {
                    return (
                        <CanvasInteractiveButton key={el.id} el={el} commonProps={commonProps} theme={document.theme} />
                    );
                }

                return null;
            })}

            {/* Guidelines */}
            {guidelines.map((g, i) => (
                <Line key={`guide-${i}`} name="guideline" points={g.points} stroke="#ec4899" strokeWidth={1.5 / scale} dash={[4 / scale, 4 / scale]} />
            ))}
          </Group>
          {<Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => { if (newBox.width < 5 || newBox.height < 5) return oldBox; return newBox; }} />}

          {/* Marquee Selection Rectangle */}
          {selectionBox && (
            <Rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(59, 130, 246, 0.15)"
              stroke="#3B82F6"
              strokeWidth={1}
              dash={[4, 3]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>

      <input
        type="file"
        ref={frameFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const targetId = activeFrameTargetIdRef.current;
          if (file && targetId) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const src = ev.target?.result as string;
              if (src) {
                const img = new window.Image();
                img.onload = () => {
                  const targetEl = elements.find(el => el.id === targetId);
                  updateElement(targetId, {
                    content: {
                      ...targetEl?.content,
                      imageSrc: src,
                      naturalWidth: img.width,
                      naturalHeight: img.height
                    }
                  });
                  if (targetEl) {
                    saveElementToLibrary({
                      ...targetEl,
                      content: {
                        ...targetEl.content,
                        imageSrc: src
                      }
                    }, 'Formas con Foto');
                    useEditorStore.getState().triggerLibraryUpdate();
                  }
                };
                img.src = src;
              }
            };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
};
