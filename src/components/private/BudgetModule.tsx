import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { BudgetItem } from '../../types';
import { BudgetItemModal } from './BudgetItemModal';
import { formatCurrencyInteger } from '../../lib/formatUtils';
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  RefreshCw,
  Building2,
  Check,
  Sparkles
} from 'lucide-react';

export const BudgetModule: React.FC = () => {
  const {
    appTheme, 
    budget, 
    vendors,
    syncBudgetWithVendors,
    settings, 
    updateSettings, 
    addBudgetItem, 
    updateBudgetItem, 
    deleteBudgetItem, 
    canEditActiveWedding, 
    isLevel1Admin 
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isEditingTargetBudget, setIsEditingTargetBudget] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [targetBudgetInput, setTargetBudgetInput] = useState<string>(
    String(settings.totalRealBudget ?? 20000)
  );

  const totalEstimated = budget.reduce((acc, b) => acc + b.estimatedCost, 0);
  const totalActual = budget.reduce((acc, b) => acc + b.actualCost, 0);
  const totalPaid = budget.reduce((acc, b) => acc + b.paidAmount, 0);
  
  // Real target budget configured in Settings or sum of actual items
  const effectiveTotalRealBudget = settings.totalRealBudget !== undefined ? settings.totalRealBudget : (totalActual || 20000);
  const totalPending = Math.max(0, effectiveTotalRealBudget - totalPaid);
  const paidPercentage = effectiveTotalRealBudget > 0 ? Math.round((totalPaid / effectiveTotalRealBudget) * 100) : 0;

  // Total amount contracted with registered vendors
  const totalVendorsContracted = vendors.reduce((acc, v) => acc + (Number(v.totalCost) || 0), 0);
  const totalVendorsPaid = vendors.reduce((acc, v) => acc + (Number(v.paidAmount) || 0), 0);

  const handleSaveTargetBudget = async () => {
    const parsed = parseFloat(targetBudgetInput) || 0;
    await updateSettings({ totalRealBudget: parsed });
    setIsEditingTargetBudget(false);
  };

  const handleSyncWithVendors = async () => {
    try {
      setIsSyncing(true);
      await syncBudgetWithVendors();
      setSyncSuccessMessage(`¡Presupuesto actualizado! Se eliminaron todos los datos ficticios y se cargaron los pagos y costos reales de los ${vendors.length} proveedores registrados.`);
      setTimeout(() => {
        setSyncSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Error syncing budget with vendors:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (editingItem) {
      updateBudgetItem(editingItem.id, data);
    } else {
      addBudgetItem(data);
    }
  };

  const handleDelete = (id: string, concept: string) => {
    if (window.confirm(`¿Deseas eliminar el gasto "${concept}"?`)) {
      deleteBudgetItem(id);
    }
  };

  const getCategoryLabel = (cat: string) => {
    if (!cat) return 'Otros Servicios';
    switch (cat) {
      case 'locacion_banquete': return 'Locación & Banquete';
      case 'fotografia_video': return 'Fotografía & Video';
      case 'musica_iluminacion': return 'Música & Iluminación';
      case 'floristeria_decoracion': return 'Floristería & Decoración';
      case 'vestuario_belleza': return 'Vestuario & Belleza';
      case 'papeleria_recuerdos': return 'Papelería & Recuerdos';
      case 'protocolo_detalles': return 'Coordinación & Protocolo';
      case 'otros': return 'Otros Servicios';
      default: return cat;
    }
  };

  const filteredBudget = budget.filter(b => {
    if (categoryFilter === 'all') return true;
    return b.category === categoryFilter || getCategoryLabel(b.category) === categoryFilter;
  });

  // Extract all distinct categories present in budget items
  const activeCategories = Array.from(
    new Set(budget.map((b) => getCategoryLabel(b.category)))
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
            Control de Presupuesto & Finanzas
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSyncWithVendors}
            disabled={isSyncing}
            id="btn-sync-budget-vendors"
            className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            title="Sincronizar todos los datos de Gestión de Proveedores & Servicios con este Presupuesto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar Proveedores</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            id="btn-add-budget"
            className="px-5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-semibold hover:bg-[#EBEBEB] transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Concepto</span>
          </button>
        </div>
      </div>

      {/* Sync Success Feedback Banner */}
      {syncSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between animate-fadeIn shadow-2xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncSuccessMessage}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">☁️ Guardado en la nube</span>
        </div>
      )}

      {/* Vendor Synchronized Summary Strip */}
      <div className="bg-linear-to-r from-[#FAF7F2] to-amber-50/50 rounded-2xl p-4 border border-transparent flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-[#2D2A26] flex items-center space-x-1.5">
              <span>Sincronización con Gestión de Proveedores & Servicios</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                {vendors.length} Proveedores Registrados
              </span>
            </div>
            <p className="text-[11px] text-[#7A7268] mt-0.5">
              Los cambios en cotizaciones o anticipos de proveedores se reflejan y guardan automáticamente en este módulo y en la nube.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-[#EBEBEB] px-3.5 py-2 rounded-xl border border-transparent shrink-0 self-start md:self-auto">
          <div>
            <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-semibold">Total Contratos</span>
            <span className="font-bold font-mono text-[#2D2A26]">{formatCurrencyInteger(totalVendorsContracted)}</span>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-semibold">Anticipos Proveedores</span>
            <span className="font-bold font-mono text-emerald-700">{formatCurrencyInteger(totalVendorsPaid)}</span>
          </div>
        </div>
      </div>

      {/* KPI Financial Cards (Reflects Mockup: Control de Presupuesto y Saldos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Presupuesto Real */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 border border-transparent shadow-2xs" : "bg-[#EBEBEB] rounded-2xl p-5 border border-transparent shadow-2xs"}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#7A7268]">Presupuesto Total Real</span>
            <div className="flex items-center space-x-1">
              {(canEditActiveWedding || isLevel1Admin) && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetBudgetInput(String(effectiveTotalRealBudget));
                    setIsEditingTargetBudget(!isEditingTargetBudget);
                  }}
                  className="p-1 text-stone-400 hover:text-[#2D3748] rounded-lg transition-colors cursor-pointer"
                  title="Modificar Presupuesto Total"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="w-7 h-7 rounded-lg bg-[#2D2A26]/10 text-[#2D2A26] flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {isEditingTargetBudget ? (
            <div className="space-y-2 py-1 animate-fadeIn">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">S/.</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={targetBudgetInput}
                  onChange={(e) => setTargetBudgetInput(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 text-sm font-bold rounded-lg border border-transparent bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-none"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveTargetBudget}
                  className="px-2.5 py-1 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-[11px] font-bold rounded-lg hover:bg-[#EBEBEB] transition-colors cursor-pointer"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTargetBudget(false)}
                  className="px-2.5 py-1 bg-stone-100 text-stone-600 text-[11px] font-medium rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="font-serif-display text-2xl font-bold text-[#2D2A26]">
              {formatCurrencyInteger(effectiveTotalRealBudget)}
            </div>
          )}

          <div className="text-[11px] text-[#7A7268] mt-1">
            Gastos sumados: {formatCurrencyInteger(totalActual)} • Est: {formatCurrencyInteger(totalEstimated)}
          </div>
        </div>

        {/* Card 2: Anticipos Pagados */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 border border-transparent shadow-2xs" : "bg-[#EBEBEB] rounded-2xl p-5 border border-transparent shadow-2xs"}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#7A7268]">Anticipos Pagados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-display text-2xl font-bold text-emerald-700">
            {formatCurrencyInteger(totalPaid)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            {paidPercentage}% del total liquidado
          </div>
        </div>

        {/* Card 3: Saldo Pendiente */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 border border-transparent shadow-2xs" : "bg-[#EBEBEB] rounded-2xl p-5 border border-transparent shadow-2xs"}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#7A7268]">Saldo por Liquidar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-display text-2xl font-bold text-amber-700">
            {formatCurrencyInteger(totalPending)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            Pendiente para la semana final
          </div>
        </div>

        {/* Card 4: Progress Bar Card */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 border border-transparent shadow-2xs flex flex-col justify-between" : "bg-[#EBEBEB] rounded-2xl p-5 border border-transparent shadow-2xs flex flex-col justify-between"}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#7A7268]">Progreso de Pago</span>
              <span className="text-xs font-bold text-[#2D3748]">{paidPercentage}%</span>
            </div>
            <div className="w-full bg-[#EFEBE4] rounded-full h-3 overflow-hidden">
              <div 
                className="bg-linear-to-r from-[#2D3748] via-[#C5A880] to-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-[#8C8276] mt-2 block">
            {budget.length} conceptos registrados
          </span>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 text-xs border-b border-transparent">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
            categoryFilter === 'all'
              ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs'
              : 'bg-[#F2ECE3] text-[#524B42] hover:bg-[#E8DCCF]'
          }`}
        >
          Todas las Categorías
        </button>
        {activeCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs'
                : 'bg-[#F2ECE3] text-[#524B42] hover:bg-[#E8DCCF]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Budget Table */}
      <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-transparent shadow-xs overflow-hidden" : "bg-[#EBEBEB] rounded-2xl border border-transparent shadow-xs overflow-hidden"}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EBEBEB] text-[#7A7268] border-b border-transparent uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Concepto & Proveedor</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Estimado</th>
                <th className="px-4 py-3 text-right">Costo Real</th>
                <th className="px-4 py-3 text-right">Pagado / Anticipo</th>
                <th className="px-4 py-3 text-right">Saldo Pendiente</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE3] text-[#2D2A26]">
              {filteredBudget.map((item) => {
                const balance = Math.max(0, item.actualCost - item.paidAmount);
                return (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                    
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#2D2A26]">{item.concept}</div>
                      {item.vendor && (
                        <div className="mt-1 flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
                            <Building2 className="w-3 h-3 mr-1 text-amber-700" />
                            {item.vendor}
                            {item.vendorId && (
                              <span title="Sincronizado" className="flex items-center">
                                <Check className="w-3 h-3 ml-1 text-emerald-600" />
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-[#9E9488] italic mt-1">{item.notes}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold text-[#2D2A26]">
                      {formatCurrencyInteger(item.actualCost)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-emerald-700 font-semibold">
                      {formatCurrencyInteger(item.paidAmount)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-700">
                      {balance === 0 ? <span className="text-emerald-600 font-normal">Liquidado</span> : formatCurrencyInteger(balance)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status === 'paid' ? 'Pagado' : item.status === 'partial' ? 'Anticipo' : 'Pendiente'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-[#7A7268] hover:text-[#2D3748] hover:bg-[#F2ECE3] rounded-lg transition-colors cursor-pointer"
                          title="Editar Gasto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.concept)}
                          className="p-1.5 text-[#7A7268] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Gasto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <BudgetItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        itemToEdit={editingItem}
      />

    </div>
  );
};
