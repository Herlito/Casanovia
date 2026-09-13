import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { NoviosOverviewPanel } from './NoviosOverviewPanel';
import { GuestManagement } from './GuestManagement';
import { TimelineModule } from './TimelineModule';
import { BudgetModule } from './BudgetModule';
import { ChecklistModule } from './ChecklistModule';
import { SettingsModule } from './SettingsModule';
import { VendorsModule } from './VendorsModule';
import { TableAssignmentModule } from './TableAssignmentModule';
import { ProtocolPrintModal } from './ProtocolPrintModal';
import { 
  LayoutDashboard,
  Users, 
  Clock, 
  DollarSign, 
  CheckSquare, 
  Settings, 
  Crown, 
  Printer, 
  Sparkles, 
  Heart, 
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Lock,
  Layers,
  MapPin,
  Building2,
  LogOut,
  SlidersHorizontal,
  Briefcase,
  UtensilsCrossed,
  ChevronDown,
  Share2,
  Palette,
  Map,
  Eye
} from 'lucide-react';

export type PlannerDashboardTab = 'panel' | 'guests' | 'seating' | 'vendors' | 'budget' | 'timeline' | 'checklist' | 'settings';

export const PlannerDashboard: React.FC = () => {
  const { 
    guests, 
    timeline, 
    budget, 
    tasks, 
    settings, 
    setViewMode,
    isLevel1Admin,
    isLevel3Planner,
    isLevel5Observer,
    canPrint,
    isPlannerOrAdmin,
    canCreateWedding,
    canEditActiveWedding,
    currentUser,
    appTheme,
    showAuthModal,
    setShowAuthModal,
    setShowNewWeddingModal,
    setShowShareModal,
    weddings,
    accessibleWeddings,
    userCreatedWeddings,
    activeWeddingId,
    activeWedding,
    selectWedding,
    setShowFloorPlanModal
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic' || true;

  const [activeTab, setActiveTab] = useState<PlannerDashboardTab>('panel');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [weddingDropdownOpen, setWeddingDropdownOpen] = useState(false);
  const weddingDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNavigation = (e: CustomEvent<PlannerDashboardTab>) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('navigate-dashboard', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('navigate-dashboard', handleNavigation as EventListener);
    };
  }, []);

  // Close wedding selector dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (weddingDropdownRef.current && !weddingDropdownRef.current.contains(event.target as Node)) {
        setWeddingDropdownOpen(false);
      }
    };
    if (weddingDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [weddingDropdownOpen]);

  // If user is not authenticated at all, show access protection banner
  if (!currentUser.isAuthenticated) {
    setTimeout(() => {
      setViewMode('public');
    }, 0);
    return null;
  }

  // If Level 3 Wedding Planner has NO weddings created yet, show dedicated welcoming onboarding with "Crear Boda" button
  if (isLevel3Planner && accessibleWeddings.length === 0) {
    return (
      <div className={isNeumorphic ? "min-h-[85vh] bg-[#EBEBEB] text-gray-800 flex flex-col" : "min-h-[85vh] bg-[#EBEBEB] flex flex-col selection:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/20 selection:text-[#2D3748]"}>
        {/* Top Status Ribbon */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] text-gray-500 py-1.5 px-4 text-[11px] shadow-[inset_0px_-2px_4px_#d1d1d1]" : "bg-[#1F1D1B] text-stone-300 py-1.5 px-4 text-[11px] border-b border-stone-800"}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="font-semibold text-teal-300">Wedding Planner (Nivel 3):</span>
              <span className="text-stone-300">{currentUser.username}</span>
            </div>
            <div className="flex items-center space-x-3 text-stone-400">
              <button
                type="button"
                onClick={() => setViewMode('public')}
                className="hover:text-[#2D3748] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Web Invitados</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] sticky top-16 sm:top-20 z-30">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={isNeumorphic ? "w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] flex items-center justify-center font-serif-display font-bold text-lg text-gray-800" : "w-10 h-10 rounded-xl bg-[#EBEBEB] border border-transparent flex items-center justify-center font-serif-display font-bold text-lg text-[#4A5568]"}>
                WP
              </div>
              <div>
                <h1 className={`font-serif-display font-bold text-base sm:text-lg ${isNeumorphic ? "text-gray-900" : "text-[#2D3748]"}`}>
                  Panel de Wedding Planner
                </h1>
                <p className={`text-xs ${isNeumorphic ? "text-gray-500 font-medium" : "text-[#E8DCCF]"}`}>
                  Gestión y organización exclusiva de tus bodas
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-planner-create-wedding-header"
              onClick={() => setShowNewWeddingModal(true)}
              className={isNeumorphic ? "px-4 py-2 rounded-xl bg-[#EBEBEB] text-gray-800 text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]" : "px-4 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#803140] text-[#2D3748] text-xs font-bold transition-all shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] flex items-center space-x-2 cursor-pointer"}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Evento</span>
            </button>
          </div>
        </header>

        {/* Main Welcome Hero */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
          <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] p-8 sm:p-12 border border-transparent shadow-xl text-center max-w-2xl w-full space-y-6" : "bg-[#EBEBEB] rounded-3xl p-8 sm:p-12 border border-transparent shadow-xl text-center max-w-2xl w-full space-y-6"}>
            
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-teal-50 to-teal-100 border border-teal-200 text-teal-800 mx-auto flex items-center justify-center shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]">
              <Briefcase className="w-10 h-10 text-teal-700" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Acceso Nivel 3 • Wedding Planner</span>
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
                ¡Bienvenida(o), {currentUser.username}!
              </h2>
              <p className="text-sm text-[#7A7268] max-w-md mx-auto leading-relaxed">
                Como Wedding Planner (Nivel 3), solo tienes acceso a las bodas creadas por ti mismo. Actualmente no tienes ninguna boda registrada en tu cuenta.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-planner-create-first-wedding"
                onClick={() => setShowNewWeddingModal(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-sm font-bold shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] hover:bg-[#EBEBEB] transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 mx-auto cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Nuevo Evento</span>
              </button>
            </div>

            {/* Feature preview pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#F0EAE1] text-left">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] flex items-start space-x-3">
                <CheckSquare className="w-5 h-5 text-[#2D3748] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#2D2A26]">Checklist y 6 Fases</div>
                  <div className="text-[11px] text-[#7A7268]">36 tareas nupciales estructuradas paso a paso.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] flex items-start space-x-3">
                <Users className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#2D2A26]">Pases y Anfitriones</div>
                  <div className="text-[11px] text-[#7A7268]">Control de invitados RSVP y accesos para la pareja.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Calculate Couple initials for monogram (e.g. "Sofia & Alejandro" -> "SA")
  const getInitials = (names: string) => {
    if (!names) return 'SA';
    const parts = names.split('&').map(p => p.trim());
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    const words = names.split(' ').filter(w => w.length > 0);
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return names.slice(0, 2).toUpperCase();
  };

  const coupleInitials = getInitials(settings.coupleNames || 'Sofia & Alejandro');

  const navTabs: { id: PlannerDashboardTab | 'floorplan' | 'public'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'panel', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: isPlannerOrAdmin ? 'Ajustes' : 'Ajustes Boda', icon: Settings },
    { id: 'checklist', label: 'Tareas', icon: CheckSquare },
    { id: 'guests', label: 'Invitados', icon: Users },
    { id: 'seating', label: 'Mesas', icon: UtensilsCrossed },
        { id: 'timeline', label: 'Cronograma', icon: Clock },
    { id: 'vendors', label: 'Proveedores', icon: Building2 },
    { id: 'budget', label: 'Presupuesto', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-[#EBEBEB] text-gray-800 flex flex-col">

      {/* Observer Mode Banner */}
      {isLevel5Observer && (
        <div className="bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] px-4 py-2 flex items-center justify-between text-xs text-gray-800 border-b border-gray-300">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold text-gray-900">Modo Observador (Nivel 5 - Solo Lectura)</span>
            <span className="hidden md:inline text-gray-600">• Misma visibilidad que Wedding Planner sin permisos para realizar cambios ni imprimir</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBEBEB] shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] text-blue-700">
            Solo Consulta
          </span>
        </div>
      )}

      {/* ========================================================
          TOP NAVIGATION BAR (Matching screenshot wine burgundy theme)
          - Left / Center: Wedding Selector Dropdown (Centered on mobile)
          - Right / Rows: Navigation Tabs [Panel, Invitados, Mesas, Proveedores, Presupuesto, Cronograma, Tareas, Ajustes]
          - Auto-wrapping for mobile view
         ======================================================== */}
      <header className="bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] sticky top-14 sm:top-16 z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-1.5 sm:py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-1 sm:gap-2">
            
            {/* Wedding Selector Dropdown (Hidden on mobile) */}
            <div className="hidden sm:flex sm:w-auto justify-start shrink-0">
              {currentUser.isAuthenticated && (isPlannerOrAdmin || isLevel5Observer) ? (
                isLevel3Planner && accessibleWeddings.length === 0 ? (
                  <button
                    type="button"
                    id="btn-planner-bar-create-wedding"
                    onClick={() => setShowNewWeddingModal(true)}
                    className={isNeumorphic ? "px-3 py-1.5 rounded-xl bg-[#EBEBEB] text-gray-800 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]" : "px-3 py-1.5 rounded-xl bg-[#EBEBEB] hover:bg-[#451822] text-[#2D3748] text-xs font-bold transition-all flex items-center space-x-1.5 border border-transparent shadow-xs cursor-pointer shrink-0"}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-teal-300" />
                    <span className="hidden sm:inline">Nuevo Evento</span>
                  </button>
                ) : (
                  <div className="relative shrink-0" ref={weddingDropdownRef}>
                    <button
                      type="button"
                      onClick={() => accessibleWeddings.length > 1 && setWeddingDropdownOpen(!weddingDropdownOpen)}
                      className={isNeumorphic ? "flex items-center space-x-2.5 text-left bg-[#EBEBEB] rounded-2xl px-3.5 py-1.5 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] cursor-pointer" : "flex items-center space-x-2.5 text-left bg-[#EBEBEB]/90 border border-transparent rounded-2xl px-3.5 py-1.5 shadow-xs cursor-pointer"}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] text-gray-800 flex items-center justify-center font-serif-display font-bold text-xs shrink-0">
                        {coupleInitials}
                      </div>
                      <div className="min-w-0 flex items-center space-x-1.5">
                        <span className={`font-serif-display font-bold text-sm sm:text-base tracking-wide truncate max-w-[160px] sm:max-w-[220px] ${isNeumorphic ? "text-gray-900" : "text-[#2D3748]"}`}>
                          {activeWedding?.coupleNames || settings.coupleNames}
                        </span>
                        {accessibleWeddings.length > 1 && (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        )}
                      </div>
                    </button>

                    {weddingDropdownOpen && accessibleWeddings.length > 1 && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-[#EBEBEB] rounded-2xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] z-50 overflow-hidden py-1 border border-stone-200">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Seleccionar Evento
                        </div>
                        {accessibleWeddings.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              selectWedding(w.id);
                              setWeddingDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                              w.id === activeWeddingId
                                ? 'bg-gray-200 text-gray-900 font-bold'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="truncate">{w.coupleNames}</span>
                            {w.id === activeWeddingId && <span className="text-emerald-600 font-bold ml-1">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex items-center space-x-2.5 bg-[#EBEBEB] shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] rounded-2xl px-3.5 py-1.5 shrink-0 border-none">
                  <div className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] text-gray-800 flex items-center justify-center font-serif-display font-bold text-xs shrink-0">
                    {coupleInitials}
                  </div>
                  <div className="min-w-0">
                    <span className="font-serif-display font-bold text-sm sm:text-base tracking-wide truncate block max-w-[160px] sm:max-w-[220px] text-gray-700">
                      {settings.coupleNames}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Nav Tabs - flex-wrap allows responsive adjustment to wrap onto the next row on mobile devices */}
            <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto mt-1 sm:mt-0">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'floorplan') {
                        setShowFloorPlanModal(true);
                      } else if (tab.id === 'public') {
                        if (activeWeddingId) {
                          window.history.pushState({}, '', `/?w=${activeWeddingId}`);
                        }
                        setViewMode('public');
                      } else {
                        setActiveTab(tab.id as PlannerDashboardTab);
                      }
                    }}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                      isActive
                        ? (isNeumorphic ? 'bg-[#EBEBEB] text-[#6D7587] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]' : 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs font-semibold ring-1 ring-white/30')
                        : (isNeumorphic ? 'text-[#6D7587] bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]' : 'text-[#4A5568] hover:text-[#2D3748] hover:bg-[#EBEBEB]/10')
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ========================================================
          BODY CONTAINER WITH LEFT VERTICAL MINI-RAIL & CONTENT
         ======================================================== */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-0 sm:px-6 lg:px-8 py-1 sm:py-4 gap-0 sm:gap-6">
        
        {/* Left Vertical Icon Navigation Rail (Desktop) */}
        <aside className="hidden md:flex flex-col items-center justify-between w-16 bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-2.5 shrink-0 self-start sticky top-24 border-none">
          <div className="space-y-2.5 w-full flex flex-col items-center">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'floorplan') {
                      setShowFloorPlanModal(true);
                    } else if (tab.id === 'public') {
                      setViewMode('public');
                    } else {
                      setActiveTab(tab.id as PlannerDashboardTab);
                    }
                  }}
                  title={tab.label}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? (isNeumorphic ? 'bg-[#EBEBEB] text-[#6D7587] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]' : 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs')
                      : (isNeumorphic ? 'text-[#6D7587] bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]' : 'text-[#7A7268] hover:text-[#2D2A26] hover:bg-[#FAF8F5]')
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#F0EAE1] w-full flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={() => setViewMode('public')}
              title="Ir a Web de Invitados"
              className="w-10 h-10 rounded-2xl text-[#7A7268] hover:text-[#2D3748] hover:bg-[#FAF8F5] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'panel' && (
            <NoviosOverviewPanel onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'guests' && (
            <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-none sm:rounded-[2.5rem] shadow-none sm:shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] p-0 sm:p-5 border-none sm:border border-transparent w-full" : "bg-[#EBEBEB] rounded-none sm:rounded-3xl p-0 sm:p-5 border-none sm:border border-transparent w-full"}>
              <GuestManagement />
            </div>
          )}
          {activeTab === 'seating' && (
            <TableAssignmentModule />
          )}
          {activeTab === 'vendors' && (
            <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] p-6 border border-transparent shadow-xs" : "bg-[#EBEBEB] rounded-3xl p-6 border border-transparent shadow-xs"}>
              <VendorsModule />
            </div>
          )}
          {activeTab === 'budget' && (
            <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] p-6 border border-transparent shadow-xs" : "bg-[#EBEBEB] rounded-3xl p-6 border border-transparent shadow-xs"}>
              <BudgetModule />
            </div>
          )}
          {activeTab === 'timeline' && (
            <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] p-6 border border-transparent shadow-xs" : "bg-[#EBEBEB] rounded-3xl p-6 border border-transparent shadow-xs"}>
              <TimelineModule />
            </div>
          )}
          {activeTab === 'checklist' && (
            <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] p-6 border border-transparent shadow-xs" : "bg-[#EBEBEB] rounded-3xl p-6 border border-transparent shadow-xs"}>
              <ChecklistModule />
            </div>
          )}
          {activeTab === 'settings' && (
            <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] p-6 border border-transparent shadow-xs" : "bg-[#EBEBEB] rounded-3xl p-6 border border-transparent shadow-xs"}>
              <SettingsModule />
            </div>
          )}
        </main>

      </div>

      {/* Protocol Print Sheet Modal */}
      {!isLevel5Observer && (
        <ProtocolPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

    </div>
  );
};
