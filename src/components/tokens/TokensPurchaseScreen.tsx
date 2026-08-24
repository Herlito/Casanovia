import React, { useState, useRef } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Check, 
  Paperclip, 
  X, 
  CheckCircle2, 
  Copy, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  AlertCircle, 
  Settings, 
  Building2, 
  Smartphone, 
  Info,
  Mail,
  Users,
  UserCheck,
  Plus,
  Minus
} from 'lucide-react';
import { TokensAdminSettingsModal } from './TokensAdminSettingsModal';

export const TokensPurchaseScreen: React.FC = () => {
  const { currentUser, isLevel1Admin, tokensPaymentConfig, setActiveView } = useWedding();

  // Selected Services
  const [invitationActive, setInvitationActive] = useState<boolean>(true);
  const [coordinationActive, setCoordinationActive] = useState<boolean>(true);
  const [confirmedGuestsActive, setConfirmedGuestsActive] = useState<boolean>(true);
  const [packFullActive, setPackFullActive] = useState<boolean>(false);

  // Quantities: Starting at 1 for Gestión de Boda, and 100 for Número de Invitados Confirmados
  const [numPersons, setNumPersons] = useState<number>(1);
  const [numConfirmed, setNumConfirmed] = useState<number>(100);

  // Payment upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [modalIsDragging, setModalIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Order submission modal
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [orderCopied, setOrderCopied] = useState<boolean>(false);
  const [orderCode, setOrderCode] = useState<string>('');

  // Admin configuration modal
  const [adminSettingsOpen, setAdminSettingsOpen] = useState<boolean>(false);

  // Copy feedback states for quick payment buttons
  const [copiedBank, setCopiedBank] = useState<boolean>(false);
  const [copiedYape, setCopiedYape] = useState<boolean>(false);

  // Requirement: el check para Número de invitados solo se activa si se marca el casillero de Gestión de Boda.
  const handleToggleCoordination = () => {
    const nextVal = !coordinationActive;
    setCoordinationActive(nextVal);
    if (!nextVal) {
      setConfirmedGuestsActive(false);
    }
  };

  const handleToggleConfirmedGuests = () => {
    if (!coordinationActive) {
      alert('Para activar "Número de Invitados Confirmados", primero debes seleccionar el servicio de "Gestión por boda - Coordinación Integral".');
      return;
    }
    setConfirmedGuestsActive(!confirmedGuestsActive);
  };

  // Unit costs
  const INVITATION_PRICE = 100.0;
  const PERSON_PRICE = 33.0;
  const CONFIRMED_PRICE = 1.0;
  const DISCOUNT_RATE = 0.10; // 10% Discount

  // Calculations
  const invitationTotal = invitationActive ? INVITATION_PRICE : 0;
  const coordinationTotal = coordinationActive ? Math.max(0, numPersons) * PERSON_PRICE : 0;
  const confirmedTotal = (coordinationActive && confirmedGuestsActive) ? Math.max(0, numConfirmed) * CONFIRMED_PRICE : 0;

  // Base sum of the 3 services regardless of individual toggle (for Pack Full calculation reference)
  const fullPackBaseSum = INVITATION_PRICE + (Math.max(0, numPersons) * PERSON_PRICE) + (Math.max(0, numConfirmed) * CONFIRMED_PRICE);
  const fullPackDiscount = fullPackBaseSum * DISCOUNT_RATE;
  const fullPackFinalPrice = fullPackBaseSum - fullPackDiscount;

  // Real cart calculation
  const subtotal = invitationTotal + coordinationTotal + confirmedTotal;
  
  // Count active items
  const activeItemsCount = (invitationActive ? 1 : 0) + (coordinationActive ? 1 : 0) + ((coordinationActive && confirmedGuestsActive) ? 1 : 0);

  // Apply discount if packFull is checked OR if all 3 services are active and packFull is toggled
  const isDiscountApplied = packFullActive || (invitationActive && coordinationActive && confirmedGuestsActive && packFullActive);
  const discountAmount = isDiscountApplied ? (subtotal * DISCOUNT_RATE) : 0;
  const totalToPay = Math.max(0, subtotal - discountAmount);

  // Toggle Pack Full handler
  const handleTogglePackFull = () => {
    if (!packFullActive) {
      setPackFullActive(true);
      setInvitationActive(true);
      setCoordinationActive(true);
      setConfirmedGuestsActive(true);
    } else {
      setPackFullActive(false);
    }
  };

  // Stepper increment / decrement helpers
  const handlePersonsChange = (delta: number) => {
    if (!coordinationActive) return;
    setNumPersons(prev => Math.max(1, prev + delta));
  };

  const handleConfirmedChange = (delta: number) => {
    if (!coordinationActive || !confirmedGuestsActive) return;
    setNumConfirmed(prev => Math.max(0, prev + delta));
  };

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.jpg') && !file.name.toLowerCase().endsWith('.jpeg') && !file.name.toLowerCase().endsWith('.png')) {
      setFileError('Por favor selecciona una imagen válida en formato .jpg o .png.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('La imagen excede el límite de 10MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (modalFileInputRef.current) {
      modalFileInputRef.current.value = '';
    }
  };

  // Quick copy buttons
  const copyTransferData = () => {
    const text = `*DATOS DE TRANSFERENCIA BANCARIA*\n` +
      `• Banco: ${tokensPaymentConfig.bankName}\n` +
      `• Titular: ${tokensPaymentConfig.accountHolder}\n` +
      `• Nro. de Cuenta: ${tokensPaymentConfig.accountNumber}\n` +
      `• CCI Interbancario: ${tokensPaymentConfig.cci}\n` +
      (tokensPaymentConfig.extraNotes ? `• Nota: ${tokensPaymentConfig.extraNotes}` : '');
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2200);
  };

  const copyYapeNumber = () => {
    const text = tokensPaymentConfig.yapePhone;
    navigator.clipboard.writeText(text);
    setCopiedYape(true);
    setTimeout(() => setCopiedYape(false), 2200);
  };

  // Submit Order
  const handlePurchase = () => {
    if (totalToPay <= 0) {
      alert('Por favor selecciona al menos un servicio para proceder con la compra.');
      return;
    }

    const generatedCode = `TOK-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(generatedCode);
    setOrderModalOpen(true);
  };

  const formatPrice = (val: number) => {
    return `S/ ${val.toFixed(2)}`;
  };

  const copyOrderDetails = () => {
    const summary = `*PEDIDO TOKENS & SERVICIOS* - Código: ${orderCode}\n` +
      `• Total a Pagar: ${formatPrice(totalToPay)}\n` +
      `• Servicios:\n` +
      (invitationActive ? `  - Invitación de Bodas Interactiva: ${formatPrice(invitationTotal)}\n` : '') +
      (coordinationActive ? `  - Gestión por boda (${numPersons} personas): ${formatPrice(coordinationTotal)}\n` : '') +
      (confirmedGuestsActive ? `  - Invitados confirmados (${numConfirmed} confirmados): ${formatPrice(confirmedTotal)}\n` : '') +
      (discountAmount > 0 ? `• Descuento Pack Full (-10%): -${formatPrice(discountAmount)}\n` : '');

    navigator.clipboard.writeText(summary);
    setOrderCopied(true);
    setTimeout(() => setOrderCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2D2A26] selection:bg-[#E5B869]/30 selection:text-[#2D2A26]">
      
      {/* Top Bar with Admin Controls (No "Volver al Panel de Control") */}
      {isLevel1Admin && (
        <div className="bg-white border-b border-[#E8DCCF] px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF3ED] text-[#8B3A4A] text-[11px] font-bold border border-[#E8DCCF]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Modo Administrador</span>
              </span>
            </div>

            <button
              type="button"
              id="btn-admin-config-tokens-payment"
              onClick={() => setAdminSettingsOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#2A1810] hover:bg-[#1E110B] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>Editar Datos de Pago & QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Centered Logo & Header (without 'Shopping Cart') */}
      <header className="pt-8 pb-6 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-2.5">
          
          {/* Centered Brand Emblem / Logo Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-linear-to-tr from-[#2A1810] to-[#4A2E1B] flex items-center justify-center text-[#E5B869] shadow-md border-2 border-[#E5B869]/40">
            <svg 
              className="w-7 h-7 sm:w-8 sm:h-8" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.75" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-[#8C8276] font-bold">
            Servicios Digitales & Coordinación Nupcial
          </p>
        </div>
      </header>

      {/* Main 2-Column Content Layout (Matching reference image) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Items Table / List): lg:col-span-8 */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Table Header Bar (Warm Sand/Gold Bar from reference image) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 rounded-xl bg-[#E5B869] text-[#2A1810] text-xs font-bold uppercase tracking-wider shadow-xs items-center">
              <div className="col-span-6">Servicio / Producto</div>
              <div className="col-span-2 text-center">Precio Unit.</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {/* Item 1: Invitación de Bodas - Interactiva */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
              invitationActive 
                ? 'border-[#E5B869] ring-1 ring-[#E5B869]/30' 
                : 'border-[#E8DCCF] opacity-75 hover:opacity-100'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Product details with checkbox and thumbnail */}
                <div className="sm:col-span-6 flex items-start sm:items-center space-x-3.5">
                  <button
                    type="button"
                    onClick={() => setInvitationActive(!invitationActive)}
                    className={`w-6 h-6 mt-1 sm:mt-0 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                      invitationActive
                        ? 'bg-[#2A1810] border-[#2A1810] text-white shadow-xs'
                        : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#2A1810]'
                    }`}
                    aria-label="Seleccionar Invitación de Bodas"
                  >
                    {invitationActive && <Check className="w-4 h-4 stroke-[3] text-[#E5B869]" />}
                  </button>

                  <div className="w-12 h-12 rounded-xl bg-[#FAF3ED] border border-[#E8DCCF] flex items-center justify-center text-[#8B3A4A] shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h2 className="font-bold text-sm sm:text-base text-[#2A1810] truncate">
                      Invitación de Bodas - Interactiva
                    </h2>
                    <p className="text-[11px] text-[#7A7268] leading-tight line-clamp-2">
                      Diseño digital personalizado, confirmación online (RSVP) y galería de fotos.
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="sm:col-span-2 text-left sm:text-center pl-10 sm:pl-0">
                  <span className="sm:hidden text-xs text-[#7A7268] mr-2">Precio:</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#524B42]">
                    {formatPrice(INVITATION_PRICE)}
                  </span>
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2 flex justify-start sm:justify-center pl-10 sm:pl-0">
                  <span className="px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8DCCF] text-xs font-bold text-[#524B42]">
                    1 u.
                  </span>
                </div>

                {/* Subtotal */}
                <div className="sm:col-span-2 text-left sm:text-right pl-10 sm:pl-0 font-mono font-bold text-sm sm:text-base text-[#2A1810]">
                  <span className="sm:hidden text-xs font-sans text-[#7A7268] mr-2">Subtotal:</span>
                  {formatPrice(invitationTotal)}
                </div>

              </div>
            </div>

            {/* Item 2: Gestión por boda - Coordinación Integral */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
              coordinationActive 
                ? 'border-[#E5B869] ring-1 ring-[#E5B869]/30' 
                : 'border-[#E8DCCF] opacity-75 hover:opacity-100'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Product details */}
                <div className="sm:col-span-6 flex items-start sm:items-center space-x-3.5">
                  <button
                    type="button"
                    onClick={handleToggleCoordination}
                    className={`w-6 h-6 mt-1 sm:mt-0 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                      coordinationActive
                        ? 'bg-[#2A1810] border-[#2A1810] text-white shadow-xs'
                        : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#2A1810]'
                    }`}
                    aria-label="Seleccionar Gestión por boda"
                  >
                    {coordinationActive && <Check className="w-4 h-4 stroke-[3] text-[#E5B869]" />}
                  </button>

                  <div className="w-12 h-12 rounded-xl bg-[#FAF3ED] border border-[#E8DCCF] flex items-center justify-center text-[#2A1810] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h2 className="font-bold text-sm sm:text-base text-[#2A1810] truncate">
                      Gestión por boda - Coordinación Integral
                    </h2>
                    <p className="text-[11px] text-[#7A7268] leading-tight line-clamp-2">
                      Planificación de eventos, proveedores, cronograma y asistencia el día de la boda.
                    </p>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-2 text-left sm:text-center pl-10 sm:pl-0">
                  <span className="sm:hidden text-xs text-[#7A7268] mr-2">Precio:</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#524B42]">
                    {formatPrice(PERSON_PRICE)}
                  </span>
                  <span className="block text-[10px] text-[#8C8276]">x persona</span>
                </div>

                {/* Quantity Stepper (Enlarged font size + starting at 1) */}
                <div className="sm:col-span-2 flex items-center justify-start sm:justify-center pl-10 sm:pl-0">
                  <div className="inline-flex items-center rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      disabled={!coordinationActive}
                      onClick={() => handlePersonsChange(-1)}
                      className="p-1.5 sm:p-2 text-[#524B42] hover:bg-[#EFEAE3] active:bg-[#E2DDD5] disabled:opacity-40 cursor-pointer transition-colors"
                      title="Disminuir personas"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      id="input-num-persons"
                      type="number"
                      min="1"
                      max="2000"
                      value={numPersons}
                      onChange={(e) => setNumPersons(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={!coordinationActive}
                      className="w-14 sm:w-16 py-1 text-center font-extrabold text-base sm:text-lg text-[#2A1810] bg-transparent focus:outline-hidden disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={!coordinationActive}
                      onClick={() => handlePersonsChange(1)}
                      className="p-1.5 sm:p-2 text-[#524B42] hover:bg-[#EFEAE3] active:bg-[#E2DDD5] disabled:opacity-40 cursor-pointer transition-colors"
                      title="Aumentar personas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="sm:col-span-2 text-left sm:text-right pl-10 sm:pl-0 font-mono font-bold text-sm sm:text-base text-[#2A1810]">
                  <span className="sm:hidden text-xs font-sans text-[#7A7268] mr-2">Subtotal:</span>
                  {formatPrice(coordinationTotal)}
                </div>

              </div>
            </div>

            {/* Item 3: Número de Invitados Confirmados */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
              !coordinationActive
                ? 'border-[#E8DCCF] opacity-50 bg-[#FAF8F5]'
                : confirmedGuestsActive 
                  ? 'border-[#E5B869] ring-1 ring-[#E5B869]/30' 
                  : 'border-[#E8DCCF] opacity-75 hover:opacity-100'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Product details */}
                <div className="sm:col-span-6 flex items-start sm:items-center space-x-3.5">
                  <button
                    type="button"
                    onClick={handleToggleConfirmedGuests}
                    disabled={!coordinationActive}
                    className={`w-6 h-6 mt-1 sm:mt-0 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                      !coordinationActive
                        ? 'border-[#D9CEBF] bg-[#EFEBE6] text-[#A0988E] cursor-not-allowed'
                        : confirmedGuestsActive
                          ? 'bg-[#2A1810] border-[#2A1810] text-white shadow-xs cursor-pointer'
                          : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#2A1810] cursor-pointer'
                    }`}
                    aria-label="Seleccionar Número de Invitados Confirmados"
                  >
                    {coordinationActive && confirmedGuestsActive && <Check className="w-4 h-4 stroke-[3] text-[#E5B869]" />}
                  </button>

                  <div className="w-12 h-12 rounded-xl bg-[#FAF3ED] border border-[#E8DCCF] flex items-center justify-center text-emerald-800 shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h2 className="font-bold text-sm sm:text-base text-[#2A1810] truncate">
                        Número de Invitados Confirmados
                      </h2>
                      {!coordinationActive && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#EFEAE3] text-[#7A7268] text-[9px] font-semibold">
                          <Info className="w-3 h-3" />
                          <span>Requiere Gestión de Boda</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A7268] leading-tight line-clamp-2">
                      Herramienta de seguimiento, confirmación de asistencia en tiempo real, gestión de mesas y cronograma.
                    </p>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-2 text-left sm:text-center pl-10 sm:pl-0">
                  <span className="sm:hidden text-xs text-[#7A7268] mr-2">Precio:</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#524B42]">
                    {formatPrice(CONFIRMED_PRICE)}
                  </span>
                  <span className="block text-[10px] text-[#8C8276]">x confirmado</span>
                </div>

                {/* Quantity Stepper (Enlarged font size + starting at 100) */}
                <div className="sm:col-span-2 flex items-center justify-start sm:justify-center pl-10 sm:pl-0">
                  <div className="inline-flex items-center rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      disabled={!coordinationActive || !confirmedGuestsActive}
                      onClick={() => handleConfirmedChange(-10)}
                      className="p-1.5 sm:p-2 text-[#524B42] hover:bg-[#EFEAE3] active:bg-[#E2DDD5] disabled:opacity-40 cursor-pointer transition-colors"
                      title="Disminuir 10 confirmados"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      id="input-num-confirmed"
                      type="number"
                      min="0"
                      max="2000"
                      value={numConfirmed}
                      onChange={(e) => setNumConfirmed(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={!coordinationActive || !confirmedGuestsActive}
                      className="w-14 sm:w-16 py-1 text-center font-extrabold text-base sm:text-lg text-[#2A1810] bg-transparent focus:outline-hidden disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={!coordinationActive || !confirmedGuestsActive}
                      onClick={() => handleConfirmedChange(10)}
                      className="p-1.5 sm:p-2 text-[#524B42] hover:bg-[#EFEAE3] active:bg-[#E2DDD5] disabled:opacity-40 cursor-pointer transition-colors"
                      title="Aumentar 10 confirmados"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="sm:col-span-2 text-left sm:text-right pl-10 sm:pl-0 font-mono font-bold text-sm sm:text-base text-[#2A1810]">
                  <span className="sm:hidden text-xs font-sans text-[#7A7268] mr-2">Subtotal:</span>
                  {formatPrice(confirmedTotal)}
                </div>

              </div>
            </div>

            {/* Item 4: PACK FULL (Invitación + Gestión + Confirmados) with 10% OFF */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
              packFullActive 
                ? 'border-[#E5B869] ring-2 ring-[#E5B869]/30 bg-linear-to-r from-white to-[#FAF3ED]/50' 
                : 'border-[#E8DCCF] hover:border-[#D9CEBF]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5 flex-1">
                  <button
                    type="button"
                    onClick={handleTogglePackFull}
                    className={`w-6 h-6 mt-1 sm:mt-0 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                      packFullActive
                        ? 'bg-[#2A1810] border-[#2A1810] text-white shadow-xs'
                        : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#2A1810]'
                    }`}
                    aria-label="Seleccionar PACK FULL"
                  >
                    {packFullActive && <Check className="w-4 h-4 stroke-[3] text-[#E5B869]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h2 className="font-bold text-sm sm:text-base text-[#2A1810]">
                        PACK FULL (Invitación + Gestión + Confirmados)
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#2A1810] text-[#E5B869] uppercase tracking-wider border border-[#E5B869]/50 shadow-2xs">
                        -10% OFF
                      </span>
                    </div>
                    <p className="text-xs text-[#7A7268] max-w-xl leading-relaxed">
                      Obtén un 10% de DESCUENTO en el total al contratar los tres servicios de la lista.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end space-y-0.5 shrink-0 pl-9 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F0EAE1]">
                  <div className="text-xs text-[#7A7268] font-mono">
                    {formatPrice(INVITATION_PRICE)} + {formatPrice(Math.max(0, numPersons) * PERSON_PRICE)} + {formatPrice(Math.max(0, numConfirmed) * CONFIRMED_PRICE)}
                  </div>
                  <div className="text-xs font-bold text-emerald-700 font-mono">
                    -10%: - {formatPrice(fullPackDiscount)}
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#2A1810] font-mono">
                    {formatPrice(fullPackFinalPrice)}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Resumen del Pedido & Checkout (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border border-[#E8DCCF] p-6 shadow-sm space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#2A1810] tracking-wide border-b border-[#F0EAE1] pb-3">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-[#7A7268]">
                  <span>Servicios</span>
                  <span className="font-bold text-[#2A1810]">{activeItemsCount}</span>
                </div>

                <div className="flex items-center justify-between text-[#7A7268]">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-[#2A1810]">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-[#7A7268]">
                  <span>Descuento Pack Full (-10%)</span>
                  <span className={`font-mono font-bold ${discountAmount > 0 ? 'text-emerald-700' : 'text-[#8C8276]'}`}>
                    {discountAmount > 0 ? `- ${formatPrice(discountAmount)}` : formatPrice(0)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E8DCCF] text-sm sm:text-base font-extrabold text-[#2A1810]">
                  <span>Total</span>
                  <span className="font-mono text-xl text-[#2A1810]">{formatPrice(totalToPay)}</span>
                </div>
              </div>

              {/* Proceed to Checkout / Proceder al Pago */}
              <button
                type="button"
                id="btn-proceder-pago"
                onClick={handlePurchase}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#2A1810] hover:bg-[#1A0E0A] active:scale-98 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#E5B869]" />
                <span>Proceder al Pago</span>
              </button>
            </div>

            {/* Payment Details & Quick Copy (Yape & Transferencia) */}
            <div className="bg-white rounded-2xl border border-[#E8DCCF] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A1810]">
                  Datos de Pago
                </h3>
                {isLevel1Admin && (
                  <button
                    type="button"
                    onClick={() => setAdminSettingsOpen(true)}
                    className="text-[11px] text-[#8B3A4A] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Configurar</span>
                  </button>
                )}
              </div>

              {/* QR Image 1:1 Display */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#FAF8F5] border border-[#E8DCCF]">
                <div className="w-32 h-32 aspect-square rounded-xl bg-white p-1.5 border border-[#D9CEBF] shadow-xs flex items-center justify-center overflow-hidden">
                  {tokensPaymentConfig.qrImageUrl ? (
                    <img 
                      src={tokensPaymentConfig.qrImageUrl} 
                      alt="Código QR Oficial" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-2 space-y-1">
                      <QrCode className="w-8 h-8 text-[#8C8276] mx-auto opacity-40" />
                      <p className="text-[10px] text-[#8C8276] font-medium">QR no configurado</p>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-[#7A7268] mt-1.5">
                  Escanea para pagar
                </span>
              </div>

              {/* Yape Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2A1810]">Solo Yape:</span>
                  <span className="font-mono font-black text-[#7A1FA2]">{tokensPaymentConfig.yapePhone}</span>
                </div>
                <button
                  type="button"
                  id="btn-copiar-nro-yape"
                  onClick={copyYapeNumber}
                  className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EAE1] border border-[#D9CEBF] text-[#2A1810] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#7A1FA2]" />
                  <span>{copiedYape ? '¡Nro. Copiado!' : 'Copiar Nro de Yape'}</span>
                </button>
              </div>

              {/* Transferencia Button */}
              <div className="space-y-1.5 pt-2 border-t border-[#F0EAE1]">
                <div className="text-xs">
                  <div className="font-bold text-[#2A1810]">{tokensPaymentConfig.bankName}</div>
                  <div className="text-[10px] text-[#7A7268] truncate">Cta: {tokensPaymentConfig.accountNumber}</div>
                </div>
                <button
                  type="button"
                  id="btn-copiar-datos-transferencia"
                  onClick={copyTransferData}
                  className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EAE1] border border-[#D9CEBF] text-[#2A1810] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#2A1810]" />
                  <span>{copiedBank ? '¡Datos Copiados!' : 'Copiar datos de Transferencia'}</span>
                </button>
              </div>
            </div>

            {/* Voucher Upload Card */}
            <div className="bg-white rounded-2xl border border-[#E8DCCF] p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A1810]">
                Subir Comprobante (JPG / PNG)
              </h3>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border rounded-xl p-3 text-center transition-all ${
                  isDragging 
                    ? 'border-[#E5B869] bg-[#FAF3ED]' 
                    : 'border-[#D9CEBF] bg-[#FAF8F5]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="voucher-file-input"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>Subir Imagen (JPG)</span>
                </button>

                {selectedFile && (
                  <div className="mt-2 text-[11px] text-[#2A1810] flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="truncate flex items-center text-emerald-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {fileError && (
                  <div className="mt-2 p-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Confirmation / Order Summary Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FDFBF7] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8DCCF] space-y-6 relative">
            <button
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-4 right-4 text-[#8C8276] hover:text-[#2D2A26] p-1 rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-2xl font-bold text-[#2D2A26]">
                ¡Solicitud de Pedido Registrada!
              </h3>
              <p className="text-xs text-[#7A7268]">
                Código de Transacción: <span className="font-mono font-bold text-[#2A1810]">{orderCode}</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8DCCF] space-y-3 text-xs">
              <div className="flex justify-between font-bold text-sm border-b border-[#F0EAE1] pb-2 text-[#2D2A26]">
                <span>Total a Transferir:</span>
                <span className="font-mono text-[#2A1810] font-extrabold">{formatPrice(totalToPay)}</span>
              </div>

              <div className="space-y-1.5 text-[#524B42]">
                <p className="font-semibold text-[#2D2A26]">Detalle de Servicios:</p>
                {invitationActive && (
                  <div className="flex justify-between">
                    <span>• Invitación de Bodas Interactiva</span>
                    <span className="font-mono">{formatPrice(invitationTotal)}</span>
                  </div>
                )}
                {coordinationActive && (
                  <div className="flex justify-between">
                    <span>• Gestión por Boda ({numPersons} personas)</span>
                    <span className="font-mono">{formatPrice(coordinationTotal)}</span>
                  </div>
                )}
                {coordinationActive && confirmedGuestsActive && (
                  <div className="flex justify-between">
                    <span>• Invitados Confirmados ({numConfirmed} confirmados)</span>
                    <span className="font-mono">{formatPrice(confirmedTotal)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-dashed border-[#E8DCCF]">
                    <span>• Descuento Pack Full (-10%)</span>
                    <span className="font-mono">- {formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="pt-2 border-t border-[#F0EAE1] text-emerald-800 text-[11px] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Comprobante adjuntado: <strong>{selectedFile.name}</strong></span>
                </div>
              )}
            </div>

            {/* Voucher Upload Section in Modal */}
            <div className="bg-white rounded-2xl border border-[#E8DCCF] p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1810]">
                  Subir Comprobante (JPG / PNG)
                </h4>
                {selectedFile && (
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Adjuntado
                  </span>
                )}
              </div>

              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setModalIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processFile(e.dataTransfer.files[0]);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setModalIsDragging(true);
                }}
                onDragLeave={() => setModalIsDragging(false)}
                className={`border rounded-xl p-3 text-center transition-all ${
                  modalIsDragging 
                    ? 'border-[#E5B869] bg-[#FAF3ED]' 
                    : 'border-[#D9CEBF] bg-[#FAF8F5]'
                }`}
              >
                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="modal-voucher-file-input"
                />

                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>{selectedFile ? 'Cambiar Imagen (JPG / PNG)' : 'Subir Imagen (JPG / PNG)'}</span>
                </button>

                {selectedFile && (
                  <div className="mt-2 text-[11px] text-[#2A1810] flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="truncate flex items-center text-emerald-800 font-medium max-w-[280px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      title="Eliminar comprobante"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {fileError && (
                  <div className="mt-2 p-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={copyOrderDetails}
                className="w-full py-2.5 px-4 rounded-xl border border-[#D9CEBF] bg-white hover:bg-[#FAF3ED] text-[#2D2A26] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[#2A1810]" />
                <span>{orderCopied ? '¡Detalles Copiados!' : 'Copiar Resumen de Pedido'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2A1810] hover:bg-[#1A0E0A] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Aceptar y Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Settings Modal for 1:1 QR and Payment Info */}
      <TokensAdminSettingsModal 
        isOpen={adminSettingsOpen}
        onClose={() => setAdminSettingsOpen(false)}
      />

    </div>
  );
};
