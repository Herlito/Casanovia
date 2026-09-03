import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { fetchAllLibraryItems, deleteLibraryItem } from '../lib/libraryService';
import { Library, Folder, Trash2, PlusCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const LibraryPanel: React.FC = () => {
  const { addElement, document } = useEditorStore();
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const items = await fetchAllLibraryItems();
      setLibraryItems(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Eliminar este objeto de la librería?")) {
      await deleteLibraryItem(id);
      loadItems();
    }
  };

  const handleInsert = (item: any) => {
    const newEl = { 
      ...item.element, 
      id: uuidv4(),
      zIndex: document.pages[0]?.elements.length || 0,
      transform: {
        ...item.element.transform,
        x: Math.min(item.element.transform.x || 50, 100),
        y: Math.min(item.element.transform.y || 50, 150)
      }
    };
    addElement(newEl);
  };

  // Group by templateName
  const folders = Array.from(new Set(libraryItems.map(item => item.templateName || 'Objetos Pegados (Ctrl+V)')));

  return (
    <div className="flex flex-col h-full overflow-y-auto wc-properties p-3 space-y-4">
      <div className="flex flex-col items-center justify-center p-5 text-center border border-dashed border-gray-300 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
        <Library className="w-7 h-7 text-[#2D3748] mb-2" />
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Librería de Objetos</h4>
        <p className="text-[11px] text-gray-500 mt-1">
          Objetos y pegados con Ctrl+V guardados automáticamente.
        </p>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          {libraryItems.length} {libraryItems.length === 1 ? 'Elemento' : 'Elementos'}
        </span>
        <button
          onClick={loadItems}
          className="p-1 text-gray-500 hover:text-gray-800 rounded-lg"
          title="Actualizar librería"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && libraryItems.length === 0 ? (
        <div className="p-6 text-center bg-[#EBEBEB] rounded-2xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
          <p className="text-xs text-gray-500">Cargando librería...</p>
        </div>
      ) : !activeFolder ? (
        <div className="space-y-2.5">
          {folders.length === 0 ? (
            <div className="p-6 text-center bg-[#EBEBEB] rounded-2xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
              <p className="text-xs text-gray-500">Librería vacía.</p>
              <p className="text-[10px] text-gray-400 mt-1">Copia y pega (Ctrl+V) elementos en el lienzo para guardarlos aquí.</p>
            </div>
          ) : (
            folders.map(folder => {
              const count = libraryItems.filter(i => (i.templateName || 'Objetos Pegados (Ctrl+V)') === folder).length;
              return (
                <button 
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className="w-full p-3.5 bg-[#EBEBEB] rounded-2xl flex items-center space-x-3 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all group"
                >
                  <div className="p-2 rounded-xl bg-amber-100/60 text-amber-700">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate group-hover:text-amber-700 transition-colors">{folder}</p>
                    <p className="text-[10px] text-gray-500">{count} {count === 1 ? 'objeto' : 'objetos'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <button 
            onClick={() => setActiveFolder(null)} 
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a carpetas</span>
          </button>
          
          <h4 className="text-xs font-bold text-gray-800 border-b border-gray-200/80 pb-2">
            {activeFolder}
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            {libraryItems.filter(i => (i.templateName || 'Objetos Pegados (Ctrl+V)') === activeFolder).map(item => (
              <div 
                key={item.id} 
                className="relative p-2.5 bg-[#EBEBEB] rounded-2xl shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] flex flex-col items-center justify-center min-h-[90px] group cursor-pointer transition-all border border-gray-100" 
                onClick={() => handleInsert(item)}
              >
                {item.element.type === 'image' && item.element.content?.src ? (
                  <img 
                    src={item.element.content.src} 
                    alt="Preview" 
                    className="max-h-12 max-w-full object-contain rounded mb-1" 
                  />
                ) : item.element.type === 'text' ? (
                  <p className="text-xs font-medium text-gray-800 truncate max-w-[100px] text-center mb-1">
                    "{item.element.content?.text}"
                  </p>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gray-200/80 flex items-center justify-center text-gray-600 text-[10px] font-bold mb-1">
                    {item.element.style?.variant || item.element.type}
                  </div>
                )}
                
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 truncate w-full text-center">
                  {item.element.type}
                </p>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                   <button 
                     className="p-1.5 bg-white rounded-full shadow text-emerald-600 hover:scale-110 transition-transform" 
                     title="Añadir al lienzo"
                     onClick={(e) => { e.stopPropagation(); handleInsert(item); }}
                   >
                     <PlusCircle className="w-4 h-4" />
                   </button>
                   <button 
                     className="p-1.5 bg-white rounded-full shadow text-rose-600 hover:scale-110 transition-transform" 
                     onClick={(e) => handleDelete(item.id, e)}
                     title="Eliminar de librería"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
