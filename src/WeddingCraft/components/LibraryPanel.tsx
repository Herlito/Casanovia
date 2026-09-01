import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Library, Folder, Trash2, PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const LibraryPanel: React.FC = () => {
  const { addElement } = useEditorStore();
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const snap = await getDocs(collection(db, 'weddingcraft_library'));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLibraryItems(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Eliminar este objeto de la librería?")) {
      await deleteDoc(doc(db, 'weddingcraft_library', id));
      fetchLibrary();
    }
  };

  const handleInsert = (item: any) => {
    const newEl = { ...item.element, id: uuidv4() };
    addElement(newEl);
  };

  if (loading) return <div className="p-4 text-xs text-gray-500">Cargando librería...</div>;

  // Group by templateName
  const folders = Array.from(new Set(libraryItems.map(item => item.templateName || 'Sin carpeta')));

  return (
    <div className="flex flex-col h-full overflow-y-auto wc-properties p-3 space-y-4">
      <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50 mb-4">
        <Library className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-xs text-gray-500 font-medium">Librería de Objetos</p>
        <p className="text-[10px] text-gray-400 mt-1">Copia y pega (Ctrl+C / Ctrl+V) en el lienzo para guardar objetos aquí.</p>
      </div>

      {!activeFolder ? (
        <div className="space-y-2">
          {folders.length === 0 && <p className="text-xs text-center text-gray-400">Librería vacía.</p>}
          {folders.map(folder => {
            const count = libraryItems.filter(i => (i.templateName || 'Sin carpeta') === folder).length;
            return (
              <button 
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className="w-full p-3 bg-[#EBEBEB] border border-gray-200 rounded-xl flex items-center space-x-3 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:bg-gray-100 transition-colors"
              >
                <Folder className="w-5 h-5 text-[#2D3748]" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-800 truncate">{folder}</p>
                  <p className="text-[10px] text-gray-500">{count} objeto(s)</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => setActiveFolder(null)} className="text-xs text-blue-600 hover:underline mb-2 flex items-center">&larr; Volver a carpetas</button>
          <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-2">{activeFolder}</h4>
          <div className="grid grid-cols-2 gap-2">
            {libraryItems.filter(i => (i.templateName || 'Sin carpeta') === activeFolder).map(item => (
              <div key={item.id} className="relative p-2 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col items-center justify-center min-h-[80px] group cursor-pointer" onClick={() => handleInsert(item)}>
                <p className="text-[10px] font-medium text-center truncate w-full text-gray-600">{item.element.type}</p>
                {item.element.type === 'text' && <p className="text-xs truncate max-w-[80px] mt-1">{item.element.content.text}</p>}
                
                <div className="absolute inset-0 bg-black/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                   <div className="p-1.5 bg-white rounded-full shadow-sm text-green-600"><PlusCircle className="w-4 h-4" /></div>
                   <div className="p-1.5 bg-white rounded-full shadow-sm text-red-600" onClick={(e) => handleDelete(item.id, e)}><Trash2 className="w-4 h-4" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
