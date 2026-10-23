import React, { useState, useMemo } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Guest } from '../../types';
import { 
  X, 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  User, 
  Sparkles,
  Info,
  Trash2
} from 'lucide-react';

interface AssignChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentGuest: Guest | null;
}

export const AssignChildModal: React.FC<AssignChildModalProps> = ({
  isOpen,
  onClose,
  parentGuest,
}) => {
  const { guests, updateGuest, settings } = useWedding();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(parentGuest?.childStudentId || '');
  const [manualStudentName, setManualStudentName] = useState<string>(parentGuest?.childStudentName || '');
  const [mode, setMode] = useState<'select' | 'manual'>('select');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Reset or initialize state when modal opens or parent changes
  React.useEffect(() => {
    if (parentGuest) {
      setSelectedStudentId(parentGuest.childStudentId || '');
      setManualStudentName(parentGuest.childStudentName || '');
      setSuccessMsg('');
    }
  }, [parentGuest, isOpen]);

  // List of potential students/graduands in the event
  const studentGuests = useMemo(() => {
    return guests.filter((g) => {
      // Exclude the parent himself
      if (g.id === parentGuest?.id) return false;
      
      const cat = (g.category || '').toLowerCase();
      const role = (g.protocolRoleTitle || '').toLowerCase();
      
      // Matches category 'alumnos' or contains 'alumno', 'graduand', 'estudiante'
      return (
        cat === 'alumnos' ||
        cat.includes('alumno') ||
        role.includes('alumno') ||
        role.includes('graduand') ||
        role.includes('estudiante')
      );
    });
  }, [guests, parentGuest]);

  // All guests if no specific student category exists
  const candidateList = useMemo(() => {
    const baseList = studentGuests.length > 0 ? studentGuests : guests.filter(g => g.id !== parentGuest?.id);
    if (!searchQuery.trim()) return baseList;
    const query = searchQuery.toLowerCase();
    return baseList.filter(g => 
      g.fullName.toLowerCase().includes(query) ||
      (g.code && g.code.toLowerCase().includes(query)) ||
      (g.assignedTable && g.assignedTable.toLowerCase().includes(query))
    );
  }, [studentGuests, guests, parentGuest, searchQuery]);

  if (!isOpen || !parentGuest) return null;

  const currentAssignedChildName = parentGuest.childStudentName || 
    guests.find(g => g.id === parentGuest.childStudentId)?.fullName || 
    '';

  const handleSelectStudent = (student: Guest) => {
    setSelectedStudentId(student.id);
    setManualStudentName(student.fullName);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      let finalName = '';
      let finalId: string | undefined = undefined;

      if (mode === 'select') {
        const found = guests.find(g => g.id === selectedStudentId);
        if (found) {
          finalId = found.id;
          finalName = found.fullName;
        } else if (manualStudentName.trim()) {
          finalName = manualStudentName.trim();
        }
      } else {
        finalName = manualStudentName.trim();
      }

      await updateGuest(parentGuest.id, {
        childStudentId: finalId,
        childStudentName: finalName || undefined,
      });

      setSuccessMsg(`¡Hijo/a "${finalName || 'asignado'}" vinculado correctamente!`);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error asignando hijo/a al padre:', err);
      setIsSaving(false);
    }
  };

  const handleRemoveAssignment = async () => {
    setIsSaving(true);
    try {
      await updateGuest(parentGuest.id, {
        childStudentId: undefined,
        childStudentName: undefined,
      });
      setSelectedStudentId('');
      setManualStudentName('');
      setSuccessMsg('Se ha desvinculado la asignación.');
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error desvinculando hijo/a:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#EBEBEB] rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] border border-gray-300 relative text-gray-900 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-teal-800 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg sm:text-xl font-bold text-gray-900">
                Asignar Hijo/a (Alumno)
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Padre/Tutor: <strong className="text-gray-800 font-bold">{parentGuest.fullName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative explanation note */}
        <div className="bg-[#EBEBEB] p-3 rounded-2xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-teal-200/60 flex items-start space-x-2 text-[11px] text-teal-950 leading-relaxed">
          <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            Esta vinculación se reflejará en el módulo de <strong>Finanzas</strong> para relacionar los aportes y cuotas del padre con su respectivo hijo/a. <em>(No altera la distribución de asientos ni mesas)</em>.
          </div>
        </div>

        {/* Current status if already assigned */}
        {currentAssignedChildName && (
          <div className="bg-[#EBEBEB] p-3 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Hijo/a actualmente asignado:
              </span>
              <span className="text-xs font-bold text-teal-900 flex items-center space-x-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{currentAssignedChildName}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveAssignment}
              disabled={isSaving}
              className="px-2.5 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-rose-600 hover:text-rose-800 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
              title="Quitar asignación"
            >
              <Trash2 className="w-3 h-3" />
              <span>Desvincular</span>
            </button>
          </div>
        )}

        {successMsg ? (
          <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-emerald-800 flex items-center space-x-3 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Mode selector */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setMode('select')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'select'
                    ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-teal-900'
                    : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900'
                }`}
              >
                Seleccionar de la Lista
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'manual'
                    ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-teal-900'
                    : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900'
                }`}
              >
                Escribir Nombre Manual
              </button>
            </div>

            {mode === 'select' ? (
              <div className="space-y-2">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar alumno o graduando..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none"
                  />
                </div>

                {/* Candidates list */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 rounded-2xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]">
                  {candidateList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No se encontraron alumnos con este criterio.
                    </div>
                  ) : (
                    candidateList.map((st) => {
                      const isSelected = selectedStudentId === st.id;
                      return (
                        <div
                          key={st.id}
                          onClick={() => handleSelectStudent(st)}
                          className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-teal-400/80 font-bold text-teal-950'
                              : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:shadow-[3px_3px_6px_#c8c8c8,-3px_-3px_6px_#ffffff] text-gray-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-teal-700' : 'text-gray-400'}`} />
                            <div className="min-w-0">
                              <span className="text-xs truncate block">{st.fullName}</span>
                              <span className="text-[10px] text-gray-500 block">
                                {st.protocolRoleTitle || (st.category === 'alumnos' ? 'Alumno' : st.category)}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                  Nombre Completo del Hijo / Alumno:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sebastián Montesino Morales"
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none font-medium text-xs"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-700 font-bold hover:bg-gray-200 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving || (mode === 'select' && !selectedStudentId && !manualStudentName)}
                className="px-5 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-teal-950 text-xs font-bold transition-all cursor-pointer border border-teal-300 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Asignar Hijo/a'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
