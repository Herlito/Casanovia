import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Check, 
  Paperclip, 
  Upload, 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  CreditCard,
  QrCode,
  AlertCircle,
  Settings,
  Building2,
  Smartphone,
  Info
} from 'lucide-react';
import { TokensAdminSettingsModal } from './TokensAdminSettingsModal';

export const TokensPurchaseScreen: React.FC = () => {
  const { setActiveView, currentUser, isLevel1Admin, tokensPaymentConfig } = useWedding();

  // Selected Services
  const [invitationActive, setInvitationActive] = useState<boolean>(true);
  const [coordinationActive, setCoordinationActive] = useState<boolean>(true);
  const [confirmedGuestsActive, setConfirmedGuestsActive] = useState<boolean>(true);
  const [packFullActive, setPackFullActive] = useState<boolean>(false);

  // Quantities
  const [numPersons, setNumPersons] = useState<number>(150);
  const [numConfirmed, setNumConfirmed] = useState<number>(120);

  // Payment upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  // When coordinationActive turns false, confirmedGuestsActive MUST automatically turn false or be deactivated.
  const handleToggleCoordination = () => {
    const nextVal = !coordinationActive;
    setCoordinationActive(nextVal);
    if (!nextVal) {
      setConfirmedGuestsActive(false);
    }
  };

  const handleToggleConfirmedGuests = () => {
    // Only allow activating if coordinationActive is true
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
  const DISCOUNT_RATE = 0.15; // 15%

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
  
  // Apply discount if packFull is checked AND all 3 services are active (or if packFull is explicitly chosen)
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
  };

  // Quick copy buttons
  const copyTransferData = () => {
    const text = `*DATOS DE TRANSFERENCIA BANCARIA - CASANOVIA*\n` +
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

    // Generate reference code
    const generatedCode = `TOK-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(generatedCode);
    setOrderModalOpen(true);
  };

  const formatPrice = (val: number) => {
    return `S/ ${val.toFixed(2)}`;
  };

  const copyOrderDetails = () => {
    const summary = `*PEDIDO CASANOVIA TOKENS* - Código: ${orderCode}\n` +
      `• Total a Pagar: ${formatPrice(totalToPay)}\n` +
      `• Servicios:\n` +
      (invitationActive ? `  - Invitación de Bodas Interactiva: ${formatPrice(invitationTotal)}\n` : '') +
      (coordinationActive ? `  - Gestión por boda (${numPersons} personas): ${formatPrice(coordinationTotal)}\n` : '') +
      (confirmedGuestsActive ? `  - Invitados confirmados (${numConfirmed} personas): ${formatPrice(confirmedTotal)}\n` : '') +
      (discountAmount > 0 ? `• Descuento Pack Full (-15%): -${formatPrice(discountAmount)}\n` : '');

    navigator.clipboard.writeText(summary);
    setOrderCopied(true);
    setTimeout(() => setOrderCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2A26] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#8B3A4A]/20 selection:text-[#8B3A4A]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation back bar & Admin actions */}
        <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-4 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              if (currentUser.isAuthenticated) {
                setActiveView('private');
              } else {
                setActiveView('public');
              }
            }}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#8B3A4A] hover:text-[#6E2937] px-3 py-1.5 rounded-xl hover:bg-[#FAF3ED] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al {currentUser.isAuthenticated ? 'Panel de Control' : 'Inicio'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {isLevel1Admin && (
              <button
                type="button"
                id="btn-admin-config-tokens-payment"
                onClick={() => setAdminSettingsOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#8B3A4A] hover:bg-[#6E2937] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Editar Datos de Pago & QR</span>
              </button>
            )}

            {currentUser.isAuthenticated && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF3ED] text-[#8B3A4A] text-xs font-semibold border border-[#E8DCCF]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Acceso Administrador:</span>
                <span>{currentUser.username}</span>
              </div>
            )}
          </div>
        </div>

        {/* Brand Header: casanovia in lowercase */}
        <div className="text-center space-y-1">
          <h1 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-tight text-[#2D2A26] select-none">
            casanovia
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#8C8276] font-medium">
            Gestión Nupcial & Servicios Digitales
          </p>
        </div>

        {/* Section Title: CARRITO DE COMPRAS */}
        <div className="pt-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-[#2D2A26] uppercase">
            CARRITO DE COMPRAS
          </h2>
        </div>

        {/* Services List / Cart Items */}
        <div className="space-y-4">
          
          {/* Item 1: Invitación de Bodas - Interactiva */}
          <div 
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
              invitationActive 
                ? 'border-[#8B3A4A]/40 ring-1 ring-[#8B3A4A]/10' 
                : 'border-[#E8DCCF] opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <button
                  type="button"
                  onClick={() => setInvitationActive(!invitationActive)}
                  className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                    invitationActive
                      ? 'bg-[#1E2B3E] border-[#1E2B3E] text-white shadow-xs'
                      : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#8B3A4A]'
                  }`}
                  aria-label="Seleccionar Invitación de Bodas Interactiva"
                >
                  {invitationActive && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-[#2D2A26]">
                    Invitación de Bodas - Interactiva
                  </h3>
                  <p className="text-xs text-[#7A7268] max-w-xl leading-relaxed">
                    Incluye diseño digital personalizado, confirmación online (RSVP) y galería de fotos.
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right shrink-0 pl-9 sm:pl-0">
                <div className="text-base sm:text-lg font-bold text-[#2D2A26]">
                  {formatPrice(INVITATION_PRICE)}
                </div>
              </div>
            </div>
          </div>

          {/* Item 2: Gestión por boda - Coordinación Integral */}
          <div 
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
              coordinationActive 
                ? 'border-[#8B3A4A]/40 ring-1 ring-[#8B3A4A]/10' 
                : 'border-[#E8DCCF] opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5 flex-1">
                <button
                  type="button"
                  onClick={handleToggleCoordination}
                  className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                    coordinationActive
                      ? 'bg-[#1E2B3E] border-[#1E2B3E] text-white shadow-xs'
                      : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#8B3A4A]'
                  }`}
                  aria-label="Seleccionar Gestión por boda - Coordinación Integral"
                >
                  {coordinationActive && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-[#2D2A26]">
                    Gestión por boda - Coordinación Integral
                  </h3>
                  <p className="text-xs text-[#7A7268] max-w-xl leading-relaxed">
                    Planificación de eventos, proveedores, cronograma y asistencia el día de la boda.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end space-y-1.5 shrink-0 pl-9 md:pl-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#F0EAE1]">
                <div className="text-xs font-semibold text-[#524B42]">
                  {formatPrice(PERSON_PRICE)} x persona
                </div>
                
                <div className="flex items-center space-x-2">
                  <label htmlFor="input-num-persons" className="text-xs text-[#7A7268] font-medium">
                    Número de Personas:
                  </label>
                  <input
                    id="input-num-persons"
                    type="number"
                    min="1"
                    max="2000"
                    value={numPersons}
                    onChange={(e) => setNumPersons(Math.max(1, parseInt(e.target.value) || 0))}
                    disabled={!coordinationActive}
                    className="w-20 px-2 py-1 text-xs text-center font-bold text-[#2D2A26] rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A] disabled:opacity-50"
                  />
                </div>

                <div className="text-xs font-bold text-[#2D2A26]">
                  Total Servicio: <span className="text-sm font-extrabold">{formatPrice(coordinationTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item 3: Número de Invitados Confirmados */}
          <div 
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
              !coordinationActive
                ? 'border-[#E8DCCF] opacity-50 bg-[#FAF8F5]'
                : confirmedGuestsActive 
                  ? 'border-[#8B3A4A]/40 ring-1 ring-[#8B3A4A]/10' 
                  : 'border-[#E8DCCF] opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5 flex-1">
                <button
                  type="button"
                  onClick={handleToggleConfirmedGuests}
                  disabled={!coordinationActive}
                  className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                    !coordinationActive
                      ? 'border-[#D9CEBF] bg-[#EFEBE6] text-[#A0988E] cursor-not-allowed'
                      : confirmedGuestsActive
                        ? 'bg-[#1E2B3E] border-[#1E2B3E] text-white shadow-xs cursor-pointer'
                        : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#8B3A4A] cursor-pointer'
                  }`}
                  aria-label="Seleccionar Número de Invitados Confirmados"
                >
                  {coordinationActive && confirmedGuestsActive && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-[#2D2A26]">
                      Número de Invitados Confirmados
                    </h3>
                    {!coordinationActive && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#EFEAE3] text-[#7A7268] text-[10px] font-semibold">
                        <Info className="w-3 h-3" />
                        <span>Requiere Gestión de Boda</span>
                      </span>
                    )}
                  </div>
                  {/* Updated Description per USER_REQUEST */}
                  <p className="text-xs text-[#7A7268] max-w-xl leading-relaxed">
                    Herramienta de seguimiento, confirmación de asistencia en tiempo real, gestión de mesas y cronograma.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end space-y-1.5 shrink-0 pl-9 md:pl-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#F0EAE1]">
                <div className="text-xs font-semibold text-[#524B42]">
                  {formatPrice(CONFIRMED_PRICE)} x confirmado
                </div>
                
                <div className="flex items-center space-x-2">
                  <label htmlFor="input-num-confirmed" className="text-xs text-[#7A7268] font-medium">
                    Número de Confirmados:
                  </label>
                  <input
                    id="input-num-confirmed"
                    type="number"
                    min="0"
                    max="2000"
                    value={numConfirmed}
                    onChange={(e) => setNumConfirmed(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={!coordinationActive || !confirmedGuestsActive}
                    className="w-20 px-2 py-1 text-xs text-center font-bold text-[#2D2A26] rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A] disabled:opacity-50"
                  />
                </div>

                <div className="text-xs font-bold text-[#2D2A26]">
                  Total Servicio: <span className="text-sm font-extrabold">{formatPrice(confirmedTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item 4: PACK FULL ALL INCLUSIVE (Invitación + Gestión + Confirmados) */}
          <div 
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
              packFullActive 
                ? 'border-[#8B3A4A] ring-2 ring-[#8B3A4A]/15 bg-linear-to-r from-white to-[#FAF3ED]/40' 
                : 'border-[#E8DCCF] hover:border-[#D9CEBF]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5 flex-1">
                <button
                  type="button"
                  onClick={handleTogglePackFull}
                  className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                    packFullActive
                      ? 'bg-[#1E2B3E] border-[#1E2B3E] text-white shadow-xs'
                      : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#8B3A4A]'
                  }`}
                  aria-label="Seleccionar PACK FULL ALL INCLUSIVE"
                >
                  {packFullActive && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-[#2D2A26]">
                      PACK FULL ALL INCLUSIVE (Invitación + Gestión + Confirmados)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#8B3A4A] text-white uppercase tracking-wider">
                      -15% OFF
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7268] max-w-xl leading-relaxed">
                    Obtén un 15% de DESCUENTO en el total al contratar los tres servicios anteriores.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end space-y-1 shrink-0 pl-9 md:pl-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#F0EAE1]">
                <div className="text-xs text-[#7A7268] font-mono">
                  {formatPrice(INVITATION_PRICE)} + {formatPrice(Math.max(0, numPersons) * PERSON_PRICE)} + {formatPrice(Math.max(0, numConfirmed) * CONFIRMED_PRICE)}
                </div>
                <div className="text-xs font-semibold text-emerald-700 font-mono">
                  -15%: - {formatPrice(fullPackDiscount)}
                </div>
                <div className="text-base sm:text-lg font-black text-[#2D2A26] font-mono">
                  {formatPrice(fullPackFinalPrice)}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RESUMEN DE COMPRA */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8DCCF] shadow-2xs space-y-4">
          <h3 className="text-base sm:text-lg font-bold tracking-wide text-[#2D2A26] uppercase border-b border-[#F0EAE1] pb-3">
            RESUMEN DE COMPRA
          </h3>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-[#524B42]">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-[#2D2A26]">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-[#524B42]">
              <span>Descuento Pack Full:</span>
              <span className={`font-mono font-bold ${discountAmount > 0 ? 'text-emerald-700' : 'text-[#7A7268]'}`}>
                {discountAmount > 0 ? `- ${formatPrice(discountAmount)}` : formatPrice(0)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8DCCF] text-sm sm:text-base font-extrabold text-[#2D2A26]">
              <span className="tracking-wide">TOTAL A PAGAR:</span>
              <span className="font-mono text-lg sm:text-xl text-[#2D2A26]">{formatPrice(totalToPay)}</span>
            </div>
          </div>
        </div>

        {/* MÓDULO DE PAGOS: QR 1:1, YAPE Y TRANSFERENCIA */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8DCCF] shadow-2xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#F0EAE1] pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-wide text-[#2D2A26] uppercase">
                MÉTODOS DE PAGO DISPONIBLES
              </h3>
              <p className="text-xs text-[#7A7268]">
                Realiza tu pago vía Yape o Transferencia Bancaria y adjunta el comprobante abajo.
              </p>
            </div>

            {isLevel1Admin && (
              <button
                type="button"
                onClick={() => setAdminSettingsOpen(true)}
                className="text-xs text-[#8B3A4A] hover:text-[#6E2937] font-semibold flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-[#FAF3ED] transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configurar Cuentas</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* QR Code 1:1 Display */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DCCF]">
              <div className="w-36 h-36 sm:w-40 sm:h-40 aspect-square rounded-xl bg-white p-2 border border-[#D9CEBF] shadow-xs flex items-center justify-center overflow-hidden">
                {tokensPaymentConfig.qrImageUrl ? (
                  <img 
                    src={tokensPaymentConfig.qrImageUrl} 
                    alt="Código QR de Pago" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-3 space-y-1">
                    <QrCode className="w-10 h-10 text-[#8C8276] mx-auto opacity-40" />
                    <p className="text-[10px] text-[#8C8276] font-medium">QR no configurado</p>
                    {isLevel1Admin && (
                      <button 
                        type="button" 
                        onClick={() => setAdminSettingsOpen(true)}
                        className="text-[9px] text-[#8B3A4A] font-bold underline"
                      >
                        Subir QR 1:1
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold text-[#524B42] mt-2">
                Escanea con Yape o tu App Bancaria
              </span>
            </div>

            {/* Payment Details and Quick Copy Buttons */}
            <div className="md:col-span-8 space-y-3.5">
              
              {/* Yape Quick Copy Box */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-[#7A1FA2]/10 text-[#7A1FA2] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D2A26] flex items-center space-x-1.5">
                      <span>Solo Yape:</span>
                      <span className="font-mono text-sm text-[#7A1FA2] font-black">{tokensPaymentConfig.yapePhone}</span>
                    </div>
                    <p className="text-[11px] text-[#7A7268]">Titular: {tokensPaymentConfig.yapeHolder}</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-copiar-nro-yape"
                  onClick={copyYapeNumber}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[#2D2A26] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5 text-[#7A1FA2]" />
                  <span>{copiedYape ? '¡Nro. Copiado!' : 'Copiar Nro de Yape'}</span>
                </button>
              </div>

              {/* Bank Transfer Quick Copy Box */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-[#8B3A4A]/10 text-[#8B3A4A] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#2D2A26]">{tokensPaymentConfig.bankName}</div>
                    <div className="text-[11px] text-[#524B42]">
                      Cta: <span className="font-mono font-semibold">{tokensPaymentConfig.accountNumber}</span> | CCI: <span className="font-mono font-semibold">{tokensPaymentConfig.cci}</span>
                    </div>
                    <div className="text-[10px] text-[#7A7268]">Titular: {tokensPaymentConfig.accountHolder}</div>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-copiar-datos-transferencia"
                  onClick={copyTransferData}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[#2D2A26] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5 text-[#8B3A4A]" />
                  <span>{copiedBank ? '¡Datos Copiados!' : 'Copiar datos de Transferencia'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* SUBIR CAPTURA DE PANTALLA DE PAGO */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8DCCF] shadow-2xs space-y-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold tracking-wide text-[#2D2A26] uppercase">
              SUBIR CAPTURA DE PANTALLA DE PAGO
            </h3>
            <p className="text-xs text-[#7A7268]">
              Sube tu comprobante de pago (formato .jpg o .png) para validar tu compra.
            </p>
          </div>

          {/* Upload Input Container */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border rounded-xl p-2 transition-all ${
              isDragging 
                ? 'border-[#8B3A4A] bg-[#FAF3ED]' 
                : 'border-[#D9CEBF] bg-[#FAF8F5]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
              id="payment-voucher-upload"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors cursor-pointer shadow-2xs"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#8B3A4A]" />
                  <span>Subir Imagen (JPG)</span>
                </button>

                <div className="text-xs text-[#7A7268] truncate max-w-xs">
                  {selectedFile ? (
                    <span className="font-semibold text-[#2D2A26] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0 mr-1" />
                      <span className="truncate">{selectedFile.name}</span>
                      <span className="text-[10px] text-[#8C8276]">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    </span>
                  ) : (
                    <span>Ningún archivo seleccionado</span>
                  )}
                </div>
              </div>

              {selectedFile && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-rose-50 cursor-pointer self-end sm:self-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Quitar</span>
                </button>
              )}
            </div>

            {/* Thumbnail Preview if file uploaded */}
            {filePreview && (
              <div className="mt-3 pt-3 border-t border-[#E8DCCF] flex items-center space-x-4 px-2">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#D9CEBF] bg-black/5 shrink-0">
                  <img 
                    src={filePreview} 
                    alt="Comprobante de pago" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-[#524B42] space-y-0.5">
                  <p className="font-bold text-emerald-800">✓ Comprobante listo para validación</p>
                  <p className="text-[11px] text-[#7A7268]">Se adjuntará automáticamente al confirmar la compra.</p>
                </div>
              </div>
            )}

            {fileError && (
              <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        </div>

        {/* COMPRAR AHORA Button */}
        <div className="flex flex-col items-center justify-center pt-2 space-y-4">
          <button
            type="button"
            id="btn-comprar-ahora"
            onClick={handlePurchase}
            className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-xl bg-[#1E2B3E] hover:bg-[#15202E] active:scale-98 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>COMPRAR AHORA</span>
          </button>

          <p className="text-[11px] text-[#8C8276] text-center max-w-md">
            Al hacer clic en Comprar Ahora, tus servicios y tokens serán activados y validados por el equipo de Casanovia.
          </p>
        </div>

      </div>

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
                ¡Solicitud de Compra Registrada!
              </h3>
              <p className="text-xs text-[#7A7268]">
                Código de Transacción: <span className="font-mono font-bold text-[#8B3A4A]">{orderCode}</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8DCCF] space-y-3 text-xs">
              <div className="flex justify-between font-bold text-sm border-b border-[#F0EAE1] pb-2 text-[#2D2A26]">
                <span>Total a Transferir:</span>
                <span className="font-mono text-[#8B3A4A]">{formatPrice(totalToPay)}</span>
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
                    <span>• Invitados Confirmados ({numConfirmed} personas)</span>
                    <span className="font-mono">{formatPrice(confirmedTotal)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-dashed border-[#E8DCCF]">
                    <span>• Descuento Pack Full (-15%)</span>
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

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={copyOrderDetails}
                className="w-full py-2.5 px-4 rounded-xl border border-[#D9CEBF] bg-white hover:bg-[#FAF3ED] text-[#2D2A26] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[#8B3A4A]" />
                <span>{orderCopied ? '¡Detalles Copiados!' : 'Copiar Resumen de Pedido'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderModalOpen(false);
                  if (currentUser.isAuthenticated) {
                    setActiveView('private');
                  } else {
                    setActiveView('public');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#8B3A4A] hover:bg-[#6E2937] text-white text-xs font-bold transition-colors cursor-pointer"
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
