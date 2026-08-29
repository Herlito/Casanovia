import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Text, Rect, Transformer, Circle } from 'react-konva';
import { CanvasImage } from './CanvasImage';
import { CanvasCountdown } from './CanvasCountdown';
import { CanvasInteractiveButton } from './CanvasInteractiveButton';

import { useEditorStore } from '../store/useEditorStore';
import { CanvasElement } from '../types';

export const CanvasStage: React.FC = () => {
  const { document, selectedElementIds, selectElements, updateElement, eventData } = useEditorStore();
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [editingTextPos, setEditingTextPos] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0, fontSize: 16, fontFamily: '' });

  const containerRef = useRef<HTMLDivElement>(null);

  const elements = document.pages[0].elements;
  const canvasConfig = document.canvas;

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
      // Don't trigger if editing text or typing in an input
      if (editingTextId || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (selectedElementIds.length === 1) {
        const id = selectedElementIds[0];
        if (e.key === ']' && e.ctrlKey) {
          e.preventDefault();
          useEditorStore.getState().bringToFront(id);
        } else if (e.key === '[' && e.ctrlKey) {
          e.preventDefault();
          useEditorStore.getState().sendToBack(id);
        } else if (e.key === ']') {
          e.preventDefault();
          useEditorStore.getState().bringForward(id);
        } else if (e.key === '[') {
          e.preventDefault();
          useEditorStore.getState().sendBackward(id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, editingTextId]);

  // Update transformer when selection changes
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


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (eventData?.isReadOnly) return;
    
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
                transform: { 
                  x: pointerPosition ? pointerPosition.x : 50, 
                  y: pointerPosition ? pointerPosition.y : 50, 
                  width: Math.min(img.width, 200), 
                  height: Math.min(img.height, 200 * (img.height / img.width)), 
                  rotation: 0, scaleX: 1, scaleY: 1 
                },
                zIndex: 15,
                locked: false,
                visible: true
             });
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === 'background-rect';
    if (clickedOnEmpty) {
      selectElements([]);
      if (editingTextId) handleFinishEditing();
    }
  };

  const handleFinishEditing = () => {
    if (editingTextId) {
      updateElement(editingTextId, { content: { ...document.pages[0].elements.find(e => e.id === editingTextId)?.content, text: editingTextValue } });
      setEditingTextId(null);
    }
  };

  const getResolvedText = (el: CanvasElement) => {
    if (el.dataBinding && eventData) {
      if (el.dataBinding.field === 'coupleNames') {
        return `${eventData.coupleNames[0]} & ${eventData.coupleNames[1]}`;
      }
      if (el.dataBinding.field === 'eventDate') {
        return new Date(eventData.eventDate).toLocaleDateString();
      }
    }
    return el.content.text || '';
  };

  return (
    <div className="flex-1 bg-[#F5F1E8] relative overflow-hidden flex items-center justify-center wc-canvas-container" ref={containerRef} onDragOver={handleDragOver} onDrop={handleDrop}>
      {stageSize.width > 0 && (
        <div className="shadow-2xl bg-white relative" style={{ width: canvasConfig.width, height: canvasConfig.height }}>
          <Stage
            width={canvasConfig.width}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            height={canvasConfig.height}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            ref={stageRef}
          >
            <Layer>
              <Rect
                id="background-rect"
                x={0}
                y={0}
                width={canvasConfig.width}
                height={canvasConfig.height}
                fill={canvasConfig.backgroundColor}
              />
              
              {elements.map((el) => {
                if (!el.visible) return null;
                
                const isSelected = selectedElementIds.includes(el.id);
                
                const commonProps = {
                  id: el.id,
                  x: el.transform.x,
                  y: el.transform.y,
                  width: el.transform.width,
                  height: el.transform.height,
                  rotation: el.transform.rotation,
                  scaleX: el.transform.scaleX,
                  scaleY: el.transform.scaleY,
                  draggable: !el.locked,
                  onClick: () => selectElements([el.id]),
                  onTap: () => selectElements([el.id]),
                  onDragEnd: (e: any) => {
                    updateElement(el.id, {
                      transform: {
                        ...el.transform,
                        x: e.target.x(),
                        y: e.target.y()
                      }
                    });
                  },
                  onTransformEnd: (e: any) => {
                    const node = stageRef.current.findOne(`#${el.id}`);
                    if (node) {
                      updateElement(el.id, {
                        transform: {
                          ...el.transform,
                          x: node.x(),
                          y: node.y(),
                          rotation: node.rotation(),
                          scaleX: node.scaleX(),
                          scaleY: node.scaleY()
                        }
                      });
                    }
                  }
                };

                if (el.type === 'text') {
                  const resolvedText = getResolvedText(el);
                  const isEditing = editingTextId === el.id;
                  let displayValue = resolvedText;
                  if (el.style.textTransform === 'uppercase') displayValue = displayValue.toUpperCase();
                  if (el.style.textTransform === 'lowercase') displayValue = displayValue.toLowerCase();
                  if (el.style.textTransform === 'capitalize') displayValue = displayValue.replace(/\b\w/g, l => l.toUpperCase());
                  
                  return (
                    <Text
                      key={el.id}
                      {...commonProps}
                      visible={!isEditing && el.visible}
                      text={displayValue}
                      fontSize={el.style.fontSize || 24}
                      fill={el.style.fill || el.style.color || '#000'}
                      fontFamily={el.style.fontFamily || 'Arial'}
                      fontStyle={`${el.style.fontStyle || 'normal'} ${el.style.fontWeight || 'normal'}`.trim()}
                      align={el.style.align || 'left'}
                      letterSpacing={el.style.letterSpacing || 0}
                      lineHeight={el.style.lineHeight || 1.2}
                      opacity={el.style.opacity ?? 1}
                      shadowColor={el.style.shadow?.enabled ? el.style.shadow.color : undefined}
                      shadowBlur={el.style.shadow?.enabled ? el.style.shadow.blur : 0}
                      shadowOffsetX={el.style.shadow?.enabled ? el.style.shadow.offsetX : 0}
                      shadowOffsetY={el.style.shadow?.enabled ? el.style.shadow.offsetY : 0}
                      stroke={el.style.strokeEnabled ? el.style.stroke : undefined}
                      strokeWidth={el.style.strokeEnabled ? el.style.strokeWidth : 0}
                      onDblClick={(e) => {
                         if (!el.dataBinding) {
                           const textNode = e.target;
                           const absPos = textNode.getAbsolutePosition();
                           setEditingTextPos({
                             x: absPos.x,
                             y: absPos.y,
                             width: textNode.width() * textNode.scaleX(),
                             height: textNode.height() * textNode.scaleY(),
                             rotation: textNode.rotation(),
                             fontSize: (el.style.fontSize || 24) * textNode.scaleY(),
                             fontFamily: el.style.fontFamily || 'Arial'
                           });
                           setEditingTextValue(el.content.text || '');
                           setEditingTextId(el.id);
                         }
                      }}
                    />
                  );
                }

                if (el.type === 'svg-shape') {
                  return (
                    <Rect
                      key={el.id}
                      {...commonProps}
                      fill={el.style.fill || '#cccccc'}
                    />
                  );
                }
                
                if (el.type === 'image') {
                  return (
                    <CanvasImage 
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                      themePrimaryColor={document.theme.palette.primary}
                    />
                  );
                }
                
                if (el.type === 'countdown-widget') {
                  return (
                    <CanvasCountdown
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                    />
                  );
                }
                
                if (el.type === 'interactive-button') {
                  return (
                    <CanvasInteractiveButton
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                    />
                  );
                }

                return null;
              })}

              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) return oldBox;
                  return newBox;
                }}
                anchorSize={8}
                anchorCornerRadius={4}
                anchorStroke="#8B3A4A"
                anchorFill="#ffffff"
                borderStroke="#8B3A4A"
                padding={2}
              />
            </Layer>
          </Stage>
          {editingTextId && (
            <textarea
              value={editingTextValue}
              onChange={(e) => setEditingTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleFinishEditing();
              }}
              onBlur={handleFinishEditing}
              autoFocus
              style={{
                position: 'absolute',
                top: editingTextPos.y + 'px',
                left: editingTextPos.x + 'px',
                width: Math.max(200, editingTextPos.width) + 'px',
                height: Math.max(50, editingTextPos.height + 20) + 'px',
                fontSize: editingTextPos.fontSize + 'px',
                fontFamily: `"${editingTextPos.fontFamily}", sans-serif`,
                border: '1px solid #8B3A4A',
                padding: '0px',
                margin: '0px',
                overflow: 'hidden',
                background: 'transparent',
                outline: 'none',
                resize: 'none',
                lineHeight: 'normal',
                transform: `rotate(${editingTextPos.rotation}deg)`,
                transformOrigin: 'left top',
                color: '#2D2A26',
                zIndex: 100
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
