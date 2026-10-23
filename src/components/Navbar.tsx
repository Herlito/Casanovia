import { FileText, FolderUp, FileJson, HardDrive } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '../context/WeddingContext';
import { SubirWebModal } from './modals/SubirWebModal';
import { HostingDiskReportModal } from './modals/HostingDiskReportModal';
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
  const { setViewMode,  
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
    isLevel4Free,
    showUpgradeNotice,
    isHostUser, 
    isPlannerOrAdmin, 
    isLevel5Observer,
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
    isPublicHomeLanding,
    appTheme,
    setAppTheme,
  } = useWedding();

  const [sandwichMenuOpen, setSandwichMenuOpen] = useState(false);
  const sandwichMenuRef = useRef<HTMLDivElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSubirWebModal, setShowSubirWebModal] = useState(false);
  const [showDiskReportModal, setShowDiskReportModal] = useState(false);
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

  // Ensure sandwich menu is closed whenever user is not authenticated
  useEffect(() => {
    if (!currentUser.isAuthenticated) {
      setSandwichMenuOpen(false);
    }
  }, [currentUser.isAuthenticated]);

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

  // Si está en la home landing o no está autenticado en vista pública, no mostrar el encabezado ni menú sandwich
  if (isPublicHomeLanding || (!currentUser.isAuthenticated && activeView === 'public')) {
    return null;
  }

  return (
    <>
      {/* Updated Header Background */}
      <header className={`print:hidden sticky top-0 z-50 backdrop-blur-md border-b shadow-xs ${isPublicHomeLanding ? "bg-[#EBEBEB] border-[#D4D4D4]" : "bg-[#EBEBEB]/95 border-[#EADDCE]"}`}>
        

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* Left Column: View Switcher (Only icons without text for PC, tablet and mobile) */}
            <div className={`transition-opacity ${isPublicHomeLanding ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center space-x-2 z-20">
              {currentUser.isAuthenticated && (
                <div className="bg-[#EFEAE2] p-1 rounded-full flex items-center border border-[#D9CEBF] shadow-inner animate-fadeIn">
                  {!isLevel4Free ? (
                    <button
                      type="button"
                      id="nav-btn-public-view"
                      onClick={() => {
                        if (settings?.hasVirtualInvitation !== true) {
                          showUpgradeNotice(
                            'Invitación virtual deshabilitada',
                            'Este evento no tiene habilitada una "Invitación virtual". Para activar el acceso a la Web de Invitados, ve a la pestaña Ajustes del evento y marca la casilla "Invitación virtual".'
                          );
                        } else {
                          setActiveView('public');
                        }
                      }}
                      title="Web Invitados"
                      className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
                        activeView === 'public'
                          ? 'bg-[#EBEBEB] text-[#2D3748] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] ring-1 ring-[#d1d1d1]/20'
                          : 'text-[#6B6358] hover:text-[#2D2A26] hover:bg-[#EBEBEB]/50'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-[#2D3748]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="nav-btn-public-view-locked"
                      onClick={() => showUpgradeNotice('Web Invitados', 'El acceso a la "Web Invitados" no está disponible para cuentas de Nivel 4 (Plan Gratuito). Por favor sube de nivel para habilitar la web interactiva para tus invitados.')}
                      title="Subir de Nivel - Web Invitados no disponible para Nivel 4"
                      className="flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer opacity-40 hover:opacity-90 text-amber-700 hover:text-amber-800"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    id="nav-btn-private-view"
                    onClick={() => setActiveView('private')}
                    title="Dashboard Novios"
                    className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer relative ${
                      activeView === 'private'
                        ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] ring-1 ring-[#d1d1d1]'
                        : 'text-[#6B6358] hover:text-[#2D2A26] hover:bg-[#EBEBEB]/50'
                    }`}
                  >
                    <LayoutDashboard className={`w-4 h-4 ${activeView === 'private' ? 'text-[#2D3748]' : 'text-[#2D3748]'}`} />
                    <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                      isLevel1Admin ? 'bg-emerald-400' : isLevel3Planner ? 'bg-teal-400' : 'bg-amber-400'
                    }`} />
                  </button>
                </div>
              )}
            </div>
            </div>

            {/* Center: In home landing without login, display Sandwich Menu in the middle of header; otherwise official logo or wedding badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-auto">
              {isPublicHomeLanding ? (
                /* Sandwich Menu in the middle of header when unauthenticated home: direct login modal */
                <div className="relative">
                  <button
                    type="button"
                    id="btn-sandwich-menu-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSandwichMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    aria-label="Abrir Menú de Opciones"
                    className="p-3 sm:p-4 rounded-full bg-[#EBEBEB] text-gray-700 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 cursor-pointer border-none"
                    title="Menú de Acciones y Herramientas"
                  >
                    <Menu className="w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" />
                  </button>
                </div>
              ) : (currentUser.isAuthenticated || activeView === 'tokens') ? (
                <button
                  type="button"
                  id="btn-nav-logo-home"
                  onClick={() => {
                    setActiveView('private');
                  }}
                  className="cursor-pointer bg-transparent border-0 border-none p-0 m-0 flex items-center justify-center hover:opacity-80 active:scale-98 transition-all focus:outline-none focus:ring-0 group shadow-none"
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }}
                  title="Casanovia"
                >
                  <img 
                    src="/casanovia.svg" 
                    alt="Casanovia" 
                    className="h-8 sm:h-10 md:h-11 w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[220px] object-contain select-none border-0 border-none shadow-none"
                    style={{ background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }}
                    referrerPolicy="no-referrer"
                  />
                </button>
              ) : (
                <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-1 rounded-full bg-[#FAF3ED] text-[#2D3748] text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-transparent shadow-2xs whitespace-nowrap">
                  <Heart className="w-3 h-3 fill-[#2D3748] text-[#2D3748] shrink-0" />
                  <span>Nuestra Boda & Guía Oficial</span>
                  <Heart className="w-3 h-3 fill-[#2D3748] text-[#2D3748] shrink-0" />
                </div>
              )}
            </div>

            {/* Right: Auth status, Cloud Sync, Share button & Sandwich Menu */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3 ml-auto z-20">

              {/* User Session Pill - Solo cuando está autenticado */}
              {!isPublicHomeLanding && currentUser.isAuthenticated && (
                <div className="flex items-center">
                  <div className="hidden sm:flex items-center pl-2 border-l border-[#D9CEBF]">
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#EBEBEB] border border-transparent text-[#2D2A26] text-xs font-semibold shadow-2xs notranslate" translate="no">
                      <User className="w-3.5 h-3.5 text-[#2D3748]" />
                      <span className="truncate max-w-[120px] notranslate" translate="no">{currentUser.username}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sandwich Menu Trigger Button (Icon only) - Only when not in isPublicHomeLanding mode */}
              {!isPublicHomeLanding && (
                <div className="relative" ref={sandwichMenuRef}>
                <button
                  type="button"
                  id="btn-sandwich-menu"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!currentUser || !currentUser.isAuthenticated) {
                      setSandwichMenuOpen(false);
                      setShowAuthModal(true);
                    } else {
                      setSandwichMenuOpen(!sandwichMenuOpen);
                    }
                  }}
                  aria-label="Abrir Menú de Opciones"
                  className={
                    isPublicHomeLanding
                      ? "p-2 sm:p-2.5 rounded-2xl bg-[#EBEBEB] text-gray-700 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 cursor-pointer border-none"
                      : `p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs ${
                          sandwichMenuOpen
                            ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] ring-2 ring-[#d1d1d1]/30'
                            : 'bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#2D2A26] border-[#D9CEBF]'
                        }`
                  }
                  title="Menú de Acciones y Herramientas"
                >
                  {sandwichMenuOpen && currentUser?.isAuthenticated ? (
                    <X className={isPublicHomeLanding ? "w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" : "w-5 h-5 transition-transform"} />
                  ) : (
                    <Menu className={isPublicHomeLanding ? "w-5 h-5 text-gray-600 transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" : "w-5 h-5 text-[#2D3748] transition-transform"} />
                  )}
                </button>

                {/* Sandwich Menu Floating Dropdown - Only for authenticated users */}
                {sandwichMenuOpen && currentUser?.isAuthenticated && (
                <>
                  {/* Backdrop for click outside */}
                  <div 
                    className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xs hidden sm:block"
                    onClick={() => setSandwichMenuOpen(false)}
                  />

                    <div 
                      className="fixed inset-0 top-0 h-[100dvh] w-full sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:h-auto overflow-y-auto sm:overflow-visible sm:w-80 p-[2px] sm:p-3 space-y-2 sm:space-y-3 bg-[#EBEBEB] sm:rounded-3xl shadow-none sm:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border-none z-[60] animate-fadeIn"
                    >
                      {/* Mobile Header with Close Button */}
                          <div className="sm:hidden flex items-center justify-between p-3 mb-2 border-b border-[#d1d1d1] sticky top-0 bg-[#EBEBEB] z-10">
                            <span className="font-serif-display font-bold text-gray-800 text-lg">Menú</span>
                            <button 
                              onClick={() => setSandwichMenuOpen(false)}
                              className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-600 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Menu Header: User & Wedding Context */}
                          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#EBEBEB] shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff]">
                            <div className="font-serif-display font-bold text-sm text-[#2D2A26] truncate pb-1">
                              {settings.coupleNames}
                            </div>
                            <div className="text-[11px] text-[#7A7268] flex items-center justify-between mt-1 pt-1 border-t border-black/5">
                              <span className="font-semibold text-[#2D3748]">
                                {`${currentUser.username} (${isLevel1Admin ? 'Nivel 1 Super Admin' : isLevel3Planner ? 'Nivel 3 Planner' : isLevel5Observer ? 'Nivel 5 Observador' : 'Nivel 2 Anfitrión'})`}
                              </span>
                            </div>
                          </div>

                          {/* Group 1: Administration & Weddings */}
                          <div className="space-y-1">


                            {/* 1. Administrar Usuarios / Anfitriones */}
                            {canManageUsers && (
                              <button
                                type="button"
                                id="sandwich-btn-manage-users"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setShowUserManagementModal(true);
                                }}
                                className="w-full flex items-center space-x-3 p-1.5 sm:p-2.5 rounded-xl text-left text-xs font-semibold text-[#2D2A26] bg-[#EBEBEB] hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all group cursor-pointer border-none"
                              >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center shrink-0 transition-transform text-[#2D3748]">
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

                            {/* Botones rápidos de Admin: Precios e Imágenes */}
                            {isLevel1Admin && (
                              <div className="flex gap-2 w-full mt-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSandwichMenuOpen(false);
                                    setActiveView('tokens');
                                  }}
                                  title="Precios"
                                  className="flex-1 flex items-center justify-center p-2 sm:p-2.5 rounded-xl text-[#2D3748] bg-[#EBEBEB] hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all cursor-pointer border-none"
                                >
                                  <ShoppingCart className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSandwichMenuOpen(false);
                                    setShowUploadedImagesModal(true);
                                  }}
                                  title="Imágenes Subidas"
                                  className="flex-1 flex items-center justify-center p-2 sm:p-2.5 rounded-xl text-[#2D3748] bg-[#EBEBEB] hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all cursor-pointer border-none relative"
                                >
                                  <ImageIcon className="w-5 h-5" />
                                  {uploadedImages.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-[#2D3748] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] ring-2 ring-[#EBEBEB]">
                                      {uploadedImages.length}
                                    </span>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Theme Selector (Levels 1, 2, 3) */}
                            {(isLevel1Admin || isHostUser || isLevel3Planner) && (
                              <div className="pt-2 mt-2 border-t border-[#d1d1d1]">
                                <div className="text-[10px] font-bold text-gray-500 uppercase px-2.5 mb-2">Tema Visual Global</div>
                                <div className="flex bg-[#EBEBEB] rounded-xl p-1 gap-1 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
                                  <button
                                    onClick={() => {
                                      setAppTheme('neumorphic');
                                      setSandwichMenuOpen(false);
                                    }}
                                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all border-none ${appTheme === 'neumorphic' ? 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-[#2D3748]' : 'text-gray-500 bg-transparent hover:text-gray-700'}`}
                                  >
                                    Neumórfico
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAppTheme('minimalist');
                                      setSandwichMenuOpen(false);
                                    }}
                                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all border-none ${appTheme === 'minimalist' ? 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-[#2D3748]' : 'text-gray-500 bg-transparent hover:text-gray-700'}`}
                                  >
                                    Minimalismo Funcional
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 2. Nueva Boda */}
                            {canCreateWedding ? (
                              <button
                                type="button"
                                id="sandwich-btn-new-wedding"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setShowNewWeddingModal(true);
                                }}
                                className="w-full flex items-center space-x-3 p-1.5 sm:p-2.5 rounded-xl text-left text-xs font-semibold text-[#2D2A26] bg-[#EBEBEB] hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all group cursor-pointer border-none"
                              >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center shrink-0 transition-transform text-[#2D3748]">
                                  <PlusCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>Crear Evento</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-[#2D3748]">
                                      Crear
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                    Crear evento y generar lista de tareas
                                  </p>
                                </div>
                              </button>
                            ) : isLevel4Free ? (
                              <button
                                type="button"
                                id="sandwich-btn-new-wedding-locked"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  showUpgradeNotice('Crear Nuevo Evento', 'Las cuentas de Nivel 4 (Plan Gratuito) solo pueden crear 1 nuevo evento. Sube de nivel para crear y gestionar eventos ilimitados.');
                                }}
                                className="w-full flex items-center space-x-3 p-1.5 sm:p-2.5 rounded-xl text-left text-xs font-semibold text-gray-500 bg-[#EBEBEB] hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] transition-all group cursor-pointer border-none"
                              >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center shrink-0 text-amber-600">
                                  <PlusCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between">
                                    <span className="text-gray-600">Crear Evento</span>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                      Subir de Nivel
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-amber-700 truncate font-normal">
                                    Límite de 1 evento alcanzado para Nivel 4
                                  </p>
                                </div>
                              </button>
                            ) : null}






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
                                className="w-full flex items-center space-x-3 p-1.5 sm:p-2.5 rounded-xl text-left text-xs font-semibold text-[#2D2A26] bg-[#EBEBEB] hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all group cursor-pointer border-none"
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


                            {/* Reporte Espacio en Hosting - Solo Administrador */}
                            {isLevel1Admin && (
                              <button
                                type="button"
                                id="sandwich-btn-hosting-disk-report"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setShowDiskReportModal(true);
                                }}
                                className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-gray-800 bg-[#EBEBEB] hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all group cursor-pointer border-none"
                              >
                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center shrink-0 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]">
                                  <HardDrive className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>Reporte Espacio Hosting</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800">
                                      Auditoría
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 truncate font-normal">
                                    Consumo por carpetas, módulos y eventos
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
                              className="w-full py-2 px-3 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-stone-600 hover:text-rose-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer border-none"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Cerrar Sesión ({currentUser.username})</span>
                            </button>
                          </div>
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
          <div className="bg-[#EBEBEB] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-transparent relative">
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
                  className="block w-full text-xs text-[#524B42] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] file:text-[#2D3748] hover:file:bg-[#6A2534] file:cursor-pointer cursor-pointer border border-[#D9CEBF] rounded-lg p-1 bg-[#EBEBEB]"
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
                  className="w-full text-xs font-mono p-3 rounded-lg border border-[#D9CEBF] bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/30"
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
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-[#2D3748] bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#6A2534] transition-colors shadow-xs"
                >
                  Restaurar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Descargar Paquete SubirWeb para cPanel */}
      <SubirWebModal 
        isOpen={showSubirWebModal} 
        onClose={() => setShowSubirWebModal(false)} 
      />

      {/* Modal Reporte de Espacio en Hosting */}
      <HostingDiskReportModal 
        isOpen={showDiskReportModal} 
        onClose={() => setShowDiskReportModal(false)} 
      />
    </>
  );
};
