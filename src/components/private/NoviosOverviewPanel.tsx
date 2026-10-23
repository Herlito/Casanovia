import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { FloorPlanPreviewCard } from './FloorPlanPreviewCard';
import { FloralBouquet } from './FloralBouquet';
import { PrintReportsModal, PrintableReportType } from './PrintReportsModal';
import { SubirWebModal } from '../modals/SubirWebModal';
import { GuestImportModal } from './GuestImportModal';
import { GuestModal } from './GuestModal';
import { purgeResidualFilesFromHosting } from '../../services/hostingStorage';
import { formatCurrency, formatCurrencyShort } from '../../lib/formatUtils';
import { formatWeddingDateCustom } from '../../lib/dateUtils';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  UserPlus,
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
  Palette,
  Printer,
  Download,
  UtensilsCrossed,
  Map,
  MapPin,
  FileSpreadsheet,
  Star,
  Briefcase,
  Building2,
  CreditCard,
  FileText,
  Layers,
  Trash2,
  Eraser,
  FileJson,
  X,
  AlertTriangle,
  Heart,
  Loader2
} from 'lucide-react';
import { downloadPackage } from '../../utils/downloadPackage';
import { Guest, WeddingTask, BudgetItem } from '../../types';

interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

interface CircularDonutChartProps {
  size?: number;
  strokeWidth?: number;
  segments: DonutSegment[];
  centerPrimary: string;
  centerSecondary?: string;
  primaryColorClass?: string;
}

/**
 * Infographic segmented donut chart matching the reference design:
 * - Rounded stroke caps (strokeLinecap="round")
 * - Segment separation gaps
 * - Soft elevated drop shadow for depth
 * - Neumorphic soft inset center
 */
