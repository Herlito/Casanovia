import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Stage, Layer, Transformer, Rect, Circle, RegularPolygon, Line, Group, Text as KonvaText, Image as KonvaImage } from 'react-konva';
import { useEditorStore } from '../store/useEditorStore';
import { CanvasCountdown } from './CanvasCountdown';
import useImage from 'use-image';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Helper component for Image
const URLImage = ({ image, ...props }: any) => {
  const [img] = useImage(image.src);
  return <KonvaImage image={img} {...props} />;
};

export const CanvasStage: React.FC = () => {
  const { document, updateElement, selectedElementIds, selectElements } = useEditorStore();
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
      
      if (e.key === 'c' && e.ctrlKey) {
        if (selectedElementIds.length > 0) {
            const elementsToCopy = elements.filter(el => selectedElementIds.includes(el.id));
            sessionStorage.setItem('wc_clipboard', JSON.stringify(elementsToCopy));
        }
      } else if (e.key === 'v' && e.ctrlKey) {
          const clip = sessionStorage.getItem('wc_clipboard');
          if (clip) {
              const pastedElements = JSON.parse(clip);
              const templateName = store.templates.find(t => t.id === store.document.id)?.name || 'Plantilla Actual';
              
              pastedElements.forEach((el: any) => {
                  const { id, ...elWithoutId } = el;
                  const newEl = { ...elWithoutId, transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } };
                  store.addElement(newEl);
                  
                  addDoc(collection(db, 'weddingcraft_library'), {
                      templateName,
                      element: newEl,
                      createdAt: Date.now()
                  }).catch(err => console.error("Error saving to library", err));
              });
          }
      }
      
      if (selectedElementIds.length === 1) {
        const id = selectedElementIds[0];
        if (e.key === ']' && e.ctrlKey) {
          e.preventDefault();
          store.bringToFront(id);
        } else if (e.key === '[' && e.ctrlKey) {
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
             useEditorStore.getState().addElement({
                type: 'image',
                content: { src, originalSrc: src, naturalWidth: img.width, naturalHeight: img.height },
                style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                transform: { x: pointerPosition?.x || 50, y: pointerPosition?.y || 50, width: img.width / 2, height: img.height / 2, rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: elements.length,
                visible: true,
                locked: false
             });
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
  
  const stageX = (stageSize.width - canvasConfig.width * scale) / 2;
  const stageY = (stageSize.height - canvasConfig.height * scale) / 2;

  // Snapping logic
  const handleDragMove = (e: any) => {
    const node = e.target;
    if (node.name() === 'guideline') return;

    const box = node.getClientRect();
    const threshold = 10;
    let newX = node.x();
    let newY = node.y();
    let guides: any[] = [];

    if (!magnetEnabled) {
        setGuidelines([]);
        return;
    }

    // Screen center snap
    const centerX = canvasConfig.width * scale / 2;
    const centerY = canvasConfig.height * scale / 2;
    
    const nodeCenterX = box.x - stageX + box.width / 2;
    const nodeCenterY = box.y - stageY + box.height / 2;

    if (Math.abs(nodeCenterX - centerX) < threshold) {
        newX = centerX - box.width/2 / scale;
        guides.push({ type: 'line', points: [centerX, 0, centerX, canvasConfig.height * scale] });
    }
    if (Math.abs(nodeCenterY - centerY) < threshold) {
        newY = centerY - box.height/2 / scale;
        guides.push({ type: 'line', points: [0, centerY, canvasConfig.width * scale, centerY] });
    }

    // Element snap
    const siblings = stageRef.current.find('.wc-element');
    siblings.forEach((sibling: any) => {
        if (sibling === node) return;
        const sBox = sibling.getClientRect();
        const sLeft = sBox.x - stageX;
        const sRight = sLeft + sBox.width;
        const sCenter = sLeft + sBox.width/2;
        
        const nLeft = box.x - stageX;
        const nRight = nLeft + box.width;
        const nCenter = nLeft + box.width/2;

        if (Math.abs(nLeft - sLeft) < threshold) { newX = sLeft / scale; guides.push({ type: 'line', points: [sLeft, 0, sLeft, canvasConfig.height * scale] }); }
        if (Math.abs(nCenter - sCenter) < threshold) { newX = (sCenter - box.width/2) / scale; guides.push({ type: 'line', points: [sCenter, 0, sCenter, canvasConfig.height * scale] }); }
        if (Math.abs(nRight - sRight) < threshold) { newX = (sRight - box.width) / scale; guides.push({ type: 'line', points: [sRight, 0, sRight, canvasConfig.height * scale] }); }
    });

    node.x(newX);
    node.y(newY);
    setGuidelines(guides);
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

  return (
    <div 
      className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative"
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onClick={(e) => {
          if (e.target === e.target.getStage() || e.target.name() === 'canvas-bg') {
            selectElements([]);
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
                    x: el.transform.x,
                    y: el.transform.y,
                    width: el.transform.width,
                    height: el.transform.height,
                    rotation: el.transform.rotation,
                    draggable: !el.locked,
                    onClick: () => selectElements([el.id]),
                    onTap: () => selectElements([el.id]),
                    onDragMove: handleDragMove,
                    onDragEnd: handleDragEnd,
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
                  const fill = el.style.fill || '#cccccc';
                  const stroke = el.style.stroke || undefined;
                  const strokeWidth = el.style.strokeWidth || 0;
                  const cornerRadius = el.style.borderRadius || 0;
                  const w = el.transform.width;
                  const h = el.transform.height;
                  
                  if (el.style.variant === 'line') {
                    return <Line key={el.id} {...commonProps} points={[0, h/2, w, h/2]} stroke={fill} strokeWidth={strokeWidth || 4} />;
                  } else if (el.style.variant === 'circle') {
                    return <Circle key={el.id} {...commonProps} x={w/2} y={h/2} radius={Math.min(w, h)/2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
                  } else if (el.style.variant === 'triangle') {
                    return <RegularPolygon key={el.id} {...commonProps} x={w/2} y={h/2} sides={3} radius={Math.min(w, h)/2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
                  } else if (el.style.variant === 'pentagon') {
                    return <RegularPolygon key={el.id} {...commonProps} x={w/2} y={h/2} sides={5} radius={Math.min(w, h)/2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
                  } else {
                    return <Rect key={el.id} {...commonProps} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={cornerRadius} />;
                  }
                }

                if (el.type === 'audio-player') {
                  const bgColor = el.style.backgroundColor || 'rgba(255,255,255,0.8)';
                  const iconColor = el.style.color || '#000000';
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
                                fontSize={el.style.fontSize || 24}
                                fontFamily={el.style.fontFamily || 'Arial'}
                                fill={el.style.color || '#000000'}
                                align={el.style.align || 'left'}
                            />
                        </Group>
                      );
                    }

                    return (
                        <KonvaText
                            key={el.id}
                            {...commonProps}
                            text={el.content.text}
                            width={el.transform.width}
                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={el.style.color || '#000000'}
                            align={el.style.align || 'left'}
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
                
                if (el.type === 'countdown-widget') {
                    return (
                        <Group key={el.id} {...commonProps}>
                            <CanvasCountdown el={el} commonProps={commonProps} />
                        </Group>
                    );
                }

                return null;
            })}

            {/* Guidelines */}
            {guidelines.map((g, i) => (
                <Line key={`guide-${i}`} name="guideline" points={g.points} stroke="#00d2ff" strokeWidth={1} dash={[4, 4]} />
            ))}
          </Group>
          {<Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => { if (newBox.width < 5 || newBox.height < 5) return oldBox; return newBox; }} />}
        </Layer>
      </Stage>
    </div>
  );
};
