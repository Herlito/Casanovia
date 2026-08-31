import React, { useState, useEffect } from 'react';
import { WeddingTable } from '../../types';
import { 
  X, 
  UtensilsCrossed, 
  Users, 
  MapPin, 
  Layers, 
  AlignLeft,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tableData: Omit<WeddingTable, 'id'>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  tableToEdit?: WeddingTable | null;
}

const COMMON_ZONES = [
  'Pista Central / Escenario',
  'Zona Central',
  'Salón Principal',
  'Terraza / Jardín',
  'Área Cóctel & Lounge',
  'Balcón / Mezanine',
  'Mesa Presidencial / Honor'
];

export const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  tableToEdit,
}) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [shape, setShape] = useState<'round' | 'rectangular' | 'imperial' | 'square'>('round');
  const [zone, setZone] = useState('Zona Central');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tableToEdit) {
      setName(tableToEdit.name || '');
      setCapacity(tableToEdit.capacity || 10);
      setShape(tableToEdit.shape || 'round');
      setZone(tableToEdit.zone || 'Zona Central');
      setNotes(tableToEdit.notes || '');
    } else {
      setName('');
      setCapacity(10);
      setShape('round');
      setZone('Zona Central');
      setNotes('');
    }
  }, [tableToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        capacity: Number(capacity) || 10,
        shape,
        zone: zone.trim() || 'Zona Central',
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#EBEBEB] rounded-3xl max-w-lg w-full shadow-2xl border border-transparent overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB]/10 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-[#4A5568]" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-base sm:text-lg">
                {tableToEdit ? 'Editar Mesa del Banquete' : 'Nueva Mesa de Banquete'}
              </h3>
              <p className="text-[11px] text-[#4A5568]">
                Configuración de capacidad, forma y zona del salón
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-300 hover:text-[#2D3748] hover:bg-[#EBEBEB]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Table Name */}
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1">
              Nombre o Número de Mesa <span className="text-[#2D3748]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mesa 1 (Familia Novia) o Mesa de Honor"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Capacity */}
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#8C8276]" />
                <span>Capacidad de Asientos <span className="text-[#2D3748]">*</span></span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="40"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
              />
              <span className="text-[10px] text-[#8C8276] mt-0.5 block">
                Recomendado: 8 a 12 personas
              </span>
            </div>

            {/* Shape */}
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-[#8C8276]" />
                <span>Forma de la Mesa</span>
              </label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
              >
                <option value="round">Redonda (Clásica)</option>
                <option value="imperial">Imperial (Larga / Honor)</option>
                <option value="rectangular">Rectangular (Tablón)</option>
                <option value="square">Cuadrada</option>
              </select>
            </div>
          </div>

          {/* Zone / Sector */}
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#8C8276]" />
              <span>Zona o Sector del Salón</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="Ej. Pista Central / Escenario, Jardín, etc."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_ZONES.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZone(z)}
                    className={`text-[10px] px-2 py-0.5 rounded-md transition-colors cursor-pointer border ${
                      zone === z 
                        ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent' 
                        : 'bg-[#EBEBEB] text-[#524B42] border-transparent hover:bg-[#EAE4DC]'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1 flex items-center space-x-1">
              <AlignLeft className="w-3.5 h-3.5 text-[#8C8276]" />
              <span>Notas o Instrucciones Especiales</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Familia de la novia, espacio para carriola, cerca a la pista de baile..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between gap-3">
            {tableToEdit && onDelete ? (
              isConfirmingDelete ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-rose-700 font-semibold hidden sm:inline">¿Seguro?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-2.5 py-1.5 rounded-lg text-white bg-rose-600 hover:bg-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Sí, Eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1.5 rounded-lg text-[#524B42] bg-[#FAF8F5] hover:bg-[#EBEBEB] border border-[#D9CEBF] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3.5 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#D9CEBF] text-xs font-semibold text-[#524B42] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-[#2D3748] text-xs font-bold transition-all shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{tableToEdit ? 'Guardar Cambios' : 'Crear Mesa'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
