import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Text, Rect, Transformer, Circle } from 'react-konva';
import { useEditorStore } from '../store/useEditorStore';
import { CanvasElement } from '../types';

export const CanvasStage: React.FC = () => {
  const { document, selectedElementIds, selectElements, updateElement, eventData } = useEditorStore();
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
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

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === 'background-rect';
    if (clickedOnEmpty) {
      selectElements([]);
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
    <div className="flex-1 bg-[#F5F1E8] relative overflow-hidden flex items-center justify-center wc-canvas-container" ref={containerRef}>
      {stageSize.width > 0 && (
        <div className="shadow-2xl bg-white relative" style={{ width: canvasConfig.width, height: canvasConfig.height }}>
          <Stage
            width={canvasConfig.width}
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
                  return (
                    <Text
                      key={el.id}
                      {...commonProps}
                      text={getResolvedText(el)}
                      fontSize={el.style.fontSize || 24}
                      fill={el.style.fill || '#000'}
                      fontFamily={el.style.fontFamily || 'Arial'}
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
        </div>
      )}
    </div>
  );
};
