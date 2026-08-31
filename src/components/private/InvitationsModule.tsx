import React, { useState, useEffect, useRef } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Palette, Save, Download, Type, Image as ImageIcon, 
  Layers, LayoutTemplate, Undo, Redo, ZoomIn, ZoomOut, 
  Trash2, Move, TypeOutline, Type as TypeIcon, UtensilsCrossed
} from 'lucide-react';
import { fabric } from 'fabric';

export const InvitationsModule: React.FC = () => {
  const {
    appTheme, activeWeddingId, settings, currentUser, tables, guests } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';
  const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'image' | 'tables'>('templates');
  const [isSaving, setIsSaving] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  
  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 600,
      backgroundColor: '#FAF8F5',
      preserveObjectStacking: true,
    });
    
    // Delete active object on Delete key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent deletion if a text box is actively being edited
        if (initCanvas.getActiveObject() && (initCanvas.getActiveObject() as fabric.IText).isEditing) {
          return;
        }
        
        const activeObjects = initCanvas.getActiveObjects();
        if (activeObjects.length) {
          e.preventDefault();
          activeObjects.forEach(obj => {
            initCanvas.remove(obj);
          });
          initCanvas.discardActiveObject();
          initCanvas.renderAll();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    setCanvas(initCanvas);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      initCanvas.dispose();
    };
  }, []);

  // Load from Firebase
  useEffect(() => {
    if (!canvas || !activeWeddingId) return;

    const loadDesign = async () => {
      try {
        const docRef = doc(db, 'weddings', activeWeddingId, 'invitations', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().designJson) {
          canvas.loadFromJSON(docSnap.data().designJson, () => {
            canvas.renderAll();
          });
        }
      } catch (error) {
        console.error('Error loading design:', error);
      }
    };

    loadDesign();
  }, [canvas, activeWeddingId]);

  const handleSave = async () => {
    if (!canvas || !activeWeddingId) return;
    
    setIsSaving(true);
    try {
      const json = canvas.toJSON();
      const docRef = doc(db, 'weddings', activeWeddingId, 'invitations', 'main');
      await setDoc(docRef, {
        designJson: json,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.username
      }, { merge: true });
      
    } catch (error) {
      console.error('Error saving design:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addText = (textType: 'heading' | 'subheading' | 'body') => {
    if (!canvas) return;
    
    let fontSize = 24;
    let text = 'Nuevo Texto';
    let fontFamily = 'sans-serif';
    
    if (textType === 'heading') {
      fontSize = 42;
      fontFamily = 'serif';
      text = settings.coupleNames || 'Nombres';
    } else if (textType === 'subheading') {
      fontSize = 24;
      text = settings.weddingDate || 'Fecha de Evento';
    } else {
      fontSize = 16;
      text = settings.locationSummary || 'Ubicación';
    }
    
    const textObject = new fabric.Textbox(text, {
      left: 200,
      top: 300,
      originX: 'center',
      originY: 'center',
      fontFamily,
      fontSize,
      fill: '#2D2A26',
      textAlign: 'center',
      width: 300,
    });
    
    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();
  };

  const handleExport = (type: 'png' | 'pdf') => {
    if (!canvas) return;
    
    if (type === 'png') {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2 // High res
      });
      const link = document.createElement('a');
      link.download = `invitacion-${activeWeddingId}.png`;
      link.href = dataURL;
      link.click();
    } else {
      // Basic PDF logic or use html2pdf/jsPDF
      alert("Para exportar a PDF listos para imprenta, descarga el PNG y conviértelo, o implementa jsPDF.");
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;
    if (confirm("¿Estás seguro de limpiar todo el diseño?")) {
      canvas.clear();
      canvas.backgroundColor = '#FAF8F5';
      canvas.renderAll();
    }
  };

  return (
    <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-transparent shadow-xs overflow-hidden flex flex-col h-[80vh] min-h-[600px]" : "bg-[#EBEBEB] rounded-3xl border border-transparent shadow-xs overflow-hidden flex flex-col h-[80vh] min-h-[600px]"}>
      
      {/* Top Toolbar */}
      <div className="h-16 bg-[#FAF8F5] border-b border-transparent flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] flex items-center justify-center shadow-xs">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-display font-bold text-lg text-[#2D2A26]">Diseño de Invitaciones</h2>
            <p className="text-[11px] text-[#7A7268]">Crea invitaciones digitales e imprimibles.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={clearCanvas}
            className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Limpiar Diseño"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-[#D9CEBF]" />
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#EBEBEB] border border-[#D9CEBF] text-[#2D2A26] rounded-xl text-xs font-semibold hover:bg-[#F3EFEA] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Save className="w-4 h-4 text-[#2D3748]" />
            <span className="hidden sm:inline">{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>
          </button>
          
          <button
            onClick={() => handleExport('png')}
            className="px-4 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] rounded-xl text-xs font-bold hover:bg-[#EBEBEB] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar PNG</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 bg-[#EBEBEB] border-r border-transparent flex flex-col shrink-0">
          <div className="flex bg-[#FAF8F5] p-1 border-b border-transparent">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg flex flex-col items-center gap-1 transition-colors ${activeTab === 'templates' ? 'bg-[#EBEBEB] text-[#2D3748] shadow-2xs' : 'text-[#8C8276] hover:bg-[#F3EFEA]'}`}
            >
              <LayoutTemplate className="w-4 h-4" />
              Plantillas
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg flex flex-col items-center gap-1 transition-colors ${activeTab === 'text' ? 'bg-[#EBEBEB] text-[#2D3748] shadow-2xs' : 'text-[#8C8276] hover:bg-[#F3EFEA]'}`}
            >
              <TypeIcon className="w-4 h-4" />
              Texto
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg flex flex-col items-center gap-1 transition-colors ${activeTab === 'image' ? 'bg-[#EBEBEB] text-[#2D3748] shadow-2xs' : 'text-[#8C8276] hover:bg-[#F3EFEA]'}`}
            >
              <ImageIcon className="w-4 h-4" />
              Imágenes
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg flex flex-col items-center gap-1 transition-colors ${activeTab === 'tables' ? 'bg-[#EBEBEB] text-[#2D3748] shadow-2xs' : 'text-[#8C8276] hover:bg-[#F3EFEA]'}`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Mesas
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <p className="text-xs text-[#7A7268]">Selecciona una plantilla base para comenzar.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[3/4] bg-rose-50 border border-rose-200 rounded-xl cursor-pointer hover:ring-2 ring-[#d1d1d1] flex items-center justify-center p-2 text-center">
                    <span className="text-[10px] font-bold text-rose-800">Elegante Floral</span>
                  </div>
                  <div className="aspect-[3/4] bg-stone-50 border border-stone-200 rounded-xl cursor-pointer hover:ring-2 ring-[#d1d1d1] flex items-center justify-center p-2 text-center">
                    <span className="text-[10px] font-bold text-stone-800">Minimalista Clásico</span>
                  </div>
                  <div className="aspect-[3/4] bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer hover:ring-2 ring-[#d1d1d1] flex items-center justify-center p-2 text-center">
                    <span className="text-[10px] font-bold text-emerald-800">Botánica</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'text' && (
              <div className="space-y-3">
                <p className="text-xs text-[#7A7268] mb-4">Añade textos a tu diseño.</p>
                
                <button
                  onClick={() => addText('heading')}
                  className="w-full py-3 px-4 bg-[#FAF8F5] border border-transparent rounded-xl hover:border-transparent text-left cursor-pointer transition-colors"
                >
                  <span className="block font-serif text-lg text-[#2D2A26] mb-1">Añadir Título</span>
                  <span className="block text-[10px] text-[#7A7268]">{settings.coupleNames || 'Nombres principales'}</span>
                </button>
                
                <button
                  onClick={() => addText('subheading')}
                  className="w-full py-3 px-4 bg-[#FAF8F5] border border-transparent rounded-xl hover:border-transparent text-left cursor-pointer transition-colors"
                >
                  <span className="block font-sans font-semibold text-sm text-[#2D2A26] mb-1">Añadir Subtítulo</span>
                  <span className="block text-[10px] text-[#7A7268]">{settings.weddingDate || 'Fecha, Ceremonia...'}</span>
                </button>
                
                <button
                  onClick={() => addText('body')}
                  className="w-full py-3 px-4 bg-[#FAF8F5] border border-transparent rounded-xl hover:border-transparent text-left cursor-pointer transition-colors"
                >
                  <span className="block font-sans text-xs text-[#2D2A26] mb-1">Añadir Texto Base</span>
                  <span className="block text-[10px] text-[#7A7268]">{settings.locationSummary || 'Ubicación, detalles...'}</span>
                </button>
              </div>
            )}
            
            {activeTab === 'image' && (
              <div className="space-y-4">
                <p className="text-xs text-[#7A7268]">Sube imágenes o fotos para agregar a tu diseño.</p>
                
                <label className="w-full py-4 px-4 bg-[#FAF8F5] border-2 border-dashed border-[#D9CEBF] hover:border-transparent rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <ImageIcon className="w-6 h-6 text-[#8C8276] group-hover:text-[#2D3748] mb-2 transition-colors" />
                  <span className="text-xs font-bold text-[#2D2A26] group-hover:text-[#2D3748]">Subir Imagen</span>
                  <span className="text-[9px] text-[#7A7268] mt-1 text-center">JPG, PNG hasta 5MB</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || !canvas) return;
                      
                      const reader = new FileReader();
                      reader.onload = (f) => {
                        const data = f.target?.result as string;
                        fabric.Image.fromURL(data, (img) => {
                          // Scale down if too large
                          const maxDim = 300;
                          if (img.width && img.height) {
                            if (img.width > maxDim || img.height > maxDim) {
                              const scale = maxDim / Math.max(img.width, img.height);
                              img.scale(scale);
                            }
                          }
                          
                          img.set({
                            left: 200,
                            top: 300,
                            originX: 'center',
                            originY: 'center',
                          });
                          
                          canvas.add(img);
                          canvas.setActiveObject(img);
                          canvas.renderAll();
                        });
                      };
                      reader.readAsDataURL(file);
                      // Reset input
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            )}
            
            {activeTab === 'tables' && (
              <div className="space-y-3">
                <p className="text-xs text-[#7A7268] mb-4">Selecciona una mesa para insertar su nombre y sus invitados asignados en el diseño.</p>
                
                {(!tables || tables.length === 0) ? (
                  <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
                    No hay mesas registradas. Ve a la sección de "Mesas" para crearlas.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {tables.map(table => {
                      const tableGuests = guests.filter(g => g.assignedTable === table.name);
                      return (
                        <button
                          key={table.id}
                          onClick={() => {
                            if (!canvas) return;
                            
                            // Add Table Name
                            const tableTitle = new fabric.Textbox(table.name, {
                              left: 200,
                              top: 250,
                              originX: 'center',
                              originY: 'center',
                              fontFamily: 'serif',
                              fontSize: 28,
                              fill: '#2D3748',
                              textAlign: 'center',
                              width: 300,
                            });
                            
                            // Add Guests list
                            const guestNames = tableGuests.map(g => g.fullName).join('\n') || 'Mesa vacía';
                            const guestsText = new fabric.Textbox(guestNames, {
                              left: 200,
                              top: 320,
                              originX: 'center',
                              originY: 'top',
                              fontFamily: 'sans-serif',
                              fontSize: 16,
                              fill: '#2D2A26',
                              textAlign: 'center',
                              width: 300,
                              lineHeight: 1.5
                            });
                            
                            canvas.add(tableTitle);
                            canvas.add(guestsText);
                            canvas.setActiveObject(tableTitle);
                            canvas.renderAll();
                          }}
                          className="w-full p-3 bg-[#EBEBEB] border border-transparent rounded-xl hover:border-transparent text-left cursor-pointer transition-colors shadow-2xs group"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-[#2D2A26] group-hover:text-[#2D3748]">{table.name}</span>
                            <span className="text-[10px] bg-[#F0EAE1] text-[#7A7268] px-2 py-0.5 rounded-full">
                              {tableGuests.length} invitados
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A7268] line-clamp-2 leading-tight">
                            {tableGuests.map(g => g.fullName).join(', ') || 'Sin invitados'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-stone-200/50 flex flex-col relative">
          {/* Main workspace */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
            <div className="bg-[#EBEBEB] shadow-xl">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
