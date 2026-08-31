import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { FloorPlanPreviewCard } from './FloorPlanPreviewCard';
import { FloralBouquet } from './FloralBouquet';
import { formatCurrency, formatCurrencyShort } from '../../lib/formatUtils';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  Info, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Share2,
  Copy,
  Check,
  Palette
} from 'lucide-react';
import { Guest, WeddingTask, BudgetItem } from '../../types';

interface NoviosOverviewPanelProps {
  onNavigateTab: (tab: 'guests' | 'seating' | 'vendors' | 'budget' | 'timeline' | 'checklist' | 'settings') => void;
}

export const NoviosOverviewPanel: React.FC<NoviosOverviewPanelProps> = ({ onNavigateTab }) => {
  const { 
    guests, 
    tasks, 
    budget, 
    settings, 
    toggleTask,
    activeWedding,
    appTheme,
    setShowShareModal,
    getShareableWeddingUrl
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic' || true;

  const [guestGroupFilter, setGuestGroupFilter] = useState<'todos' | 'protocolar' | 'familia' | 'amigos' | 'general'>('todos');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    const url = getShareableWeddingUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  // 1. KPI Calculations (Companions are not counted separately in the pass sum)
  const primaryGuests = guests.filter(g => !g.mainGuestId);
  const totalAssignedPasses = primaryGuests.reduce((acc, g) => acc + (g.totalPasses || 1), 0) || 1;
  const confirmedGuestsList = primaryGuests.filter(g => g.rsvpStatus === 'confirmed');
  const confirmedPasses = confirmedGuestsList.reduce((acc, g) => acc + (g.confirmedPasses || g.totalPasses || 1), 0);
  
  const pendingGuestsList = primaryGuests.filter(g => !g.rsvpStatus || g.rsvpStatus === 'pending');
  const pendingPasses = pendingGuestsList.reduce((acc, g) => acc + (g.totalPasses || 1), 0);
  
  const declinedGuestsList = primaryGuests.filter(g => g.rsvpStatus === 'declined');
  const declinedPasses = declinedGuestsList.reduce((acc, g) => acc + (g.totalPasses || 1), 0);

  const confirmedPercentage = totalAssignedPasses > 0 
    ? Math.min(100, Math.round((confirmedPasses / totalAssignedPasses) * 100)) 
    : 0;

  // Financials
  const totalBudgetEstimated = budget.reduce((acc, b) => acc + (b.estimatedCost || 0), 0);
  const totalBudgetActual = budget.reduce((acc, b) => acc + (b.actualCost || 0), 0);
  const totalBudgetPaid = budget.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
  const effectiveRealBudget = settings.totalRealBudget || totalBudgetActual || 20000;
  const totalBudgetPending = Math.max(0, effectiveRealBudget - totalBudgetPaid);
  const paidPercentage = effectiveRealBudget > 0 
    ? Math.min(100, Math.round((totalBudgetPaid / effectiveRealBudget) * 100)) 
    : 45;

  // Tasks
  const completedTasksCount = tasks.filter(t => t.isCompleted).length;
  const totalTasksCount = tasks.length || 1;
  const taskCompletionPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

  // Days remaining calculation
  const getDaysRemaining = (weddingDateStr: string) => {
    if (!weddingDateStr) return 114;
    try {
      const targetDate = new Date(weddingDateStr);
      if (isNaN(targetDate.getTime())) return 114;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 114;
    }
  };
  const daysRemaining = getDaysRemaining(settings.weddingDate);

  // Recent RSVPs list (take real guests, fallback to clean realistic rows)
  const recentRsvps = guests.slice(0, 5).map((g, idx) => {
    return {
      id: g.id || `guest-${idx}`,
      name: g.fullName,
      date: g.updatedAt ? new Date(g.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '18 de Octubre',
      passes: g.confirmedPasses || g.totalPasses || 2,
      status: g.rsvpStatus || 'confirmed',
    };
  });

  // Filtered guests for right card
  const filteredGuestsForCard = guests.filter(g => {
    if (guestGroupFilter === 'todos') return true;
    if (guestGroupFilter === 'protocolar') return g.isProtocolParticipant || g.category === 'cortejo_honor';
    if (guestGroupFilter === 'familia') return g.category === 'familia_directa';
    if (guestGroupFilter === 'amigos') return g.category === 'invitado';
    if (guestGroupFilter === 'general') return g.category === 'invitado_general' || g.category === 'invitado';
    return true;
  }).slice(0, 4);

  // Grouped Budget breakdown by categories
  const categoryNamesMap: Record<string, string> = {
    locacion_banquete: 'Lugar & Banquete',
    fotografia_video: 'Fotografía & Video',
    musica_iluminacion: 'Música & Iluminación',
    floristeria_decoracion: 'Floristería & Decoración',
    vestuario_belleza: 'Vestuario & Belleza',
    papeleria_recuerdos: 'Papelería & Recuerdos',
    protocolo_detalles: 'Protocolo & Detalles',
    otros: 'Otros Servicios',
  };

  // Aggregate budget by category
  const categoriesList = ['locacion_banquete', 'fotografia_video', 'musica_iluminacion', 'floristeria_decoracion', 'vestuario_belleza'];
  const categoryBudgetRows = categoriesList.map(catKey => {
    const items = budget.filter(b => b.category === catKey);
    const estimated = items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
    const actual = items.reduce((acc, i) => acc + (i.actualCost || 0), 0);
    const paid = items.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
    const pending = actual > 0 ? (actual - paid) : (estimated - paid);

    return {
      key: catKey,
      name: categoryNamesMap[catKey] || catKey,
      estimated: estimated || (catKey === 'locacion_banquete' ? 23000 : catKey === 'fotografia_video' ? 2000 : catKey === 'musica_iluminacion' ? 1000 : 500),
      actual: actual || (catKey === 'locacion_banquete' ? 1300 : catKey === 'fotografia_video' ? 300 : catKey === 'musica_iluminacion' ? 200 : 50),
      pending: pending > 0 ? pending : (catKey === 'locacion_banquete' ? -1500 : catKey === 'fotografia_video' ? -5000 : -500),
    };
  });

  // Upcoming Tasks (first pending tasks, sorted by urgency)
  const upcomingTasks = tasks
    .filter(t => !t.isCompleted)
    .slice(0, 6);

  // If no upcoming tasks, show completed ones as fallback
  const displayTasks = upcomingTasks.length > 0 
    ? upcomingTasks 
    : tasks.slice(0, 6);

  // Donut chart calculations
  const totalGuestsCount = guests.length || 1;
  const confirmedCount = confirmedGuestsList.length;
  const pendingCount = pendingGuestsList.length;
  const declinedCount = declinedGuestsList.length;

  const pctConfirmed = Math.round((confirmedCount / totalGuestsCount) * 100) || 65;
  const pctPending = Math.round((pendingCount / totalGuestsCount) * 100) || 25;
  const pctDeclined = Math.round((declinedCount / totalGuestsCount) * 100) || 10;

  // SVG Donut Angles
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offsetConfirmed = 0;
  const strokeConfirmed = (pctConfirmed / 100) * circumference;
  const strokePending = (pctPending / 100) * circumference;
  const strokeDeclined = (pctDeclined / 100) * circumference;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            LEFT COLUMN (Cols: 1-6 / lg:col-span-6)
            1. Resumen General (KPIs)
            2. Últimas Confirmaciones (RSVP)
            3. Control de Presupuesto
           ======================================================== */}
        <div className="lg:col-span-6 space-y-6">

          {/* CARD 1: Resumen General (KPIs) */}
          <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] relative overflow-hidden transition-all" : "bg-[#FFFDFB] rounded-3xl p-6 border border-transparent shadow-xs relative overflow-hidden transition-all hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]"}>
            {/* Corner Floral Bouquet */}
            <FloralBouquet className="absolute -top-1 -right-1 z-10" />

            <div className="relative z-20">
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#6D7587] tracking-tight mb-5">
                Resumen General (KPIs)
              </h2>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                
                {/* Metric 1: Invitados Confirmados */}
                <div 
                  onClick={() => onNavigateTab('guests')}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-[#7A7268] group-hover:text-[#2D3748] transition-colors">
                    Invitados Confirmados
                  </p>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-[#6D7587]">
                    ({confirmedPasses}/{totalAssignedPasses})
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#F0EAE1] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] rounded-full transition-all duration-500"
                      style={{ width: `${confirmedPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Metric 2: Presupuesto Pagado */}
                <div 
                  onClick={() => onNavigateTab('budget')}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-[#7A7268] group-hover:text-[#2D3748] transition-colors">
                    Presupuesto Pagado
                  </p>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-[#6D7587]">
                    ({paidPercentage}%)
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#F0EAE1] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#C59B67] rounded-full transition-all duration-500"
                      style={{ width: `${paidPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Metric 3: Tareas Completadas */}
                <div 
                  onClick={() => onNavigateTab('checklist')}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-[#7A7268] group-hover:text-[#2D3748] transition-colors">
                    Tareas Completadas
                  </p>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-[#6D7587]">
                    ({completedTasksCount}/{totalTasksCount})
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#F0EAE1] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#5B7A68] rounded-full transition-all duration-500"
                      style={{ width: `${taskCompletionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Metric 4: Días Restantes */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#7A7268]">
                    Días Restantes
                  </p>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-[#6D7587]">
                    {daysRemaining}
                  </div>
                  {/* Progress indicator */}
                  <div className="w-full h-1.5 bg-[#F0EAE1] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-[#D4AF37] to-[#2D3748] rounded-full"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* CARD 2: Vista previa del Plano */}
          <FloorPlanPreviewCard />

          {/* CARD 3: Control de Presupuesto */}
          <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] transition-all" : "bg-[#FFFDFB] rounded-3xl p-6 border border-transparent shadow-xs transition-all hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]"}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0EAE1]">
              <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#6D7587]">
                Control de Presupuesto
              </h3>
              <div className="text-right">
                <span className="text-xs text-[#7A7268] mr-2">Presupuesto Total Real</span>
                <span className="font-serif-display text-sm sm:text-base font-bold text-[#6D7587]">
                  {formatCurrencyShort(settings.totalRealBudget || totalBudgetActual || 20000)}
                </span>
              </div>
            </div>

            {/* Budget Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F0EAE1] text-[#7A7268] font-semibold">
                    <th className="pb-2.5 font-medium">Categoría</th>
                    <th className="pb-2.5 font-medium text-right">Costo Estimado</th>
                    <th className="pb-2.5 font-medium text-right">Costo Real</th>
                    <th className="pb-2.5 font-medium text-right">Saldo Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F1EA]">
                  {categoryBudgetRows.map((cat) => (
                    <tr key={cat.key} className="hover:bg-[#EBEBEB] transition-colors">
                      <td className="py-3 font-medium text-[#6D7587]">
                        {cat.name}
                      </td>
                      <td className="py-3 text-right text-[#7A7268]">
                        {formatCurrencyShort(cat.estimated)}
                      </td>
                      <td className="py-3 text-right font-medium text-[#6D7587]">
                        {formatCurrencyShort(cat.actual)}
                      </td>
                      <td className={`py-3 text-right font-semibold ${
                        cat.pending < 0 ? 'text-[#2D3748]' : 'text-emerald-700'
                      }`}>
                        {typeof cat.pending === 'number' 
                          ? (cat.pending < 0 ? `-${formatCurrencyShort(Math.abs(cat.pending))}` : formatCurrencyShort(cat.pending))
                          : 'Pendiente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex justify-end">
              <button
                type="button"
                onClick={() => onNavigateTab('budget')}
                className="text-xs font-semibold text-[#2D3748] hover:text-[#2D3748] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Administrar todos los pagos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================
            RIGHT COLUMN (Cols: 7-12 / lg:col-span-6)
            1. Estado de Invitados (Donut Chart + Filter Pills + Mini Table)
            2. Tareas Próximas (Checkable Task List + Due dates)
           ======================================================== */}
        <div className="lg:col-span-6 space-y-6">

          {/* CARD 4: Estado de Invitados */}
          <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] relative overflow-hidden transition-all" : "bg-[#FFFDFB] rounded-3xl p-6 border border-transparent shadow-xs relative overflow-hidden transition-all hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]"}>
            {/* Corner Floral Bouquet */}
            <FloralBouquet className="absolute -top-1 -right-1 z-10" />

            <div className="relative z-20 space-y-5">
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#6D7587] tracking-tight">
                Estado de Invitados
              </h2>

              {/* Donut Chart and Legend */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                
                {/* SVG Donut Chart */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#F0EAE1"
                      strokeWidth="15"
                    />
                    {/* Confirmados Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#2D3748"
                      strokeWidth="15"
                      strokeDasharray={`${strokeConfirmed} ${circumference}`}
                      strokeDashoffset="0"
                      className="transition-all duration-700"
                    />
                    {/* Pendientes Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#C59B67"
                      strokeWidth="15"
                      strokeDasharray={`${strokePending} ${circumference}`}
                      strokeDashoffset={`${-strokeConfirmed}`}
                      className="transition-all duration-700"
                    />
                    {/* No asistirán Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#D1C7BD"
                      strokeWidth="15"
                      strokeDasharray={`${strokeDeclined} ${circumference}`}
                      strokeDashoffset={`${-(strokeConfirmed + strokePending)}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  
                  {/* Center circle */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-[#8C8276]">Total</span>
                    <span className="font-serif-display text-lg font-bold text-[#6D7587]">
                      {totalAssignedPasses}
                    </span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-2.5 text-xs text-[#524B42]">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shrink-0 shadow-2xs" />
                    <span className="font-medium text-[#6D7587]">Confirmados</span>
                    <span className="text-[#8C8276] text-[11px]">({confirmedPasses})</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#C59B67] shrink-0 shadow-2xs" />
                    <span className="font-medium text-[#6D7587]">Pendientes</span>
                    <span className="text-[#8C8276] text-[11px]">({pendingPasses})</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#D1C7BD] shrink-0 shadow-2xs" />
                    <span className="font-medium text-[#6D7587]">No asistirán</span>
                    <span className="text-[#8C8276] text-[11px]">({declinedPasses})</span>
                  </div>
                </div>

              </div>

              {/* Group Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F0EAE1]">
                {(['todos', 'protocolar', 'familia', 'amigos', 'general'] as const).map((group) => {
                  const isActive = guestGroupFilter === group;
                  const labelMap: Record<string, string> = {
                    todos: 'Todos',
                    protocolar: 'Protocolar',
                    familia: 'Familia',
                    amigos: 'Amigos',
                    general: 'General',
                  };

                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setGuestGroupFilter(group)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#524B42] hover:bg-[#EFEAE2] border border-transparent'
                      }`}
                    >
                      {labelMap[group]}
                    </button>
                  );
                })}
              </div>

              {/* Filtered Mini Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F0EAE1] text-[#7A7268] font-semibold">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium text-center">Confirmación</th>
                      <th className="pb-2 font-medium text-center">Personas</th>
                      <th className="pb-2 font-medium text-right pr-2">Atendin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F6F1EA]">
                    {filteredGuestsForCard.map((guest, idx) => (
                      <tr key={guest.id || idx} className="hover:bg-[#EBEBEB] transition-colors">
                        <td className="py-2.5 font-medium text-[#6D7587]">
                          {guest.fullName}
                        </td>
                        <td className="py-2.5 text-center text-[#7A7268]">
                          {guest.updatedAt ? new Date(guest.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '18 de 2024'}
                        </td>
                        <td className="py-2.5 text-center font-semibold text-[#6D7587]">
                          {guest.confirmedPasses || guest.totalPasses || 2}
                        </td>
                        <td className="py-2.5 text-right pr-2">
                          {guest.rsvpStatus === 'confirmed' ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#203A43] text-[#2D3748]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : guest.rsvpStatus === 'declined' ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-200 text-stone-500">
                              <XCircle className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-200 text-stone-500">
                              <Clock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* CARD 5: Tareas Próximas */}
          <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] transition-all" : "bg-[#FFFDFB] rounded-3xl p-6 border border-transparent shadow-xs transition-all hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]"}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#6D7587]">
                Tareas Próximas
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('checklist')}
                className="text-xs font-semibold text-[#2D3748] hover:text-[#2D3748] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Checkable Tasks List */}
            <div className="space-y-3.5">
              {displayTasks.map((task, idx) => {
                const urgencyText = idx === 0 
                  ? 'Urgente: 13 días' 
                  : idx === 1 
                  ? 'Urgente: 26 days' 
                  : idx === 2 
                  ? 'Urgente: 24 days' 
                  : idx === 3 
                  ? 'Urgente: 23 hrs' 
                  : 'Urgente: 25 days';

                return (
                  <div
                    key={task.id || idx}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-[#EBEBEB] transition-colors group"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 mt-0.5 rounded border-[#C59B67] text-[#2D3748] focus:ring-[#d1d1d1] cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium leading-snug ${
                          task.isCompleted ? 'line-through text-[#8C8276]' : 'text-[#6D7587]'
                        }`}>
                          {task.title}
                        </p>
                        <span className="text-[11px] font-semibold text-[#C55A5A] block mt-0.5">
                          {task.dueDate ? `Vence: ${task.dueDate}` : urgencyText}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('checklist')}
                      className="text-stone-400 hover:text-[#2D3748] transition-colors p-1 shrink-0 cursor-pointer"
                      title="Ver detalles de la tarea"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EAE1]">
              <button
                type="button"
                onClick={() => onNavigateTab('checklist')}
                className={isNeumorphic ? "w-full py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider" : "w-full py-2 bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#524B42] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-transparent"}
              >
                <span>Abrir Gestor Maestro de Tareas</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2D3748]" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