const CircularDonutChart: React.FC<CircularDonutChartProps> = ({
  size = 78,
  strokeWidth = 7,
  segments,
  centerPrimary,
  centerSecondary,
  primaryColorClass = 'text-gray-900',
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;
  
  // Filter active non-zero segments
  const validSegments = segments.filter(s => s.value > 0);
  const totalValue = validSegments.reduce((sum, s) => sum + s.value, 0);
  const numSegments = validSegments.length;

  // Gap between segments in degrees
  const gapDegrees = numSegments > 1 ? Math.min(14, 360 / (numSegments * 3.5)) : 0;
  const totalAvailableDegrees = 360 - (numSegments * gapDegrees);

  // Helper to convert polar coords to cartesian (starting at top: -90deg)
  const polarToCartesian = (cx: number, cy: number, r: number, angleDegrees: number) => {
    const radians = ((angleDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(radians),
      y: cy + r * Math.sin(radians)
    };
  };

  // Helper to build SVG arc path
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const sweep = endAngle - startAngle;
    if (sweep <= 0) return '';
    const safeEndAngle = sweep >= 360 ? startAngle + 359.99 : endAngle;
    const start = polarToCartesian(cx, cy, r, safeEndAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = sweep > 180 ? '1' : '0';

    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  let currentAngle = 0;
  const arcs = validSegments.map((seg, idx) => {
    const fraction = totalValue > 0 ? seg.value / totalValue : 0;
    const spanDegrees = fraction * totalAvailableDegrees;
    const startAngle = currentAngle + (gapDegrees / 2);
    const endAngle = startAngle + spanDegrees;
    currentAngle = endAngle + (gapDegrees / 2);

    return {
      ...seg,
      path: describeArc(center, center, radius, startAngle, endAngle),
      spanDegrees
    };
  });

  return (
    <div className="relative flex items-center justify-center shrink-0 group/chart" style={{ width: size, height: size }}>
      {/* Neumorphic Inset Circle Background */}
      <div 
        className="absolute inset-0 rounded-full bg-[#EBEBEB] shadow-[inset_2.5px_2.5px_5px_#d1d1d1,inset_-2.5px_-2.5px_5px_#ffffff]" 
        style={{ margin: strokeWidth * 0.7 }}
      />
      
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="relative z-10 overflow-visible"
      >
        <defs>
          <filter id={`donut-shadow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.5" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Subtle background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#dedede"
          strokeWidth={strokeWidth}
          strokeOpacity={0.6}
        />

        {/* Infographic Arc Segments with Gaps and Rounded Caps */}
        {totalValue > 0 ? (
          arcs.map((arc, i) => (
            <path
              key={i}
              d={arc.path}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter={`url(#donut-shadow-${size})`}
              className="transition-all duration-700 ease-out hover:opacity-90"
            />
          ))
        ) : (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={strokeWidth}
            strokeDasharray="4 6"
          />
        )}
      </svg>

      {/* Center Text Metrics Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none px-0.5">
        <span className={`text-[13px] sm:text-sm font-bold font-serif-display leading-none tracking-tight ${primaryColorClass}`}>
          {centerPrimary}
        </span>
        {centerSecondary && (
          <span className="text-[8px] font-bold uppercase tracking-tighter text-gray-500 leading-none mt-1">
            {centerSecondary}
          </span>
        )}
      </div>
    </div>
  );
};

interface NoviosOverviewPanelProps {
  onNavigateTab: (tab: 'guests' | 'seating' | 'vendors' | 'budget' | 'timeline' | 'checklist' | 'settings') => void;
}

export const NoviosOverviewPanel: React.FC<NoviosOverviewPanelProps> = ({ onNavigateTab }) => {
  const { 
    guests, 
    tasks, 
    budget, 
    promotionQuotas,
    settings, 
    toggleTask,
    activeWedding,
    appTheme,
    isLevel1Admin,
    isLevel3Planner,
    isLevel4Free,
    showUpgradeNotice,
    currentUser,
    clearWeddingData,
    setShowFloorPlanModal,
    getShareableWeddingUrl,
    importGuests,
    addGuest
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic' || true;

  // Guest Import / Manual Add Modals State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);

  const userLevel = currentUser?.level ?? (isLevel1Admin ? 1 : isLevel3Planner ? 3 : 2);
  const isLevel123 = userLevel === 1 || userLevel === 2 || userLevel === 3 || isLevel1Admin || isLevel3Planner;
  const hasNoGuests = guests.length === 0;

  // Print Modal State
  const [isPrintHubOpen, setIsPrintHubOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PrintableReportType>('invitados');
  const [printMode, setPrintMode] = useState<'print' | 'pdf'>('print');

  // Admin Modals State
  const [showSubirWebModal, setShowSubirWebModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [downloadTarGzStatus, setDownloadTarGzStatus] = useState<{ loading: boolean; text?: string; error?: string } | null>(null);
  const [showPurgeResidualsModal, setShowPurgeResidualsModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeResultMsg, setPurgeResultMsg] = useState<{ type: 'success' | 'error'; message: string; count?: number } | null>(null);
  const [clearSuccess, setClearSuccess] = useState(false);

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

  // Seated Guests (Con asiento/mesa asignada)
  const seatedGuestsList = primaryGuests.filter(
    g => g.assignedTable && g.assignedTable.trim() !== '' && !g.assignedTable.toLowerCase().includes('sin asignar') && !g.assignedTable.toLowerCase().includes('por asignar')
  );
  const seatedPasses = seatedGuestsList.reduce((acc, g) => acc + (g.confirmedPasses || g.totalPasses || 1), 0);
  const seatedPercentage = totalAssignedPasses > 0 
    ? Math.min(100, Math.round((seatedPasses / totalAssignedPasses) * 100)) 
    : 0;

  // Financials
  const isPromotion = 
    (settings.eventType && settings.eventType.toLowerCase().includes('promoc')) ||
    (activeWedding?.coupleNames && activeWedding.coupleNames.toLowerCase().includes('promoc')) ||
    (settings.coupleNames && settings.coupleNames.toLowerCase().includes('promoc'));

  const totalBudgetEstimated = budget.reduce((acc, b) => acc + (b.estimatedCost || 0), 0);
  const totalBudgetActual = budget.reduce((acc, b) => acc + (b.actualCost || 0), 0);
  const totalBudgetPaid = budget.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
  const effectiveRealBudget = settings.totalRealBudget || totalBudgetActual || 20000;
  const totalBudgetPending = Math.max(0, effectiveRealBudget - totalBudgetPaid);
  const paidPercentage = effectiveRealBudget > 0 
    ? Math.min(100, Math.round((totalBudgetPaid / effectiveRealBudget) * 100)) 
    : 0;

  // Promotion Quotas & Partial Payments Calculations
  const promotionTotalTarget = (promotionQuotas || []).reduce((acc, q) => acc + (Number(q.totalTargetAmount) || 0), 0);
  const promotionTotalPaid = (promotionQuotas || []).reduce((acc, q) => {
    return acc + (q.partialPayments || []).reduce((pSum, p) => pSum + (Number(p.amount) || 0), 0);
  }, 0);
  const promotionTotalPending = Math.max(0, promotionTotalTarget - promotionTotalPaid);
  const promotionPaidPercentage = promotionTotalTarget > 0 
    ? Math.min(100, Math.round((promotionTotalPaid / promotionTotalTarget) * 100)) 
    : 0;

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
      return diffDays;
    } catch {
      return 114;
    }
  };
  const daysRemaining = getDaysRemaining(settings.weddingDate);
  const weddingDateFormatted = formatWeddingDateCustom(settings.weddingDate);

  // Upcoming Tasks
  const upcomingTasks = tasks
    .filter(t => !t.isCompleted)
    .slice(0, 6);

  const displayTasks = upcomingTasks.length > 0 
    ? upcomingTasks 
    : tasks.slice(0, 6);

  const handleOpenReport = (report: PrintableReportType) => {
    if (isLevel4Free) {
      showUpgradeNotice('Descarga & Impresión de Reportes', 'La descarga de archivos PDF y la impresión de reportes no están disponibles para cuentas Nivel 4 (Novia Free). Sube a un plan de pago para descargar e imprimir todos los reportes de tu evento.');
      return;
    }
    setSelectedReport(report);
    setIsPrintHubOpen(true);
  };

  const handleExecuteClearWedding = async () => {
    if (!isLevel1Admin) return;
    setIsClearing(true);
    try {
      await clearWeddingData();
      setShowClearModal(false);
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 5000);
    } catch (err) {
      console.error('Error al limpiar la boda:', err);
      setShowClearModal(false);
    } finally {
      setIsClearing(false);
    }
  };

  const handleExecutePurge = async () => {
    if (!isLevel1Admin) return;
    setIsPurging(true);
    setPurgeResultMsg(null);
    try {
      const res = await purgeResidualFilesFromHosting();
      if (res.success) {
        setPurgeResultMsg({
          type: 'success',
          message: res.message,
          count: res.purgedCount
        });
      } else {
        setPurgeResultMsg({
          type: 'error',
          message: res.message || 'Error al conectar con el servidor para purgar archivos.'
        });
      }
    } catch (err: any) {
      setPurgeResultMsg({
        type: 'error',
        message: 'No se pudo completar la limpieza de archivos residuales.'
      });
    } finally {
      setIsPurging(false);
      setShowPurgeResidualsModal(false);
    }
  };

  const mobileNavItems = [
    {
      id: 'guests',
      label: 'Invitados',
      icon: Users,
      onClick: () => onNavigateTab('guests'),
    },
    {
      id: 'seating',
      label: 'Mesas',
      icon: UtensilsCrossed,
      onClick: () => onNavigateTab('seating'),
    },
    {
      id: 'vendors',
      label: 'Proveedores',
      icon: Building2,
      onClick: () => onNavigateTab('vendors'),
    },
    {
      id: 'budget',
      label: 'Pagos',
      icon: CreditCard,
      onClick: () => onNavigateTab('budget'),
    },
    {
      id: 'floorplan',
      label: 'Planos',
      icon: MapPin,
      onClick: () => setShowFloorPlanModal(true),
    },
    {
      id: 'timeline',
      label: 'Cronograma',
      icon: Calendar,
      onClick: () => onNavigateTab('timeline'),
    },
    {
      id: 'protocol',
      label: 'Protocolo',
      icon: FileText,
      onClick: () => handleOpenReport('protocolo'),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ========================================================
          MOBILE QUICK ACCESS MENU (Reference Design for Level 2 to 5)
          Full-width elegant button cards matching reference photo
         ======================================================== */}
      <div className="block sm:hidden bg-[#EBEBEB] rounded-[2rem] p-3.5 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/50 space-y-2.5 animate-fadeIn mb-2">
        {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="w-full bg-[#EBEBEB] px-4 py-3.5 rounded-2xl shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] transition-all flex items-center justify-between group cursor-pointer text-left border border-white/60 active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-800 shrink-0">
                    <Icon className="w-4 h-4 text-gray-800" />
                  </div>
                  <span className="font-semibold text-sm text-gray-800 tracking-wide truncate">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>

      {/* ========================================================
          ADMIN ONLY ACTION BAR (Only visible to Level 1 Admin)
         ======================================================== */}
      {isLevel1Admin && (
        <div className="bg-[#EBEBEB] rounded-[2rem] p-4 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-800">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Herramientas de Mantenimiento & Control de Administrador
                </span>
                <span className="text-[11px] text-gray-500">
                  Acceso exclusivo para Administrador Nivel 1
                </span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* 1. Limpiar Archivos Residuales */}
              <button
                type="button"
                id="btn-admin-purge-residuals-dash"
                onClick={() => {
                  setPurgeResultMsg(null);
                  setShowPurgeResidualsModal(true);
                }}
                className="px-3.5 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-800 hover:text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-gray-300/60"
                title="Limpiar archivos residuales del servidor"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-700" />
                <span>Limpiar Archivos Residuales</span>
              </button>

              {/* 2. Migrar Datos (1-Clic) */}
              <button
                type="button"
                id="btn-admin-migrardatos-dash"
                onClick={() => setShowSubirWebModal(true)}
                className="px-3.5 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-800 hover:text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-gray-300/60"
                title="Sincronizar y respaldar datos en hosting"
              >
                <FileJson className="w-3.5 h-3.5 text-gray-700" />
                <span>Migrar Datos (1-Clic)</span>
              </button>

              {/* 3. Descargar Actualización (tar.gz) */}
              <button
                type="button"
                id="btn-admin-download-targz-dash"
                disabled={downloadTarGzStatus?.loading}
                onClick={async () => {
                  await downloadPackage('SubirWeb_Actualizacion.tar.gz', (st) => {
                    setDownloadTarGzStatus(st);
                    if (!st.loading && !st.error) {
                      setTimeout(() => setDownloadTarGzStatus(null), 4000);
                    }
                  });
                }}
                className="px-3.5 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-800 hover:text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-gray-300/60 disabled:opacity-75"
                title="Descargar paquete de actualización SubirWeb_Actualizacion.tar.gz (~2.6 MB verificado)"
              >
                {downloadTarGzStatus?.loading ? (
                  <Loader2 className="w-3.5 h-3.5 text-gray-700 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-gray-700" />
                )}
                <span>
                  {downloadTarGzStatus?.loading
                    ? (downloadTarGzStatus.text || 'Descargando (2.6 MB)...')
                    : downloadTarGzStatus?.text
                    ? downloadTarGzStatus.text
                    : downloadTarGzStatus?.error
                    ? 'Reintentar Descarga'
                    : 'Descargar Actualización (.tar.gz)'}
                </span>
              </button>

              {/* 4. Limpiar Boda Activa */}
              <button
                type="button"
                id="btn-admin-clear-wedding-dash"
                onClick={() => setShowClearModal(true)}
                className="px-3.5 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-800 hover:text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-gray-300/60"
                title="Limpiar y reiniciar registros de la boda activa"
              >
                <Eraser className="w-3.5 h-3.5 text-gray-700" />
                <span>Limpiar Boda Activa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {clearSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-3 text-xs shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">¡Boda limpiada con éxito!</span>
            <span>Se eliminaron todos los registros e invitados dejándolos en blanco para llenar.</span>
          </div>
        </div>
      )}

      {purgeResultMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between space-x-3 text-xs shadow-xs animate-fadeIn ${
          purgeResultMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center space-x-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${purgeResultMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
            <div>
              <span className="font-bold block">{purgeResultMsg.type === 'success' ? '¡Limpieza Completada!' : 'Error de Limpieza'}</span>
              <span>{purgeResultMsg.message}</span>
            </div>
          </div>
          <button type="button" onClick={() => setPurgeResultMsg(null)} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CARD: ¿Quieres importar tu lista de invitados? (Para Nivel 1, 2 y 3 cuando la boda no tiene ningún invitado) */}
      {isLevel123 && hasNoGuests && (
        <div className="bg-[#EBEBEB] rounded-[2.5rem] p-6 sm:p-8 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] relative overflow-hidden transition-all border border-rose-200/50 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-rose-600 shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  ¿Quieres importar tu lista de invitados?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Aún no tienes invitados registrados en esta boda. Puedes importar tu lista desde un archivo Excel/CSV o ingresarlos manualmente uno a uno.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                id="btn-dash-import-guests-list"
                onClick={() => setIsImportModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-[#EBEBEB] text-rose-700 font-bold text-xs sm:text-sm shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center space-x-2 cursor-pointer border border-rose-200/60"
              >
                <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                <span>Importar lista</span>
              </button>

              <button
                type="button"
                id="btn-dash-add-guest-manual"
                onClick={() => setIsAddGuestModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-[#EBEBEB] text-gray-800 font-bold text-xs sm:text-sm shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center space-x-2 cursor-pointer border border-gray-300/60"
              >
                <UserPlus className="w-4 h-4 text-gray-700" />
                <span>Ingresar manualmente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            LEFT COLUMN (Cols: 1-6 / lg:col-span-6)
            1. Resumen General (KPIs) - Con los 6 Indicadores
            2. Vista previa del Plano
            3. Control de Presupuesto
           ======================================================== */}
        <div className="lg:col-span-6 space-y-6">

          {/* CARD 1: Resumen General (KPIs) */}
          <div className="bg-[#EBEBEB] rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-gray-300/60 relative overflow-hidden transition-all">
            <div className="relative z-20 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                  Resumen General (KPIs)
                </h2>
              </div>

              {/* Grid with the 6 requested indicators (2 cols mobile, 2 cols tablet/desktop) */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                
                {/* 1. Indicador: Invitados (Con gráfico circular infográfico) */}
                <button 
                  type="button"
                  id="btn-kpi-invitados"
                  onClick={() => onNavigateTab('guests')}
                  className="kpi-card-button w-full text-left bg-[#EBEBEB] p-3 sm:p-4 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1.5 min-w-0">
                      <Users className="w-3.5 h-3.5 text-[#2D3748] shrink-0" />
                      <span className="truncate">Invitados</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] px-1.5 py-0.5 rounded-md shrink-0">
                      Total
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="space-y-1 min-w-0">
                      <div className="text-lg sm:text-xl font-serif-display font-bold text-gray-900 leading-tight">
                        {totalAssignedPasses}
                        <span className="text-[10px] sm:text-xs font-sans font-normal text-gray-500 block truncate">pases total</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-600 space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D3748] shrink-0" />
                          <span className="truncate">{primaryGuests.length} Titul.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0" />
                          <span className="truncate">{Math.max(0, totalAssignedPasses - primaryGuests.length)} Acomp.</span>
                        </div>
                      </div>
                    </div>

                    <CircularDonutChart
                      size={74}
                      strokeWidth={7}
                      segments={[
                        { value: primaryGuests.length, color: '#2D3748' },
                        { value: Math.max(0, totalAssignedPasses - primaryGuests.length), color: '#94A3B8' }
                      ]}
                      centerPrimary={`${totalAssignedPasses}`}
                      centerSecondary="pases"
                      primaryColorClass="text-[#2D3748]"
                    />
                  </div>
                </button>

                {/* 2. Indicador: Invitados Confirmados (Con gráfico circular infográfico) */}
                <button 
                  type="button"
                  id="btn-kpi-confirmados"
                  onClick={() => onNavigateTab('guests')}
                  className="kpi-card-button w-full text-left bg-[#EBEBEB] p-3 sm:p-4 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1.5 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D3748] shrink-0" />
                      <span className="truncate">Confirmados</span>
                    </span>
                    <span className="text-[9px] sm:text-xs font-bold text-gray-700 bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] px-1.5 py-0.5 rounded-md shrink-0">
                      {confirmedPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="space-y-1 min-w-0">
                      <div className="text-lg sm:text-xl font-serif-display font-bold text-gray-900 leading-tight">
                        {confirmedPasses}
                        <span className="text-[10px] sm:text-xs font-sans font-normal text-gray-500 block truncate">de {totalAssignedPasses}</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-600 space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D3748] shrink-0" />
                          <span className="truncate">{confirmedPasses} Sí</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0" />
                          <span className="truncate">{pendingPasses} Pend.</span>
                        </div>
                        {declinedPasses > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] shrink-0" />
                            <span className="truncate">{declinedPasses} No</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <CircularDonutChart
                      size={74}
                      strokeWidth={7}
                      segments={[
                        { value: confirmedPasses, color: '#2D3748' },
                        { value: pendingPasses, color: '#94A3B8' },
                        { value: declinedPasses, color: '#CBD5E1' }
                      ]}
                      centerPrimary={`${confirmedPercentage}%`}
                      centerSecondary="conf."
                      primaryColorClass="text-[#2D3748]"
                    />
                  </div>
                </button>

                {/* 3. Indicador: Invitados en Mesa (Con gráfico circular infográfico) */}
                <button 
                  type="button"
                  id="btn-kpi-enmesa"
                  onClick={() => onNavigateTab('seating')}
                  className="kpi-card-button w-full text-left bg-[#EBEBEB] p-3 sm:p-4 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1.5 min-w-0">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-[#2D3748] shrink-0" />
                      <span className="truncate">En Mesa</span>
                    </span>
                    <span className="text-[9px] sm:text-xs font-bold text-gray-700 bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] px-1.5 py-0.5 rounded-md shrink-0">
                      {seatedPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="space-y-1 min-w-0">
                      <div className="text-lg sm:text-xl font-serif-display font-bold text-gray-900 leading-tight">
                        {seatedPasses}
                        <span className="text-[10px] sm:text-xs font-sans font-normal text-gray-500 block truncate">asignados</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-600 space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D3748] shrink-0" />
                          <span className="truncate">{seatedPasses} Mesa</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0" />
                          <span className="truncate">{Math.max(0, totalAssignedPasses - seatedPasses)} Sin mesa</span>
                        </div>
                      </div>
                    </div>

                    <CircularDonutChart
                      size={74}
                      strokeWidth={7}
                      segments={[
                        { value: seatedPasses, color: '#2D3748' },
                        { value: Math.max(0, totalAssignedPasses - seatedPasses), color: '#94A3B8' }
                      ]}
                      centerPrimary={`${seatedPercentage}%`}
                      centerSecondary="mesa"
                      primaryColorClass="text-[#2D3748]"
                    />
                  </div>
                </button>

                {/* 4. Indicador: Tareas Realizadas (Con gráfico circular infográfico) */}
                <button 
                  type="button"
                  id="btn-kpi-tareas"
                  onClick={() => onNavigateTab('checklist')}
                  className="kpi-card-button w-full text-left bg-[#EBEBEB] p-3 sm:p-4 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1.5 min-w-0">
                      <CheckSquare className="w-3.5 h-3.5 text-[#2D3748] shrink-0" />
                      <span className="truncate">Tareas</span>
                    </span>
                    <span className="text-[9px] sm:text-xs font-bold text-gray-700 bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] px-1.5 py-0.5 rounded-md shrink-0">
                      {taskCompletionPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="space-y-1 min-w-0">
                      <div className="text-lg sm:text-xl font-serif-display font-bold text-gray-900 leading-tight">
                        {completedTasksCount}
                        <span className="text-[10px] sm:text-xs font-sans font-normal text-gray-500 block truncate">de {totalTasksCount}</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-600 space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D3748] shrink-0" />
                          <span className="truncate">{completedTasksCount} Listas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] shrink-0" />
                          <span className="truncate">{Math.max(0, totalTasksCount - completedTasksCount)} Pend.</span>
                        </div>
                      </div>
                    </div>

                    <CircularDonutChart
                      size={74}
                      strokeWidth={7}
                      segments={[
                        { value: completedTasksCount, color: '#2D3748' },
                        { value: Math.max(0, totalTasksCount - completedTasksCount), color: '#CBD5E1' }
                      ]}
                      centerPrimary={`${taskCompletionPercentage}%`}
                      centerSecondary="listas"
                      primaryColorClass="text-[#2D3748]"
                    />
                  </div>
                </button>

                {/* 5. Indicador: Presupuesto / Finanzas (Avance Financiero - Con gráfico circular infográfico) */}
                <button 
                  type="button"
                  id="btn-kpi-presupuesto"
                  onClick={() => onNavigateTab('budget')}
                  className="kpi-card-button w-full text-left bg-[#EBEBEB] p-3 sm:p-4 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1.5 min-w-0">
                      <DollarSign className="w-3.5 h-3.5 text-[#2D3748] shrink-0" />
                      <span className="truncate">{isPromotion ? 'Finanzas' : 'Presupuesto'}</span>
                    </span>
                    <span className="text-[9px] sm:text-xs font-bold text-gray-700 bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] px-1.5 py-0.5 rounded-md shrink-0">
                      {isPromotion ? promotionPaidPercentage : paidPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="space-y-1 min-w-0">
                      <div className="text-base sm:text-lg font-serif-display font-bold text-gray-900 leading-tight truncate">
                        {formatCurrencyShort(isPromotion ? promotionTotalPaid : totalBudgetPaid)}
                        <span className="text-[10px] font-sans font-normal text-gray-500 block truncate">
                          {isPromotion ? 'recaudado' : 'pagado'}
                        </span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-600 space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0" />
                          <span className="truncate">Pend: {formatCurrencyShort(isPromotion ? promotionTotalPending : totalBudgetPending)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D3748] shrink-0" />
                          <span className="truncate">Total: {formatCurrencyShort(isPromotion ? promotionTotalTarget : effectiveRealBudget)}</span>
                        </div>
                      </div>
                    </div>

                    <CircularDonutChart
                      size={74}
                      strokeWidth={7}
                      segments={[
                        { value: isPromotion ? promotionTotalPaid : totalBudgetPaid, color: '#2D3748' },
                        { value: isPromotion ? promotionTotalPending : totalBudgetPending, color: '#94A3B8' }
                      ]}
                      centerPrimary={`${isPromotion ? promotionPaidPercentage : paidPercentage}%`}
                      centerSecondary={isPromotion ? "cobrado" : "pagado"}
                      primaryColorClass="text-[#2D3748]"
                    />
                  </div>
                </button>

                {/* 6. Indicador: Cuenta Regresiva (Con gráfico circular infográfico) */}
                <button 
                  type="button"
                  id="btn-kpi-cuentaregresiva"
                  onClick={() => onNavigateTab('timeline')}
                  className="kpi-card-button w-full text-left bg-[#EBEBEB] p-3 sm:p-4 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-[#2D3748] shrink-0" />
                      <span className="truncate">Cuenta Regresiva</span>
                    </span>
                    <span className="text-[9px] sm:text-xs font-bold text-gray-700 bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] px-1.5 py-0.5 rounded-md shrink-0">
                      {daysRemaining > 0 ? `${daysRemaining}d` : 'Día D'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-lg sm:text-xl font-serif-display font-bold text-gray-900 leading-tight">
                        {daysRemaining > 0 ? `${daysRemaining} días` : daysRemaining === 0 ? '¡Hoy!' : 'Celebrada'}
                        <span className="text-[10px] sm:text-xs font-sans font-normal text-gray-500 block truncate">
                          {daysRemaining > 0 ? 'para la boda' : 'evento nupcial'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate pt-0.5">
                        {weddingDateFormatted}
                      </p>
                    </div>

                    <CircularDonutChart
                      size={74}
                      strokeWidth={7}
                      segments={[
                        { value: Math.max(1, daysRemaining > 0 ? daysRemaining : 1), color: '#2D3748' },
                        { value: Math.max(1, Math.min(180, Math.max(0, 180 - (daysRemaining > 0 ? daysRemaining : 0)))), color: '#CBD5E1' }
                      ]}
                      centerPrimary={daysRemaining > 0 ? `${daysRemaining}` : '0'}
                      centerSecondary="días"
                      primaryColorClass="text-[#2D3748]"
                    />
                  </div>
                </button>

              </div>
            </div>
          </div>

          {/* CARD 2: Vista previa del Plano */}
          <FloorPlanPreviewCard />

        </div>

        {/* ========================================================
            RIGHT COLUMN (Cols: 7-12 / lg:col-span-6)
            1. TARJETA: "Imprimir" (Con accesos rápidos y selector Imprimir/PDF)
            2. Tareas Próximas (Checkable Task List + Due dates)
           ======================================================== */}
        <div className="lg:col-span-6 space-y-6">

          {/* CARD 4: "Imprimir" (NUEVA TARJETA SOLICITADA) */}
          <div className="bg-[#EBEBEB] rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-gray-300/60 relative overflow-hidden transition-all">
            <div className="relative z-20 space-y-5">
              
              {/* Card Header & Format Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-300/50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-gray-800">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                      Imprimir
                    </h2>
                  </div>
                </div>

                {/* Check / Toggle Mode Selector */}
                <div className="flex items-center bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 rounded-xl p-1 text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPrintMode('print')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      printMode === 'print'
                        ? 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-900'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintMode('pdf')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      printMode === 'pdf'
                        ? 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-blue-700'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                </div>
              </div>

              {/* Quick Access Buttons Grid (2 cols mobile, 3 cols tablet/desktop) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                
                {/* 1. Distribución de invitados en mesas */}
                <button
                  type="button"
                  id="btn-print-mesas"
                  onClick={() => handleOpenReport('mesas')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all text-left flex flex-col justify-between cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-indigo-700 shrink-0 group-hover:scale-105 transition-transform">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-xs font-bold text-gray-900 block truncate group-hover:text-indigo-900 transition-colors">
                      Distribución de Mesas
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {printMode === 'pdf' ? 'Descargar PDF' : 'Imprimir Seating'}
                    </span>
                  </div>
                </button>

                {/* 2. Plano del Local */}
                <button
                  type="button"
                  id="btn-print-plano"
                  onClick={() => handleOpenReport('plano')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all text-left flex flex-col justify-between cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                      <Map className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-xs font-bold text-gray-900 block truncate group-hover:text-emerald-900 transition-colors">
                      Plano del Local
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {printMode === 'pdf' ? 'Descargar PDF' : 'Imprimir Plano'}
                    </span>
                  </div>
                </button>

                {/* 3. Lista de Invitados */}
                <button
                  type="button"
                  id="btn-print-invitados"
                  onClick={() => handleOpenReport('invitados')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all text-left flex flex-col justify-between cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-blue-700 shrink-0 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-xs font-bold text-gray-900 block truncate group-hover:text-blue-900 transition-colors">
                      Lista de Invitados
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {printMode === 'pdf' ? 'Descargar PDF' : 'Imprimir Listado'}
                    </span>
                  </div>
                </button>

                {/* 4. Cronograma Completo */}
                <button
                  type="button"
                  id="btn-print-cronograma"
                  onClick={() => handleOpenReport('cronograma')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all text-left flex flex-col justify-between cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-xs font-bold text-gray-900 block truncate group-hover:text-amber-900 transition-colors">
                      Cronograma
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {printMode === 'pdf' ? 'Descargar PDF' : 'Imprimir Escaleta'}
                    </span>
                  </div>
                </button>

                {/* 5. Protocolo */}
                <button
                  type="button"
                  id="btn-print-protocolo"
                  onClick={() => handleOpenReport('protocolo')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all text-left flex flex-col justify-between cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-purple-700 shrink-0 group-hover:scale-105 transition-transform">
                      <Star className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-xs font-bold text-gray-900 block truncate group-hover:text-purple-900 transition-colors">
                      Protocolo
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {printMode === 'pdf' ? 'Descargar PDF' : 'Imprimir Cortejo'}
                    </span>
                  </div>
                </button>

                {/* 6. Presupuesto */}
                <button
                  type="button"
                  id="btn-print-presupuesto"
                  onClick={() => handleOpenReport('presupuesto')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all text-left flex flex-col justify-between cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-xs font-bold text-gray-900 block truncate group-hover:text-teal-900 transition-colors">
                      Presupuesto
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {printMode === 'pdf' ? 'Descargar PDF' : 'Imprimir Balance'}
                    </span>
                  </div>
                </button>

                {/* 7. Lista de Proveedores */}
                <button
                  type="button"
                  id="btn-print-proveedores"
                  onClick={() => handleOpenReport('proveedores')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 transition-all text-left flex flex-col justify-between cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-stone-700 shrink-0 group-hover:scale-105 transition-transform">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-stone-600 transition-colors" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-xs font-bold text-gray-900 block truncate group-hover:text-stone-900 transition-colors">
                      Proveedores
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {printMode === 'pdf' ? 'Descargar PDF' : 'Imprimir Contactos'}
                    </span>
                  </div>
                </button>

              </div>
            </div>
          </div>

          {/* CARD 5: Tareas Próximas */}
          <div className="bg-[#EBEBEB] rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-gray-300/60 transition-all">
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
              {displayTasks.map((task, idx) => (
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
                        {task.dueDate ? `Vence: ${task.dueDate}` : `Urgente`}
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
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EAE1]">
              <button
                type="button"
                onClick={() => onNavigateTab('checklist')}
                className="w-full py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
              >
                <span>Abrir Gestor Maestro de Tareas</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2D3748]" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          MODALS
         ======================================================== */}
      
      {/* 1. Print Reports Hub Modal */}
      <PrintReportsModal
        isOpen={isPrintHubOpen}
        onClose={() => setIsPrintHubOpen(false)}
        initialReport={selectedReport}
        initialMode={printMode}
      />

      {/* 2. Subir Web Modal (Migrar Datos 1-Clic) */}
      <SubirWebModal
        isOpen={showSubirWebModal}
        onClose={() => setShowSubirWebModal(false)}
      />

      {/* 3. Modal de Confirmación: Limpiar Boda Activa */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#EBEBEB] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[20px_20px_40px_#1a1a1a,-20px_-20px_40px_#444444] border border-rose-300/60 relative animate-scaleUp text-gray-900 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-rose-600 mx-auto">
              <Eraser className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif-display text-lg sm:text-xl font-bold text-gray-900">
                ¿Limpiar Boda y dejar registros en blanco?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Esta acción eliminará todos los <strong>invitados, cronograma, presupuesto, tareas, mesas y proveedores</strong> de la boda activa para que puedas empezar desde cero.
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 p-2 rounded-xl">
                ✓ Se conservarán el <strong>Nombre del Evento</strong>, la <strong>Fecha</strong> y la <strong>Ciudad</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="px-4 py-2 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteClearWedding}
                disabled={isClearing}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Eraser className="w-4 h-4" />
                <span>{isClearing ? 'Limpiando...' : 'Sí, Limpiar Boda'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal de Confirmación: Limpiar Archivos Residuales */}
      {showPurgeResidualsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#EBEBEB] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[20px_20px_40px_#1a1a1a,-20px_-20px_40px_#444444] border border-rose-300/60 relative animate-scaleUp text-gray-900 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif-display text-lg sm:text-xl font-bold text-gray-900">
                Limpieza de Archivos Residuales
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                El sistema escaneará el servidor y eliminará automáticamente todos los archivos JSON huérfanos y copias residuales de bodas ya eliminadas.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeResidualsModal(false)}
                disabled={isPurging}
                className="px-4 py-2 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecutePurge}
                disabled={isPurging}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isPurging ? 'Limpiando Servidor...' : 'Sí, Limpiar Archivos'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar Lista de Invitados */}
      <GuestImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async (imported, mode) => {
          await importGuests(imported, mode);
          setIsImportModalOpen(false);
        }}
        currentCount={guests.length}
        coupleNames={settings.coupleNames || ''}
      />

      {/* Modal Agregar Nuevo Invitado Manual */}
      <GuestModal
        isOpen={isAddGuestModalOpen}
        onClose={() => setIsAddGuestModalOpen(false)}
        onSave={(guestData) => {
          addGuest(guestData);
          setIsAddGuestModalOpen(false);
        }}
      />

    </div>
  );
};
