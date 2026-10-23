import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { PromotionFeeQuota, PartialPayment } from '../../types';
import { formatCurrencyInteger } from '../../lib/formatUtils';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Users,
  Calendar,
  CreditCard,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  Lock,
  Layers
} from 'lucide-react';

export const FinanzasModule: React.FC = () => {
  const {
    appTheme,
    promotionQuotas,
    addPromotionQuota,
    updatePromotionQuota,
    deletePromotionQuota,
    addPartialPaymentToQuota,
    deletePartialPaymentFromQuota,
    assignGlobalPromotionQuota,
    guests,
    isPromotionComisionUser,
    isLevel1Admin,
    isLevel3Planner,
    currentUser,
    activeWedding,
    settings
  } = useWedding();

  const isNeumorphic = appTheme === 'neumorphic' || true;

  // Can edit: Invitado con rol "Comisión", Super Admin (Nivel 1), Planner (Nivel 3), o comisión en auth/guest
  const canAssignQuota = Boolean(
    isLevel1Admin ||
    currentUser?.level === 1 ||
    currentUser?.level === 3 ||
    isPromotionComisionUser
  );

  // Modal states for Global Quota (Asignar Cuota General a Todos los Padres)
  const [isGlobalQuotaModalOpen, setIsGlobalQuotaModalOpen] = useState(false);
  const [globalQuotaAmountInput, setGlobalQuotaAmountInput] = useState('500');
  const [globalQuotaNotesInput, setGlobalQuotaNotesInput] = useState('Cuota General Fiesta de Promoción');
  const [globalQuotaSuccessMsg, setGlobalQuotaSuccessMsg] = useState('');

  // Modal states for Quota (Individual)
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [editingQuota, setEditingQuota] = useState<PromotionFeeQuota | null>(null);
  const [parentNameInput, setParentNameInput] = useState('');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [targetAmountInput, setTargetAmountInput] = useState('500');
  const [notesInput, setNotesInput] = useState('');

  // Modal states for Partial Payment
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeQuotaForPayment, setActiveQuotaForPayment] = useState<PromotionFeeQuota | null>(null);
  const [paymentConceptInput, setPaymentConceptInput] = useState('Cuota Fiesta Promoción');
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentDateInput, setPaymentDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [paymentReceiptInput, setPaymentReceiptInput] = useState('');

  // Expanded row details for partial payments
  const [expandedQuotaIds, setExpandedQuotaIds] = useState<Record<string, boolean>>({});

  // Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente' | 'parcial' | 'completado'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate totals
  const totalTarget = promotionQuotas.reduce((acc, q) => acc + (Number(q.totalTargetAmount) || 0), 0);
  const totalCollected = promotionQuotas.reduce((acc, q) => {
    const paidInQuota = (q.partialPayments || []).reduce((pAcc, p) => pAcc + (Number(p.amount) || 0), 0);
    return acc + paidInQuota;
  }, 0);
  const totalPending = Math.max(0, totalTarget - totalCollected);
  const collectionPercentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedQuotaIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Global Quota Modal (Asignar Cuota General a Todos los Padres)
  const handleOpenGlobalQuotaModal = () => {
    setGlobalQuotaAmountInput('500');
    setGlobalQuotaNotesInput('Cuota General Fiesta de Promoción');
    setGlobalQuotaSuccessMsg('');
    setIsGlobalQuotaModalOpen(true);
  };

  const handleSaveGlobalQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(globalQuotaAmountInput) || 0;
    if (amount <= 0) return;

    const result = await assignGlobalPromotionQuota(amount, globalQuotaNotesInput.trim());
    setGlobalQuotaSuccessMsg(`¡Listo! Se actualizó la cuota a ${result.updatedCount + result.createdCount} registro(s) de Padres de Familia.`);
    setTimeout(() => {
      setIsGlobalQuotaModalOpen(false);
      setGlobalQuotaSuccessMsg('');
    }, 1500);
  };

  // Open Quota creation / edition
  const handleOpenQuotaModal = (quota?: PromotionFeeQuota) => {
    if (quota) {
      setEditingQuota(quota);
      setParentNameInput(quota.parentName || '');
      setStudentNameInput(quota.studentName || '');
      setTargetAmountInput(String(quota.totalTargetAmount || ''));
      setNotesInput(quota.notes || '');
    } else {
      setEditingQuota(null);
      setParentNameInput('');
      setStudentNameInput('');
      setTargetAmountInput('500');
      setNotesInput('');
    }
    setIsQuotaModalOpen(true);
  };

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentNameInput.trim()) return;

    const amount = parseFloat(targetAmountInput) || 0;

    if (editingQuota) {
      await updatePromotionQuota(editingQuota.id, {
        parentName: parentNameInput.trim(),
        studentName: studentNameInput.trim(),
        totalTargetAmount: amount,
        notes: notesInput.trim()
      });
    } else {
      await addPromotionQuota({
        parentName: parentNameInput.trim(),
        studentName: studentNameInput.trim(),
        totalTargetAmount: amount,
        notes: notesInput.trim()
      });
    }
    setIsQuotaModalOpen(false);
  };

  // Open Payment creation
  const handleOpenPaymentModal = (quota: PromotionFeeQuota) => {
    setActiveQuotaForPayment(quota);
    setPaymentConceptInput('Cuota Fiesta Promoción');
    const quotaPaid = (quota.partialPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const quotaPending = Math.max(0, (Number(quota.totalTargetAmount) || 0) - quotaPaid);
    setPaymentAmountInput(quotaPending > 0 ? String(quotaPending) : '');
    setPaymentDateInput(new Date().toISOString().split('T')[0]);
    setPaymentReceiptInput('');
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuotaForPayment) return;
    const amount = parseFloat(paymentAmountInput) || 0;
    if (amount <= 0) return;

    await addPartialPaymentToQuota(activeQuotaForPayment.id, {
      concept: paymentConceptInput.trim() || 'Aporte / Pago Cuota',
      amount,
      date: paymentDateInput || new Date().toISOString().split('T')[0],
      receiptUrl: paymentReceiptInput.trim() || undefined
    });

    setIsPaymentModalOpen(false);
    // Auto expand row to show newly added partial payment
    setExpandedQuotaIds(prev => ({ ...prev, [activeQuotaForPayment.id]: true }));
  };

  // Helper to resolve student/child name from quota or linked guest
  const getResolvedStudentName = (quota: PromotionFeeQuota) => {
    if (quota.studentName && quota.studentName.trim()) {
      return quota.studentName.trim();
    }
    // Look up guest by parentId or parentName
    const matchedGuest = guests.find(g => 
      (quota.parentId && g.id === quota.parentId) ||
      (g.fullName && quota.parentName && g.fullName.trim().toLowerCase() === quota.parentName.trim().toLowerCase())
    );
    if (matchedGuest) {
      if (matchedGuest.childStudentName) return matchedGuest.childStudentName;
      if (matchedGuest.childStudentId) {
        const childGuest = guests.find(g => g.id === matchedGuest.childStudentId);
        if (childGuest) return childGuest.fullName;
      }
      if (matchedGuest.dressCodeNote) return matchedGuest.dressCodeNote;
    }
    return '';
  };

  // Filter list
  const filteredQuotas = promotionQuotas.filter(q => {
    const studentName = getResolvedStudentName(q);
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchesSearch = !searchTerm || 
      (q.parentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Padres de familia from guest list for quick selection
  const padresFromGuests = guests.filter(g => 
    g.category === 'padres_familia' || 
    (g.protocolRoleTitle && g.protocolRoleTitle.toLowerCase().includes('padre'))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-teal-800 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {settings.eventType === 'Baile de Promoción' ? 'Finanzas - Baile de Promoción' : 'Finanzas - Fiesta de Promoción'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Control de cuotas y pagos parciales realizados por los Padres de Familia
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Asignar Cuota General (Solo Comisión y Administrador) */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {canAssignQuota ? (
            <button
              type="button"
              id="btn-asignar-cuota-promocion"
              onClick={() => handleOpenGlobalQuotaModal()}
              className="px-5 py-2.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-teal-900 text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer border border-teal-200/50"
              title="Asignar cuota general para todos los Padres de Familia (Comisión y Administrador)"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>Asignar Cuota General</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center space-x-1.5 text-xs text-amber-800">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Modo lectura (Rol Comisión y Administrador pueden asignar cuotas)</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Banner / Badge */}
      <div className="bg-[#EBEBEB] rounded-2xl p-3.5 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-200/60 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 text-gray-700">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            Gestión y edición exclusiva para el rol <strong>Comisión</strong> y el <strong>Administrador</strong>. Cada registro permite asignar cuotas y registrar pagos fraccionados con concepto, monto y fecha.
          </span>
        </div>
        <div className="shrink-0 text-[11px] font-bold text-teal-800 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] px-2.5 py-1 rounded-xl">
          {promotionQuotas.length} Padres Registrados
        </div>
      </div>

      {/* KPI Cards: Resumen Financiero de la Promoción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Meta / Cuotas Esperadas */}
        <div className="bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 border border-gray-200/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Monto Total Esperado</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-indigo-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-display font-bold text-gray-900">
            {formatCurrencyInteger(totalTarget)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Meta global de aportes
          </div>
        </div>

        {/* Card 2: Total Recaudado / Pagado */}
        <div className="bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 border border-gray-200/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Total Recaudado</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-display font-bold text-emerald-800">
            {formatCurrencyInteger(totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {collectionPercentage}% completado
          </div>
        </div>

        {/* Card 3: Saldo Pendiente por Cobrar */}
        <div className="bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 border border-gray-200/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Saldo por Recaudar</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-display font-bold text-amber-800">
            {formatCurrencyInteger(totalPending)}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Cuotas pendientes o parciales
          </div>
        </div>

        {/* Card 4: Estado de Padres */}
        <div className="bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 border border-gray-200/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Cumplimiento Padres</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-display font-bold text-gray-900">
            {promotionQuotas.filter(q => q.status === 'completado').length} <span className="text-xs font-normal text-gray-500">/ {promotionQuotas.length}</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Padres con cuota al 100%
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#EBEBEB] rounded-2xl p-4 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por padre, alumno o nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'pendiente', 'parcial', 'completado'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-teal-900'
                  : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? 'Todos' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Quotas & Partial Payments List Table */}
      <div className="bg-[#EBEBEB] rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-gray-200/50 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-display text-lg sm:text-xl font-bold text-gray-900">
            Registro de Cuotas por Padre de Familia
          </h2>
          <span className="text-xs text-gray-500 font-semibold">
            {filteredQuotas.length} registros encontrados
          </span>
        </div>

        {filteredQuotas.length === 0 ? (
          <div className="p-8 text-center bg-[#EBEBEB] rounded-2xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] space-y-3">
            <Users className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-600">
              No se encontraron registros de cuotas para Padres de Familia.
            </p>
            {canAssignQuota && (
              <button
                type="button"
                id="btn-empty-asignar-cuota"
                onClick={() => handleOpenQuotaModal()}
                className="px-4 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] text-xs font-bold text-teal-900 transition-all cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-teal-700" />
                <span>Asignar Primera Cuota</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuotas.map(quota => {
              const isExpanded = Boolean(expandedQuotaIds[quota.id]);
              const payments = quota.partialPayments || [];
              const paidAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
              const pendingAmount = Math.max(0, (Number(quota.totalTargetAmount) || 0) - paidAmount);
              const percent = quota.totalTargetAmount > 0 
                ? Math.min(100, Math.round((paidAmount / quota.totalTargetAmount) * 100))
                : 0;

              return (
                <div
                  key={quota.id}
                  className="bg-[#EBEBEB] rounded-2xl p-4 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] border border-gray-200/60 transition-all"
                >
                  {/* Top Quota Summary Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    <div className="flex items-start space-x-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleRow(quota.id)}
                        className="p-1.5 mt-0.5 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer shrink-0"
                        title={isExpanded ? "Ocultar pagos parciales" : "Ver pagos parciales"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-serif-display font-bold text-base text-gray-900 truncate">
                            {quota.parentName}
                          </span>
                          {getResolvedStudentName(quota) && (
                            <span className="text-[11px] font-semibold text-teal-800 bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] px-2 py-0.5 rounded-md border border-teal-300">
                              Hijo/a: {getResolvedStudentName(quota)}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            quota.status === 'completado' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : quota.status === 'parcial'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {quota.status.toUpperCase()} ({percent}%)
                          </span>
                        </div>

                        {quota.notes && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-md">
                            {quota.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Financial Figures & Actions */}
                    <div className="flex items-center justify-between md:justify-end space-x-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-200/60">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Meta Total
                        </span>
                        <span className="font-mono font-bold text-sm text-gray-900">
                          {formatCurrencyInteger(quota.totalTargetAmount)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Pagado
                        </span>
                        <span className="font-mono font-bold text-sm text-emerald-700">
                          {formatCurrencyInteger(paidAmount)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Pendiente
                        </span>
                        <span className={`font-mono font-bold text-sm ${pendingAmount > 0 ? 'text-rose-700' : 'text-gray-400'}`}>
                          {formatCurrencyInteger(pendingAmount)}
                        </span>
                      </div>

                      {/* Comisión / Administrador Action Buttons */}
                      {canAssignQuota && (
                        <div className="flex items-center space-x-1.5 pl-2 border-l border-gray-300">
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(quota)}
                            title="Añadir pago parcial"
                            className="px-2.5 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff] text-teal-800 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border border-teal-200/50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pago</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenQuotaModal(quota)}
                            title="Editar cuota"
                            className="p-1.5 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:text-indigo-700 text-gray-600 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar el registro de cuota de ${quota.parentName}? Se eliminarán también todos sus pagos parciales registrados.`)) {
                                deletePromotionQuota(quota.id);
                              }
                            }}
                            title="Eliminar cuota"
                            className="p-1.5 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:text-rose-700 text-gray-600 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Partial Payments Section (Accordion) */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-gray-200 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span className="flex items-center space-x-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-teal-700" />
                          <span>Detalle de Pagos Parciales ({payments.length})</span>
                        </span>
                        {isPromotionComisionUser && (
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(quota)}
                            className="text-[11px] text-teal-800 hover:text-teal-900 font-bold underline cursor-pointer"
                          >
                            + Registrar pago parcial
                          </button>
                        )}
                      </div>

                      {payments.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-500 bg-[#EBEBEB] rounded-xl shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]">
                          Aún no se han registrado pagos parciales para este padre de familia.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-gray-300/80 text-gray-500">
                                <th className="py-1.5 px-2 font-semibold">Fecha</th>
                                <th className="py-1.5 px-2 font-semibold">Concepto del Pago</th>
                                <th className="py-1.5 px-2 font-semibold text-right">Monto</th>
                                <th className="py-1.5 px-2 font-semibold">Comprobante</th>
                                {isPromotionComisionUser && (
                                  <th className="py-1.5 px-2 font-semibold text-center w-12">Acción</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-gray-100/40">
                                  <td className="py-2 px-2 font-mono text-gray-700 whitespace-nowrap">
                                    {payment.date}
                                  </td>
                                  <td className="py-2 px-2 font-medium text-gray-800">
                                    {payment.concept}
                                  </td>
                                  <td className="py-2 px-2 font-mono font-bold text-emerald-700 text-right whitespace-nowrap">
                                    {formatCurrencyInteger(payment.amount)}
                                  </td>
                                  <td className="py-2 px-2 text-gray-500 text-[11px] truncate max-w-[120px]">
                                    {payment.receiptUrl ? (
                                      <a
                                        href={payment.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-teal-700 hover:underline"
                                      >
                                        Ver Comprobante
                                      </a>
                                    ) : (
                                      '—'
                                    )}
                                  </td>
                                  {canAssignQuota && (
                                    <td className="py-2 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(`¿Eliminar pago de ${formatCurrencyInteger(payment.amount)} (${payment.concept})?`)) {
                                            deletePartialPaymentFromQuota(quota.id, payment.id);
                                          }
                                        }}
                                        title="Eliminar este pago parcial"
                                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================
          MODAL 0: ASIGNAR CUOTA GENERAL A TODOS LOS PADRES DE FAMILIA
         ======================================================== */}
      {isGlobalQuotaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#EBEBEB] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[20px_20px_40px_#1a1a1a,-20px_-20px_40px_#444444] border border-gray-300 relative text-gray-900 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-teal-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg sm:text-xl font-bold text-gray-900">
                    Asignar Cuota General
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Fija o actualiza la cuota esperada para todos los Padres de Familia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGlobalQuotaModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {globalQuotaSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-emerald-800 flex items-center space-x-3 text-xs font-bold animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{globalQuotaSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSaveGlobalQuota} className="space-y-4 text-xs">
                
                <div className="bg-[#EBEBEB] p-3.5 rounded-2xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-200 text-gray-600 leading-relaxed text-[11.5px]">
                  <p className="font-medium">
                    Al guardar este monto, se establecerá automáticamente como <strong>Meta Total de Aporte</strong> para todos los padres de familia registrados en el evento.
                  </p>
                  <p className="text-gray-500 text-[10.5px] mt-1">
                    * Los pagos parciales ya abonados por cada padre se conservarán intactos.
                  </p>
                </div>

                {/* Monto de la Cuota General */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Monto de la Cuota General (S/.) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">
                      S/.
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="500"
                      value={globalQuotaAmountInput}
                      onChange={(e) => setGlobalQuotaAmountInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none font-mono font-bold text-base"
                    />
                  </div>
                </div>

                {/* Concepto / Nota */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Concepto o Motivo de la Cuota
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Cuota General Fiesta de Promoción 2026"
                    value={globalQuotaNotesInput}
                    onChange={(e) => setGlobalQuotaNotesInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none font-medium"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-200/80">
                  <button
                    type="button"
                    onClick={() => setIsGlobalQuotaModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 font-bold hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-teal-950 font-bold transition-all cursor-pointer border border-teal-300"
                  >
                    Asignar a Todos
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: REGISTRAR / EDITAR CUOTA DE PADRE DE FAMILIA
         ======================================================== */}
      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#EBEBEB] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[20px_20px_40px_#1a1a1a,-20px_-20px_40px_#444444] border border-gray-300 relative text-gray-900 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-teal-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-serif-display text-lg sm:text-xl font-bold text-gray-900">
                  {editingQuota ? 'Editar Cuota Asignada' : 'Asignar Cuota - Padre de Familia'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuota} className="space-y-4 text-xs">
              
              {/* Quick Select from existing Padres de Familia guests */}
              {padresFromGuests.length > 0 && !editingQuota && (
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Seleccionar de la lista de invitados (Opcional):
                  </label>
                  <select
                    onChange={(e) => {
                      const sel = padresFromGuests.find(p => p.fullName === e.target.value);
                      if (sel) {
                        setParentNameInput(sel.fullName);
                        if (sel.childStudentName) {
                          setStudentNameInput(sel.childStudentName);
                        } else if (sel.childStudentId) {
                          const child = guests.find(g => g.id === sel.childStudentId);
                          if (child) setStudentNameInput(child.fullName);
                        } else if (sel.dressCodeNote) {
                          setStudentNameInput(sel.dressCodeNote);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 border-none focus:outline-none"
                  >
                    <option value="">-- Elegir padre de familia registrado --</option>
                    {padresFromGuests.map(p => (
                      <option key={p.id} value={p.fullName}>
                        {p.fullName} {p.protocolRoleTitle ? `(${p.protocolRoleTitle})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nombre del Padre de Familia */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Nombre del Padre / Madre de Familia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Mendoza o Familia Mendoza Ramos"
                  value={parentNameInput}
                  onChange={(e) => setParentNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none font-medium"
                />
              </div>

              {/* Alumno Asociado */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Nombre del Alumno / Hijo(a)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mateo Mendoza"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none font-medium"
                />
              </div>

              {/* Monto Total Esperado */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Monto Total de la Cuota / Aporte *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                    S/.
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="500"
                    value={targetAmountInput}
                    onChange={(e) => setTargetAmountInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Notas u observaciones */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Notas u Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Compromiso de pago en 3 cuotas mensuales."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 font-bold hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-teal-900 font-bold transition-all cursor-pointer border border-teal-200/60"
                >
                  {editingQuota ? 'Actualizar Cuota' : 'Asignar Cuota'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: REGISTRAR PAGO PARCIAL (Concepto, Monto, Fecha)
         ======================================================== */}
      {isPaymentModalOpen && activeQuotaForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#EBEBEB] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[20px_20px_40px_#1a1a1a,-20px_-20px_40px_#444444] border border-gray-300 relative text-gray-900 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-gray-900">
                  Registrar Pago Parcial
                </h3>
                <p className="text-xs text-teal-800 font-semibold mt-0.5">
                  Padre: {activeQuotaForPayment.parentName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              
              {/* Concepto del Pago */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Concepto del Pago *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cuota 1 / Anticipo Fiesta / Cuota Octubre"
                  value={paymentConceptInput}
                  onChange={(e) => setPaymentConceptInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none font-medium"
                />
              </div>

              {/* Monto del Pago */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Monto del Pago (S/.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                    S/.
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    placeholder="150"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-emerald-800 focus:outline-none font-mono font-bold text-sm"
                  />
                </div>
              </div>

              {/* Fecha del Pago */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Fecha del Pago *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDateInput}
                  onChange={(e) => setPaymentDateInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none font-medium"
                />
              </div>

              {/* Comprobante / Nro Operación (Opcional) */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  N° de Operación o Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej: Op. BCP #984214"
                  value={paymentReceiptInput}
                  onChange={(e) => setPaymentReceiptInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 font-bold hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-emerald-800 font-bold transition-all cursor-pointer border border-emerald-200/60"
                >
                  Guardar Pago
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
