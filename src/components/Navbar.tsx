import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '../context/WeddingContext';
import { 
  Heart, 
  Sparkles, 
  LayoutDashboard, 
  Globe, 
  Download, 
  Upload, 
  RotateCcw, 
  Menu, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  Cloud, 
  PlusCircle, 
  ShieldCheck, 
  User, 
  Users, 
  ChevronDown, 
  LogOut, 
  Calendar,
  Briefcase,
  Share2,
  Copy,
  ShoppingCart,
  Image as ImageIcon,
  Map as MapIcon,
  Ruler,
  Palette,
  LayoutTemplate,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    settings, 
    exportDataJson, 
    importDataJson, 
    resetToDemoData, 
    guests, 
    isFirebaseConnected, 
    isFirebaseLoading, 
    weddings, 
    accessibleWeddings,
    userCreatedWeddings,
    activeWeddingId, 
    activeWedding,
    selectWedding, 
    isLevel1Admin, 
    isLevel3Planner,
    isHostUser, 
    isPlannerOrAdmin, 
    canCreateWedding,
    canManageUsers,
    canEditActiveWedding, 
    currentUser, 
    logout, 
    setShowAuthModal, 
    setShowNewWeddingModal, 
    setShowUserManagementModal,
    setShowShareModal,
    setShowUploadedImagesModal,
    setShowFloorPlanModal,
    setShowWeddingCraftModal,
    uploadedImages,
    getShareableWeddingUrl,
    isPublicHomeLanding
  } = useWedding();

  const [sandwichMenuOpen, setSandwichMenuOpen] = useState(false);
  const sandwichMenuRef = useRef<HTMLDivElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Close sandwich menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (sandwichMenuRef.current && !sandwichMenuRef.current.contains(event.target as Node)) {
        setSandwichMenuOpen(false);
      }
    };
    if (sandwichMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sandwichMenuOpen]);

  const primaryGuests = guests.filter(g => !g.mainGuestId);
  const confirmedCount = primaryGuests.filter(g => g.rsvpStatus === 'confirmed').reduce((acc, g) => acc + (g.confirmedPasses || g.totalPasses || 1), 0);
  const totalInvited = primaryGuests.reduce((acc, g) => acc + (g.totalPasses || 1), 0);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    if (!importText.trim()) {
      setImportError('Por favor pega el código JSON de respaldo.');
      return;
    }
    const success = await importDataJson(importText);
    if (success) {
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        setShowImportModal(false);
        setImportText('');
      }, 1200);
    } else {
      setImportError('Formato JSON no válido. Verifica el archivo exportado.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  // Monogram initials
  const initials = settings.coupleNames
    .split('&')
    .map(n => n.trim()[0])
    .join('&') || 'W';

  return (
    <>
      {/* Updated Header Background */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-xs ${isPublicHomeLanding && !currentUser.isAuthenticated ? "bg-[#EBEBEB] border-[#D4D4D4]" : "bg-[#FDFBF7]/95 border-[#EADDCE]"}`}>
        {/* Top Gold Ornament Bar */}
        <div className="h-1.5 bg-linear-to-r from-[#D4AF37] via-[#C5A880] to-[#8B3A4A] w-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* Left Column: View Switcher (Only icons without text for PC, tablet and mobile) */}
            <div className="flex items-center space-x-2 z-20">
              {currentUser.isAuthenticated && (
                <div className="bg-[#EFEAE2] p-1 rounded-full flex items-center border border-[#D9CEBF] shadow-inner animate-fadeIn">
                  <button
                    type="button"
                    id="nav-btn-public-view"
                    onClick={() => setActiveView('public')}
                    title="Web Invitados"
                    className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
                      activeView === 'public'
                        ? 'bg-white text-[#8B3A4A] shadow-sm ring-1 ring-[#8B3A4A]/20'
                        : 'text-[#6B6358] hover:text-[#2D2A26] hover:bg-white/50'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-[#8B3A4A]" />
                  </button>

                  <button
                    type="button"
                    id="nav-btn-private-view"
                    onClick={() => setActiveView('private')}
                    title="Dashboard Novios"
                    className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer relative ${
                      activeView === 'private'
                        ? 'bg-[#8B3A4A] text-white shadow-sm ring-1 ring-[#8B3A4A]'
                        : 'text-[#6B6358] hover:text-[#2D2A26] hover:bg-white/50'
                    }`}
                  >
                    <LayoutDashboard className={`w-4 h-4 ${activeView === 'private' ? 'text-white' : 'text-[#8B3A4A]'}`} />
                    <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                      isLevel1Admin ? 'bg-emerald-400' : isLevel3Planner ? 'bg-teal-400' : 'bg-amber-400'
                    }`} />
                  </button>
                </div>
              )}
            </div>

            {/* Center: In home landing without login, display Sandwich Menu in the middle of header; otherwise official logo or wedding badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-auto">
              {isPublicHomeLanding ? (
                /* Sandwich Menu in the middle of header when unauthenticated home */
                <div className="relative" ref={sandwichMenuRef}>
                  <button
                    type="button"
                    id="btn-sandwich-menu-center"
                    onClick={() => {
                      if (!currentUser.isAuthenticated) {
                        setShowAuthModal(true);
                      } else {
                        setSandwichMenuOpen(!sandwichMenuOpen);
                      }
                    }}
                    aria-label="Abrir Menú de Opciones"
                    className={
                      (!currentUser.isAuthenticated && isPublicHomeLanding)
                        ? "p-3 sm:p-4 rounded-full bg-[#F5F5F5] text-gray-500 shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,1),inset_3px_3px_6px_rgba(0,0,0,0.05),inset_-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[inset_5px_5px_15px_rgba(0,0,0,0.1),inset_-5px_-5px_15px_rgba(255,255,255,1)] transition-all duration-200 cursor-pointer border-none"
                        : `p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs ${
                            sandwichMenuOpen
                              ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] shadow-md ring-2 ring-[#8B3A4A]/30'
                              : 'bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#2D2A26] border-[#D9CEBF]'
                          }`
                    }
                    title="Menú de Acciones y Herramientas"
                  >
                    {sandwichMenuOpen ? (
                      <X className={!currentUser.isAuthenticated && isPublicHomeLanding ? "w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" : "w-5 h-5 transition-transform"} />
                    ) : (
                      <Menu className={!currentUser.isAuthenticated && isPublicHomeLanding ? "w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" : "w-5 h-5 text-[#8B3A4A] transition-transform"} />
                    )}
                  </button>

                  {/* Dropdown under centered menu */}
                  {sandwichMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xs"
                        onClick={() => setSandwichMenuOpen(false)}
                      />

                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-2 bg-white rounded-3xl shadow-2xl border border-[#E8DCCF] z-[60] animate-fadeIn">
                        <div className="p-1">
                          <button
                            type="button"
                            id="sandwich-btn-acceder-center"
                            onClick={() => {
                              setShowAuthModal(true);
                              setSandwichMenuOpen(false);
                            }}
                            className="w-full py-2.5 px-4 rounded-2xl bg-[#8B3A4A] hover:bg-[#6E2937] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
                          >
                            <User className="w-4 h-4" />
                            <span>Acceder</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (currentUser.isAuthenticated || activeView === 'tokens') ? (
                <button
                  type="button"
                  id="btn-nav-logo-home"
                  onClick={() => {
                    if (currentUser.isAuthenticated) {
                      setActiveView('public');
                    } else if (activeView === 'tokens') {
                      setActiveView('tokens');
                    } else {
                      setActiveView('public');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer bg-transparent border-0 p-0 m-0 flex items-center justify-center hover:opacity-80 active:scale-98 transition-all focus:outline-hidden group"
                  title="Casanovia"
                >
                  <img 
                    src="/casanovia.svg" 
                    alt="Casanovia" 
                    className="h-8 sm:h-10 md:h-11 w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[220px] object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ) : (
                <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-1 rounded-full bg-[#FAF3ED] text-[#8B3A4A] text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-[#E8DCCF] shadow-2xs whitespace-nowrap">
                  <Heart className="w-3 h-3 fill-[#8B3A4A] text-[#8B3A4A] shrink-0" />
                  <span>Nuestra Boda & Guía Oficial</span>
                  <Heart className="w-3 h-3 fill-[#8B3A4A] text-[#8B3A4A] shrink-0" />
                </div>
              )}
            </div>

            {/* Right: Auth status, Cloud Sync, Share button & Sandwich Menu (when not in isPublicHomeLanding mode) */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3 ml-auto z-20">

              {/* Cloud Sync Status Indicator - Solo para Administrador de Sistema */}
              {isLevel1Admin && (
                <div 
                  className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-medium shadow-2xs"
                  title="Sincronización en la nube automática activa con Firestore"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Nube Activa</span>
                </div>
              )}

              {/* Botón Compartir Web Invitados - Solo cuando está autenticado y permitido */}
              {currentUser.isAuthenticated && !isLevel3Planner && !isHostUser && (
                <button
                  type="button"
                  id="btn-nav-share-wedding"
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8B3A4A] bg-[#FAF8F5] hover:bg-[#F3EFEA] transition-colors border border-[#E8DCCF] hover:border-[#8B3A4A]/40 cursor-pointer shadow-2xs"
                  title="Compartir enlace de la web de invitados por WhatsApp o enlace directo"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#8B3A4A]" />
                  <span className="hidden sm:inline-block">Compartir Web</span>
                </button>
              )}

              {/* User Session Pill - Solo cuando está autenticado */}
              {currentUser.isAuthenticated && (
                <div className="flex items-center">
                  <div className="hidden sm:flex items-center pl-2 border-l border-[#D9CEBF]">
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8DCCF] text-[#2D2A26] text-xs font-semibold shadow-2xs">
                      <User className="w-3.5 h-3.5 text-[#8B3A4A]" />
                      <span className="truncate max-w-[120px]">{currentUser.username}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sandwich Menu Trigger Button (Icon only) - Only when not centered in isPublicHomeLanding mode */}
              {!isPublicHomeLanding && (
                <div className="relative" ref={sandwichMenuRef}>
                  <button
                    type="button"
                    id="btn-sandwich-menu"
                    onClick={() => {
                      if (!currentUser.isAuthenticated) {
                        setShowAuthModal(true);
                      } else {
                        setSandwichMenuOpen(!sandwichMenuOpen);
                      }
                    }}
                    aria-label="Abrir Menú de Opciones"
                    className={
                      (!currentUser.isAuthenticated && isPublicHomeLanding)
                        ? "p-3 sm:p-4 rounded-full bg-[#F5F5F5] text-gray-500 shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,1),inset_3px_3px_6px_rgba(0,0,0,0.05),inset_-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[inset_5px_5px_15px_rgba(0,0,0,0.1),inset_-5px_-5px_15px_rgba(255,255,255,1)] transition-all duration-200 cursor-pointer border-none"
                        : `p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs ${
                            sandwichMenuOpen
                              ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] shadow-md ring-2 ring-[#8B3A4A]/30'
                              : 'bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#2D2A26] border-[#D9CEBF]'
                          }`
                    }
                    title="Menú de Acciones y Herramientas"
                  >
                    {sandwichMenuOpen ? (
                      <X className={!currentUser.isAuthenticated && isPublicHomeLanding ? "w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" : "w-5 h-5 transition-transform"} />
                    ) : (
                      <Menu className={!currentUser.isAuthenticated && isPublicHomeLanding ? "w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" : "w-5 h-5 text-[#8B3A4A] transition-transform"} />
                    )}
                  </button>

                  {/* Sandwich Menu Floating Dropdown */}
                  {sandwichMenuOpen && (
                  <>
                    {/* Backdrop for click outside */}
                    <div 
                      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xs"
                      onClick={() => setSandwichMenuOpen(false)}
                    />

                    <div 
                      className={`absolute right-0 top-full mt-2 ${
                        currentUser.isAuthenticated ? 'w-72 sm:w-80 p-3 space-y-3' : 'w-56 p-2'
                      } bg-white rounded-3xl shadow-2xl border border-[#E8DCCF] z-[60] animate-fadeIn`}
                    >
                      {currentUser.isAuthenticated ? (
                        <>
                          {/* Menu Header: User & Wedding Context */}
                          <div className="p-3 rounded-2xl bg-linear-to-r from-[#FAF8F5] to-[#F3EFEA] border border-[#EADDCE]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8276]">
                                Menú del Sistema
                              </span>
                            </div>
                            <div className="font-serif-display font-bold text-sm text-[#2D2A26] truncate">
                              {settings.coupleNames}
                            </div>
                            <div className="text-[11px] text-[#7A7268] flex items-center justify-between mt-1 pt-1 border-t border-black/5">
                              <span>Sesión:</span>
                              <span className="font-semibold text-[#8B3A4A]">
                                {`${currentUser.username} (${isLevel1Admin ? 'Nivel 1 Super Admin' : isLevel3Planner ? 'Nivel 3 Planner' : 'Nivel 2 Anfitrión'})`}
                              </span>
                            </div>
                          </div>

                          {/* Group 1: Administration & Weddings */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A09383] px-2 block">
                              Difusión y Enlaces
                            </span>

                            {/* Compartir Web de Invitados */}
                            <button
                              type="button"
                              id="sandwich-btn-share-wedding"
                              onClick={() => {
                                setSandwichMenuOpen(false);
                                setShowShareModal(true);
                              }}
                              className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors group cursor-pointer border border-[#E8DCCF]/60 hover:border-[#8B3A4A]"
                            >
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B3A4A] to-[#6E2937] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                                <Share2 className="w-4 h-4 text-[#F7E7CE]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold flex items-center justify-between text-[#8B3A4A]">
                                  <span>Compartir Web Invitados</span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                                    Público
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                  WhatsApp, enlace directo y pase digital sin login
                                </p>
                              </div>
                            </button>

                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A09383] px-2 block pt-1">
                              Gestión y Bodas
                            </span>

                            {/* 1. Administrar Usuarios / Anfitriones */}
                            {canManageUsers && (
                              <button
                                type="button"
                                id="sandwich-btn-manage-users"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setShowUserManagementModal(true);
                                }}
                                className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors group cursor-pointer border border-transparent hover:border-[#E8DCCF]"
                              >
                                <div className="w-8 h-8 rounded-xl bg-[#2D2A26] text-[#D4AF37] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                                  <Users className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>{isLevel3Planner ? 'Asignar Anfitriones' : 'Administrar Usuarios'}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                      isLevel1Admin ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                                    }`}>
                                      {isLevel1Admin ? 'Nivel 1' : 'Nivel 3'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                    {isLevel3Planner ? 'Asignar permisos a parejas y novios' : 'Roles, accesos y permisos de anfitriones'}
                                  </p>
                                </div>
                              </button>
                            )}

                            {/* 2. Nueva Boda */}
                            <button
                              type="button"
                              id="sandwich-btn-new-wedding"
                              onClick={() => {
                                setSandwichMenuOpen(false);
                                if (canCreateWedding) {
                                  setShowNewWeddingModal(true);
                                } else {
                                  setShowAuthModal(true);
                                }
                              }}
                              className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors group cursor-pointer border border-transparent hover:border-[#E8DCCF]"
                            >
                              <div className="w-8 h-8 rounded-xl bg-[#8B3A4A] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                                <PlusCircle className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold flex items-center justify-between">
                                  <span>Crear Evento</span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-[#8B3A4A]">
                                    Crear
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                  Crear evento y generar lista de tareas
                                </p>
                              </div>
                            </button>

                            {/* 3. Página de Precios & Planes (Solo Administrador) */}
                            {isLevel1Admin && (
                              <button
                                type="button"
                                id="sandwich-btn-precios-store"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setActiveView('tokens');
                                }}
                                className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors group cursor-pointer border border-transparent hover:border-[#E8DCCF]"
                              >
                                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-amber-200 shadow-2xs">
                                  <ShoppingCart className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>Precios</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                      Admin
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                    Planes de invitaciones y gestión nupcial
                                  </p>
                                </div>
                              </button>
                            )}

                            {/* 4. Imágenes & Comprobantes Subidos (Solo Administrador) */}
                            {isLevel1Admin && (
                              <button
                                type="button"
                                id="sandwich-btn-uploaded-images"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setShowUploadedImagesModal(true);
                                }}
                                className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors group cursor-pointer border border-transparent hover:border-[#E8DCCF]"
                              >
                                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-purple-200 shadow-2xs">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>Imágenes Subidas</span>
                                    {uploadedImages.length > 0 && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800">
                                        {uploadedImages.length}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                    Ver comprobantes y fotos subidas por visitantes
                                  </p>
                                </div>
                              </button>
                            )}

                            {/* 5. Plano de Bodas & Seating Chart (Solo Administrador y Planner) */}
                            {(isLevel1Admin || isLevel3Planner) && (
                              <button
                                type="button"
                                id="sandwich-btn-floor-plan"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setShowFloorPlanModal(true);
                                }}
                                className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors group cursor-pointer border border-[#E8DCCF]/80 hover:border-[#8B3A4A] shadow-2xs"
                              >
                                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#8B3A4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-rose-200 shadow-2xs">
                                  <MapIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between text-[#8B3A4A]">
                                    <span>Planos</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-[#8B3A4A]">
                                      PDF & Canvas
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                    Diseñador interactivo, importar PDF y asignar asientos
                                  </p>
                                </div>
                              </button>
                            )}
                          </div>

                                                      {/* 6. WeddingCraft Studio */}
                            {isLevel1Admin && (
                              <button
                                type="button"
                                id="sandwich-btn-weddingcraft"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setShowWeddingCraftModal(true);
                                }}
                                className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors group cursor-pointer border border-[#E8DCCF]/80 hover:border-[#8B3A4A] shadow-2xs"
                              >
                                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-pink-200 shadow-2xs">
                                  <LayoutTemplate className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between text-pink-600">
                                    <span>WeddingCraft Studio</span>
                                  </div>
                                  <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                    Editor visual avanzado
                                  </p>
                                </div>
                              </button>
                            )}
                          {/* Group 2: Herramientas de Datos */}
                          <div className="space-y-1 pt-1 border-t border-[#F0EAE1]">
                            {/* 5. Reiniciar (Solo visible para Super Admin Nivel 1 - Oculto para Anfitriones y Wedding Planners) */}
                            {isLevel1Admin && (
                              <button
                                type="button"
                                id="sandwich-btn-reset"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  if (window.confirm('¿Deseas restablecer esta boda a los datos iniciales de demostración?')) {
                                    resetToDemoData();
                                  }
                                }}
                                className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors group cursor-pointer border border-transparent hover:border-rose-200"
                              >
                                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-rose-200">
                                  <RotateCcw className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold">Reiniciar Boda (Demo)</div>
                                  <p className="text-[10px] text-rose-500/80 truncate font-normal">
                                    Restablecer boda actual a datos de demo (Solo Admin)
                                  </p>
                                </div>
                              </button>
                            )}
                          </div>

                          {/* Footer Session Toggle */}
                          <div className="pt-2 border-t border-[#F0EAE1]">
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                setSandwichMenuOpen(false);
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Cerrar Sesión ({currentUser.username})</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        /* When not logged in: Only "Acceder" button */
                        <div className="p-1">
                          <button
                            type="button"
                            id="sandwich-btn-acceder"
                            onClick={() => {
                              setShowAuthModal(true);
                              setSandwichMenuOpen(false);
                            }}
                            className="w-full py-2.5 px-4 rounded-2xl bg-[#8B3A4A] hover:bg-[#6E2937] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
                          >
                            <User className="w-4 h-4" />
                            <span>Acceder</span>
                          </button>
                        </div>
                      )}

                    </div>
                  </>
                )}
              </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FDFBF7] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E8DCCF] relative">
            <button 
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-[#8C827A] hover:text-[#2D2A26]"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#8A9A86]/20 text-[#4A5D46] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#2D2A26]">Importar Respaldo de Boda</h3>
                <p className="text-xs text-[#7A7268]">Carga tu archivo o pega el código JSON exportado</p>
              </div>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Seleccionar archivo .json
                </label>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleFileImport}
                  className="block w-full text-xs text-[#524B42] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#8B3A4A] file:text-white hover:file:bg-[#6A2534] file:cursor-pointer cursor-pointer border border-[#D9CEBF] rounded-lg p-1 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  O pegar contenido JSON
                </label>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='{"settings": {...}, "guests": [...]}'
                  className="w-full text-xs font-mono p-3 rounded-lg border border-[#D9CEBF] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/30"
                />
              </div>

              {importError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {importError}
                </p>
              )}

              {importSuccess && (
                <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>¡Datos importados y actualizados con éxito!</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#7A7268] hover:bg-[#EFEAE2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#8B3A4A] hover:bg-[#6A2534] transition-colors shadow-xs"
                >
                  Restaurar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
