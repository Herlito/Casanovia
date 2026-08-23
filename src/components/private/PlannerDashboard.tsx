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
  Share2
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
    isPlannerOrAdmin,
    canCreateWedding,
    canEditActiveWedding,
    currentUser,
    setShowAuthModal,
    setShowNewWeddingModal,
    setShowShareModal,
    weddings,
    accessibleWeddings,
    userCreatedWeddings,
    activeWeddingId,
    activeWedding,
    selectWedding
  } = useWedding();

  const [activeTab, setActiveTab] = useState<PlannerDashboardTab>('panel');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [weddingDropdownOpen, setWeddingDropdownOpen] = useState(false);
  const weddingDropdownRef = useRef<HTMLDivElement>(null);

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
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F7F3EE]">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center border border-[#E8DCCF] shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8276] block mb-1">
              Área Restringida
            </span>
            <h2 className="font-serif-display text-2xl font-bold text-[#2D2A26]">
              Dashboard Novios & Edición
            </h2>
            <p className="text-xs text-[#7A7268] mt-2 leading-relaxed">
              Para gestionar el panel, cronograma, proveedores, invitados y presupuesto, ingresa con tus credenciales autorizadas (<strong>Nivel 1 Administrador</strong>, <strong>Nivel 3 Wedding Planner</strong> o <strong>Nivel 2 Anfitrión</strong>).
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-[#8B3A4A] text-white text-xs font-bold hover:bg-[#6E2937] transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ingresar con Clave de Acceso</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('public')}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#D9CEBF] text-xs font-semibold text-[#524B42] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Regresar a Web Invitados
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If Level 3 Wedding Planner has NO weddings created yet, show dedicated welcoming onboarding with "Crear Boda" button
  if (isLevel3Planner && accessibleWeddings.length === 0) {
    return (
      <div className="min-h-[85vh] bg-[#F7F3EE] flex flex-col selection:bg-[#8B3A4A]/20 selection:text-[#8B3A4A]">
        {/* Top Status Ribbon */}
        <div className="bg-[#1F1D1B] text-stone-300 py-1.5 px-4 text-[11px] border-b border-stone-800">
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
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Web Invitados</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="bg-[#6B2D38] text-white shadow-md py-4 px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#54212C] border border-[#8B3A4A]/60 flex items-center justify-center font-serif-display font-bold text-lg text-[#F7E7CE]">
                WP
              </div>
              <div>
                <h1 className="font-serif-display font-bold text-base sm:text-lg text-white">
                  Panel de Wedding Planner
                </h1>
                <p className="text-xs text-[#E8DCCF]">
                  Gestión y organización exclusiva de tus bodas
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-planner-create-wedding-header"
              onClick={() => setShowNewWeddingModal(true)}
              className="px-4 py-2 rounded-xl bg-[#8B3A4A] hover:bg-[#803140] text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Crear Boda</span>
            </button>
          </div>
        </header>

        {/* Main Welcome Hero */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DCCF] shadow-xl text-center max-w-2xl w-full space-y-6">
            
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-teal-50 to-teal-100 border border-teal-200 text-teal-800 mx-auto flex items-center justify-center shadow-sm">
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
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#8B3A4A] text-white text-sm font-bold shadow-lg hover:bg-[#6E2937] transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 mx-auto cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>+ Crear Boda</span>
              </button>
            </div>

            {/* Feature preview pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#F0EAE1] text-left">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] flex items-start space-x-3">
                <CheckSquare className="w-5 h-5 text-[#8B3A4A] shrink-0 mt-0.5" />
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

  const navTabs: { id: PlannerDashboardTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'panel', label: 'Panel', icon: LayoutDashboard },
    { id: 'guests', label: 'Invitados', icon: Users },
    { id: 'seating', label: 'Mesas', icon: UtensilsCrossed },
    { id: 'vendors', label: 'Proveedores', icon: Building2 },
    { id: 'budget', label: 'Presupuesto', icon: DollarSign },
    { id: 'timeline', label: 'Cronograma', icon: Clock },
    { id: 'checklist', label: 'Tareas', icon: CheckSquare },
    { id: 'settings', label: isPlannerOrAdmin ? 'Ajustes' : 'Ajustes Boda', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col selection:bg-[#8B3A4A]/20 selection:text-[#8B3A4A]">

      {/* ========================================================
          TOP NAVIGATION BAR (Matching screenshot wine burgundy theme)
          - Left / Center: Wedding Selector Dropdown (Centered on mobile)
          - Right / Rows: Navigation Tabs [Panel, Invitados, Mesas, Proveedores, Presupuesto, Cronograma, Tareas, Ajustes]
          - Auto-wrapping for mobile view
         ======================================================== */}
      <header className="bg-[#6B2D38] text-white shadow-md sticky top-16 sm:top-20 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
            
            {/* Wedding Selector Dropdown (Centered on mobile) */}
            <div className="w-full sm:w-auto flex justify-center sm:justify-start">
              {currentUser.isAuthenticated && isPlannerOrAdmin ? (
                isLevel3Planner && accessibleWeddings.length === 0 ? (
                  <button
                    type="button"
                    id="btn-planner-bar-create-wedding"
                    onClick={() => setShowNewWeddingModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#54212C] hover:bg-[#451822] text-white text-xs font-bold transition-all flex items-center space-x-1.5 border border-[#8B3A4A]/60 shadow-xs cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-teal-300" />
                    <span>+ Crear Boda</span>
                  </button>
                ) : (
                  <div className="relative shrink-0" ref={weddingDropdownRef}>
                    <button
                      type="button"
                      id="btn-bar-wedding-selector"
                      onClick={() => setWeddingDropdownOpen(!weddingDropdownOpen)}
                      className="flex items-center space-x-2.5 text-left group bg-[#54212C]/90 hover:bg-[#471822] border border-[#8B3A4A]/70 rounded-2xl px-3.5 py-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#8B3A4A] text-[#F7E7CE] flex items-center justify-center font-serif-display font-bold text-xs shrink-0 border border-white/25 shadow-2xs">
                        {coupleInitials}
                      </div>
                      <div className="min-w-0 flex items-center space-x-1.5">
                        <span className="font-serif-display font-bold text-sm sm:text-base text-white tracking-wide truncate max-w-[160px] sm:max-w-[220px]">
                          {activeWedding?.coupleNames || settings.coupleNames}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#E8DCCF] transition-transform duration-200 shrink-0 ${weddingDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                      </div>
                    </button>

                    {/* Dropdown Menu for Multi-Weddings */}
                    {weddingDropdownOpen && (
                      <div 
                        className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-2 w-72 sm:w-80 bg-white text-[#2D2A26] rounded-2xl shadow-2xl border border-[#E8DCCF] p-2.5 z-50 animate-fadeIn"
                      >
                        <div className="px-3 py-2 border-b border-[#F0EAE1] flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8276] block">
                            {isLevel3Planner ? `Mis Bodas Creadas (${accessibleWeddings.length})` : `Bodas Organizadas (${weddings.length})`}
                          </span>
                          {isLevel3Planner && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800">
                              Nivel 3 Planner
                            </span>
                          )}
                        </div>

                        <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                          {(isLevel3Planner ? accessibleWeddings : weddings).length === 0 ? (
                            <div className="p-4 text-center space-y-2">
                              <p className="text-xs text-[#7A7268]">No tienes bodas creadas todavía.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setWeddingDropdownOpen(false);
                                  setShowNewWeddingModal(true);
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-[#8B3A4A] text-white text-xs font-semibold hover:bg-[#6E2937] transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                              >
                                <PlusCircle className="w-4 h-4" />
                                <span>+ Crear Boda</span>
                              </button>
                            </div>
                          ) : (
                            (isLevel3Planner ? accessibleWeddings : weddings).map((w) => {
                              const isCurrent = w.id === activeWeddingId;
                              return (
                                <div
                                  key={w.id}
                                  className={`w-full p-2 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 ${
                                    isCurrent 
                                      ? 'bg-[#8B3A4A]/10 text-[#8B3A4A] font-semibold border border-[#8B3A4A]/20' 
                                      : 'hover:bg-[#FAF8F5] text-[#2D2A26]'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      selectWedding(w.id);
                                      setWeddingDropdownOpen(false);
                                    }}
                                    className="flex-1 text-left min-w-0 cursor-pointer"
                                  >
                                    <div className="font-serif-display font-bold text-xs sm:text-sm text-[#2D2A26] truncate">
                                      {w.coupleNames}
                                    </div>
                                    <div className="text-[10px] text-[#7A7268] flex items-center gap-1 mt-0.5 truncate">
                                      <Calendar className="w-3 h-3 text-[#8C8276] shrink-0" />
                                      <span className="truncate">{w.weddingDate ? new Date(w.weddingDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Fecha por definir'}</span>
                                    </div>
                                  </button>

                                  <div className="flex items-center space-x-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        selectWedding(w.id);
                                        setWeddingDropdownOpen(false);
                                        setShowShareModal(true);
                                      }}
                                      title="Compartir enlace de esta boda"
                                      className="p-1.5 rounded-lg text-[#7A7268] hover:text-[#8B3A4A] hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[#E8DCCF]"
                                    >
                                      <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                    {isCurrent && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#8B3A4A] text-white">
                                        Activa
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {canCreateWedding && (
                          <div className="pt-2 border-t border-[#F0EAE1]">
                            <button
                              type="button"
                              id="btn-dropdown-crear-boda-bar"
                              onClick={() => {
                                setWeddingDropdownOpen(false);
                                setShowNewWeddingModal(true);
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-[#8B3A4A] text-white text-xs font-semibold hover:bg-[#6E2937] transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>+ Crear Boda</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex items-center space-x-2.5 bg-[#54212C]/60 border border-[#8B3A4A]/40 rounded-2xl px-3.5 py-1.5 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#8B3A4A] text-[#F7E7CE] flex items-center justify-center font-serif-display font-bold text-xs shrink-0 border border-white/25 shadow-2xs">
                    {coupleInitials}
                  </div>
                  <div className="min-w-0">
                    <span className="font-serif-display font-bold text-sm sm:text-base text-white tracking-wide truncate block max-w-[160px] sm:max-w-[220px]">
                      {settings.coupleNames}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Nav Tabs - flex-wrap allows responsive adjustment to wrap onto the next row on mobile devices */}
            <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#8B3A4A] text-white shadow-xs font-semibold ring-1 ring-white/30'
                        : 'text-stone-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
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
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-6 gap-4 sm:gap-6">
        
        {/* Left Vertical Icon Navigation Rail (Desktop) */}
        <aside className="hidden md:flex flex-col items-center justify-between w-14 bg-white rounded-3xl p-2.5 border border-[#E8DCCF] shadow-xs shrink-0 self-start sticky top-20">
          <div className="space-y-2.5 w-full flex flex-col items-center">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8B3A4A] text-white shadow-xs'
                      : 'text-[#7A7268] hover:text-[#2D2A26] hover:bg-[#FAF8F5]'
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
              className="w-10 h-10 rounded-2xl text-[#7A7268] hover:text-[#8B3A4A] hover:bg-[#FAF8F5] flex items-center justify-center transition-colors cursor-pointer"
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
            <div className="bg-white rounded-3xl p-6 border border-[#E8DCCF] shadow-xs">
              <GuestManagement />
            </div>
          )}
          {activeTab === 'seating' && (
            <TableAssignmentModule />
          )}
          {activeTab === 'vendors' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E8DCCF] shadow-xs">
              <VendorsModule />
            </div>
          )}
          {activeTab === 'budget' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E8DCCF] shadow-xs">
              <BudgetModule />
            </div>
          )}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E8DCCF] shadow-xs">
              <TimelineModule />
            </div>
          )}
          {activeTab === 'checklist' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E8DCCF] shadow-xs">
              <ChecklistModule />
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E8DCCF] shadow-xs">
              <SettingsModule />
            </div>
          )}
        </main>

      </div>

      {/* Protocol Print Sheet Modal */}
      <ProtocolPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

    </div>
  );
};
