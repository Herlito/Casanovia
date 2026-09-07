import React, { useState, useMemo } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Guest } from '../../types';
import { formatAltibajas } from '../../lib/formatUtils';
import { 
  X, 
  UserPlus, 
  Search, 
  Users, 
  CheckCircle2, 
  User, 
  ArrowRight,
  Phone,
  Mail,
  UtensilsCrossed,
  AlertTriangle,
  Ticket,
  Plus
} from 'lucide-react';

interface CompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryGuestName: string;
  primaryGuestId?: string;
  initialTotalPasses?: number;
  onPassesChange?: (newPasses: number) => void;
  currentTable: string;
  onCompanionAdded?: (companionName: string) => void;
  onTableChange?: (newTable: string) => void;
  excludeGuestId?: string;
}

export const CompanionModal: React.FC<CompanionModalProps> = ({
  isOpen,
  onClose,
  primaryGuestName,
  primaryGuestId,
  initialTotalPasses,
  onPassesChange,
  currentTable,
  onCompanionAdded,
  onTableChange,
  excludeGuestId,
}) => {
  const { guests, addGuest, updateGuest } = useWedding();

  const targetGuestId = primaryGuestId || excludeGuestId;
  const primaryGuest = guests.find((g) => g.id === targetGuestId);

  const [activeTab, setActiveTab] = useState<'select' | 'new'>('select');
  const [searchQuery, setSearchQuery] = useState('');

  // Local passes counter for instant reactivity
  const [localPasses, setLocalPasses] = useState<number>(() => {
    return initialTotalPasses || primaryGuest?.totalPasses || 1;
  });

  // Sync local passes if primaryGuest or prop updates
  React.useEffect(() => {
    const freshPasses = primaryGuest?.totalPasses || initialTotalPasses || 1;
    setLocalPasses((prev) => Math.max(prev, freshPasses));
  }, [primaryGuest?.totalPasses, initialTotalPasses]);

  // New guest form fields
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDietary, setNewDietary] = useState('');
  
  // Initialize targetTable based on primary guest table
  const defaultInitialTable = (primaryGuest?.assignedTable && primaryGuest.assignedTable !== 'Mesa por asignar')
    ? primaryGuest.assignedTable
    : (currentTable && currentTable !== 'Mesa por asignar' ? currentTable : 'Mesa por asignar');
    
  const [targetTable, setTargetTable] = useState(defaultInitialTable);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync table if currentTable or primaryGuest prop updates
  React.useEffect(() => {
    if (primaryGuest?.assignedTable && primaryGuest.assignedTable !== 'Mesa por asignar') {
      setTargetTable(primaryGuest.assignedTable);
    } else if (currentTable && currentTable !== 'Mesa por asignar') {
      setTargetTable(currentTable);
    } else {
      setTargetTable('Mesa por asignar');
    }
  }, [currentTable, primaryGuest?.assignedTable]);

  // List of companions associated with this primary guest
  const primaryCompanions = useMemo(() => {
    if (!targetGuestId) return [];
    return guests.filter((g) => g.mainGuestId === targetGuestId);
  }, [guests, targetGuestId]);

  // Total passes & allowed companions calculation
  const totalPasses = Math.max(localPasses, primaryGuest?.totalPasses || 1, initialTotalPasses || 1);
  const maxAllowedCompanions = Math.max(0, totalPasses - 1);
  const isPassLimitReached = primaryCompanions.length >= maxAllowedCompanions;

  // List of other guests currently at this same table
  const tableCompanions = useMemo(() => {
    if (!targetTable || targetTable === 'Mesa por asignar') return [];
    return guests.filter(
      (g) => g.id !== targetGuestId && g.assignedTable?.toLowerCase().trim() === targetTable.toLowerCase().trim()
    );
  }, [guests, targetTable, targetGuestId]);

  // Filtered existing guests for selection
  const filteredGuests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return guests.filter((g) => {
      if (targetGuestId && g.id === targetGuestId) return false;
      // Do not allow picking someone who is already a companion of this primary guest
      if (targetGuestId && g.mainGuestId === targetGuestId) return false;
      if (!query) return true;
      const matchName = g.fullName.toLowerCase().includes(query);
      const matchCode = g.code.toLowerCase().includes(query);
      const matchTable = g.assignedTable?.toLowerCase().includes(query) || false;
      return matchName || matchCode || matchTable;
    });
  }, [guests, searchQuery, targetGuestId]);

  if (!isOpen) return null;

  // Quick action: Increase passes of primary guest by 1
  const handleIncreasePasses = async () => {
    setIsSubmitting(true);
    try {
      const current = Math.max(localPasses, primaryGuest?.totalPasses || 1);
      const newTotal = current + 1;
      setLocalPasses(newTotal);
      if (targetGuestId) {
        await updateGuest(targetGuestId, { totalPasses: newTotal });
      }
      if (onPassesChange) {
        onPassesChange(newTotal);
      }
      setSuccessMessage(`Pases del titular aumentados a ${newTotal}. ¡Ahora puedes asignar el acompañante!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error increasing passes:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle assigning an existing guest as companion & synchronizing table
  const handleAssignExistingGuest = async (guest: Guest) => {
    setIsSubmitting(true);
    try {
      // 1. Ensure the primary guest has enough passes for this companion
      let current = Math.max(localPasses, primaryGuest?.totalPasses || 1);
      const neededPasses = primaryCompanions.length + 2; // 1 titular + existing companions + 1 new companion
      if (current < neededPasses) {
        current = neededPasses;
        setLocalPasses(current);
        if (targetGuestId) {
          await updateGuest(targetGuestId, { totalPasses: current });
        }
        if (onPassesChange) {
          onPassesChange(current);
        }
      }

      // 2. Resolve final table
      let finalTable = primaryGuest?.assignedTable && primaryGuest.assignedTable !== 'Mesa por asignar'
        ? primaryGuest.assignedTable
        : (targetTable && targetTable !== 'Mesa por asignar' ? targetTable : 'Mesa por asignar');

      // If user specified a real table in targetTable and primary guest was unassigned, assign both!
      if (targetTable && targetTable !== 'Mesa por asignar' && (!primaryGuest?.assignedTable || primaryGuest.assignedTable === 'Mesa por asignar')) {
        finalTable = targetTable;
        if (targetGuestId) {
          await updateGuest(targetGuestId, { assignedTable: finalTable });
        }
      }

      await updateGuest(guest.id, {
        mainGuestId: targetGuestId,
        category: 'invitado', // El acompañante pasa a tener el rol de Invitado
        assignedTable: finalTable,
      });

      if (onTableChange && finalTable !== 'Mesa por asignar') {
        onTableChange(finalTable);
      }

      setSuccessMessage(`¡"${guest.fullName}" ha sido asignado(a) como acompañante de ${primaryGuestName}${finalTable !== 'Mesa por asignar' ? ` en ${finalTable}` : ''}!`);
      if (onCompanionAdded) onCompanionAdded(guest.fullName);

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error assigning companion:', err);
      setSuccessMessage('Ocurrió un error al vincular el acompañante. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle registering a new companion directly
  const handleCreateNewCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    setIsSubmitting(true);
    try {
      // Auto-increase passes if needed
      let current = Math.max(localPasses, primaryGuest?.totalPasses || 1);
      const neededPasses = primaryCompanions.length + 2;
      if (current < neededPasses) {
        current = neededPasses;
        setLocalPasses(current);
        if (targetGuestId) {
          await updateGuest(targetGuestId, { totalPasses: current });
        }
        if (onPassesChange) {
          onPassesChange(current);
        }
      }

      let finalTable = primaryGuest?.assignedTable && primaryGuest.assignedTable !== 'Mesa por asignar'
        ? primaryGuest.assignedTable
        : (targetTable && targetTable !== 'Mesa por asignar' ? targetTable : 'Mesa por asignar');

      if (targetTable && targetTable !== 'Mesa por asignar' && (!primaryGuest?.assignedTable || primaryGuest.assignedTable === 'Mesa por asignar')) {
        finalTable = targetTable;
        if (targetGuestId) {
          await updateGuest(targetGuestId, { assignedTable: finalTable });
        }
      }

      const cleanName = formatAltibajas(newFullName.trim());
      const cleanPrefix = cleanName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'ACOMP';
      const generatedCode = `BODA-${cleanPrefix}-${Math.floor(100 + Math.random() * 900)}`;

      const newGuest = await addGuest({
        fullName: cleanName,
        code: generatedCode,
        category: 'invitado',
        assignedTable: finalTable,
        mainGuestId: targetGuestId,
        totalPasses: 1,
        confirmedPasses: 1,
        rsvpStatus: 'pending',
        phone: newPhone.trim() || undefined,
        email: newEmail.trim() || undefined,
        dietaryRestrictions: newDietary.trim() || 'Ninguna',
        isProtocolParticipant: false,
      });

      if (onTableChange && finalTable !== 'Mesa por asignar') {
        onTableChange(finalTable);
      }

      setSuccessMessage(`¡"${newGuest.fullName}" registrado(a) y asignado(a) como acompañante de ${primaryGuestName}!`);
      if (onCompanionAdded) onCompanionAdded(newGuest.fullName);

      // Reset form
      setNewFullName('');
      setNewPhone('');
      setNewEmail('');
      setNewDietary('');

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error creating companion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-[#D9CEBF] relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#2D2A26]">
                Asignar Acompañante
              </h3>
              <p className="text-xs text-[#7A7268]">
                El acompañante se vinculará al titular y compartirá su misma mesa con rol de <strong>Invitado</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner: Current Guest, Pases & Mesa Target */}
        <div className="mt-4 p-3.5 bg-[#EBEBEB] rounded-xl border border-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-emerald-700 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A7268]">Invitado Titular:</span>
              <p className="text-xs font-bold text-[#2D2A26]">{primaryGuestName || 'Invitado en edición'}</p>
              <div className="flex items-center space-x-2 text-[11px] text-[#7A7268] mt-0.5">
                <span className="inline-flex items-center space-x-1 font-semibold text-emerald-800">
                  <Ticket className="w-3 h-3" />
                  <span>{totalPasses} {totalPasses === 1 ? 'pase total' : 'pases totales'}</span>
                </span>
                <span>•</span>
                <span className="text-stone-600 font-medium">{primaryCompanions.length} de {maxAllowedCompanions} acomp. asignados</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-transparent shrink-0">
            <Users className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A7268]">Mesa Asignada:</span>
              <input
                type="text"
                value={targetTable}
                onChange={(e) => setTargetTable(e.target.value)}
                placeholder="Mesa por asignar"
                className="block text-xs font-bold text-emerald-900 bg-transparent border-b border-dashed border-emerald-500 focus:outline-hidden focus:border-emerald-700 max-w-[140px]"
                title="Mesa compartida por el titular y sus acompañantes"
              />
            </div>
          </div>
        </div>

        {/* Pass Limit Warning Alert if limit reached */}
        {isPassLimitReached && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2 animate-fadeIn shadow-2xs">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Límite de acompañantes alcanzado</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  <strong>{primaryGuestName}</strong> tiene <strong>{totalPasses} {totalPasses === 1 ? 'pase' : 'pases'}</strong> (1 titular + {primaryCompanions.length} acompañante{primaryCompanions.length === 1 ? '' : 's'}). Puedes aumentar los pases aquí o asignar directamente.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleIncreasePasses}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aumentar a {totalPasses + 1} pases</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-3 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tabs: Choose existing vs Register new */}
        <div className="flex items-center space-x-2 mt-4 p-1 bg-[#EFEAE2] rounded-xl border border-[#D9CEBF]">
          <button
            type="button"
            onClick={() => setActiveTab('select')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'select'
                ? 'bg-[#EBEBEB] text-[#2D2A26] shadow-xs'
                : 'text-[#7A7268] hover:text-[#2D2A26]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Elegir de la Lista ({guests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('new');
              if (searchQuery.trim() && !newFullName) {
                setNewFullName(searchQuery.trim());
              }
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#EBEBEB] text-[#2D2A26] shadow-xs'
                : 'text-[#7A7268] hover:text-[#2D2A26]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Registrar Nuevo Acompañante</span>
          </button>
        </div>

        {/* Tab 1: Select Existing Guest */}
        {activeTab === 'select' && (
          <div className="mt-3 flex-1 flex flex-col min-h-0 space-y-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, código o mesa..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                autoFocus
              />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto max-h-[260px] space-y-2 pr-1">
              {filteredGuests.length === 0 ? (
                <div className="p-6 text-center bg-[#EBEBEB] rounded-xl border border-transparent space-y-3">
                  <p className="text-xs text-stone-500 font-medium">
                    No se encontró a <strong>"{searchQuery}"</strong> en la lista de invitados.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFullName(searchQuery.trim());
                      setActiveTab('new');
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Registrar "{searchQuery.trim() || 'Nuevo'}" como Acompañante</span>
                  </button>
                </div>
              ) : (
                filteredGuests.map((guest) => {
                  const isCurrentTable = targetTable && targetTable !== 'Mesa por asignar' && guest.assignedTable?.toLowerCase().trim() === targetTable.toLowerCase().trim();
                  return (
                    <div
                      key={guest.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrentTable
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-[#EBEBEB] border-transparent hover:border-emerald-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#2D2A26] truncate">
                            {guest.fullName}
                          </span>
                          <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-mono">
                            {guest.code}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-[#7A7268] mt-0.5">
                          <span>Mesa actual: <strong className="text-stone-700">{guest.assignedTable || 'Mesa por asignar'}</strong></span>
                          <span>•</span>
                          <span>Pases: {guest.totalPasses}</span>
                          {isCurrentTable && (
                            <span className="text-emerald-700 font-semibold">(Misma mesa)</span>
                          )}
                        </div>
                      </div>

                      {/* Asignar Acompañante button */}
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleAssignExistingGuest(guest)}
                        className="shrink-0 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Asignar como acompañante"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Asignar Acompañante</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick footer to register new if desired */}
            {filteredGuests.length > 0 && searchQuery.trim() && (
              <div className="pt-2 border-t border-transparent flex items-center justify-between">
                <span className="text-[11px] text-[#7A7268]">¿No está en la lista?</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewFullName(searchQuery.trim());
                    setActiveTab('new');
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrar nuevo acompañante</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Register New Companion */}
        {activeTab === 'new' && (
          <form onSubmit={handleCreateNewCompanion} className="mt-3 flex-1 flex flex-col min-h-0 space-y-3">
            
            <div className="bg-[#EBEBEB] p-3.5 rounded-xl border border-transparent space-y-3 flex-1 overflow-y-auto">
              
              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Nombre Completo del Acompañante <span className="text-[#2D3748]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ej. María Elena Rojas"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:border-emerald-600"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Rol Asignado
                  </label>
                  <div className="px-3 py-2 text-xs rounded-lg bg-stone-100 border border-stone-300 font-bold text-stone-800 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-stone-600" />
                    <span>Invitado (Automático)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Mesa Asignada
                  </label>
                  <div className="px-3 py-2 text-xs rounded-lg bg-emerald-50 border border-emerald-300 font-bold text-emerald-900 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{targetTable || 'Mesa por asignar'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Teléfono / WhatsApp <span className="text-stone-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+52 81 1234 5678"
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Correo Electrónico <span className="text-stone-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="maria@ejemplo.com"
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Restricciones Dietarias / Alergias <span className="text-stone-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newDietary}
                    onChange={(e) => setNewDietary(e.target.value)}
                    placeholder="Ej. Vegano, Sin gluten..."
                    className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                  />
                </div>
              </div>

            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-transparent">
              <button
                type="button"
                onClick={() => setActiveTab('select')}
                className="px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                Volver a la Lista
              </button>

              <button
                type="submit"
                disabled={!newFullName.trim() || isSubmitting}
                className={`inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  newFullName.trim() && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrar y Asignar Acompañante</span>
              </button>
            </div>

          </form>
        )}

        {/* Companions linked to this primary guest */}
        {primaryCompanions.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-transparent">
            <div className="flex items-center justify-between text-[11px] text-[#7A7268] mb-1.5">
              <span className="font-semibold flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Acompañantes asignados a este titular ({primaryCompanions.length}):</span>
              </span>
              <span className="text-[10px] text-stone-400">Clic en × para desvincular</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto">
              {primaryCompanions.map((comp) => (
                <span
                  key={comp.id}
                  className="px-2 py-0.5 bg-[#EBEBEB] border border-transparent rounded-md text-[11px] text-stone-700 font-medium flex items-center space-x-1.5 hover:border-amber-400 transition-colors"
                >
                  <span>{comp.fullName}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await updateGuest(comp.id, { 
                          mainGuestId: undefined, 
                          assignedTable: 'Mesa por asignar' 
                        });
                        setSuccessMessage(`"${comp.fullName}" fue desvinculado(a) de ${primaryGuestName}.`);
                        setTimeout(() => setSuccessMessage(null), 3000);
                      } catch (err) {
                        console.error('Error unlinking companion in modal:', err);
                      }
                    }}
                    className="text-stone-400 hover:text-rose-700 p-0.5 rounded-xs transition-colors cursor-pointer"
                    title={`Desvincular a ${comp.fullName} de ${primaryGuestName}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
