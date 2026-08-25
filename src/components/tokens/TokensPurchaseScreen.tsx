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
  Shield,
  Crown,
  Gem,
  Plus,
  Minus,
  Share2,
  CheckCheck
} from 'lucide-react';
import { TokensAdminSettingsModal } from './TokensAdminSettingsModal';

interface PricingPlan {
  id: string;
  number: string;
  name: string;
  shortDesc: string;
  items: string[];
  price: number;
  badge?: string;
  badgeColor?: string;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'invitacion-lujo',
    number: '1',
    name: 'Invitación de Lujo',
    shortDesc: 'Diseño personalizado, con sistema de confirmaciones, ubicaciones GPS, codigo de vestimenta, paleta de colores, etc.',
    items: [
      'Diseño personalizado exclusivo',
      'Sistema de confirmaciones online (RSVP)',
      'Ubicaciones GPS interactivas (Ceremonia & Recepción)',
      'Código de vestimenta & paleta de colores',
      'Mesa de regalos con transferencias bancarias',
      'Muro de mejores deseos en tiempo real'
    ],
    price: 80.0,
    badge: 'Personalizado',
    badgeColor: 'bg-rose-50 text-[#8B3A4A] border-rose-200',
    iconBg: 'bg-[#FAF3ED] border-[#E8DCCF]',
    iconColor: 'text-[#8B3A4A]'
  },
  {
    id: 'pack-silver',
    number: '2',
    name: 'Pack Silver',
    shortDesc: 'Simple, rápido y 100% autogestionable.',
    items: [
      'Simple, rápido y 100% autogestionable',
      'Hasta 50 Invitados',
      'Gestión de confirmaciones, proveedores, locaciones',
      'Quienes buscan una invitación elegante, lista al instante y fácil de editar',
      '1 Wedding Planner'
    ],
    price: 50.0,
    badge: 'Autogestionable',
    badgeColor: 'bg-stone-100 text-stone-700 border-stone-300',
    iconBg: 'bg-stone-100 border-stone-200',
    iconColor: 'text-stone-700'
  },
  {
    id: 'pack-gold',
    number: '3',
    name: 'Pack Gold',
    shortDesc: 'Mayor personalización y control de invitados + acompañantes.',
    items: [
      'Mayor personalización y control de invitados + acompañantes',
      'Hasta 100 Invitados',
      'Incluye lo de Pack Silver',
      'Gestión de asistencias y asignar pases individuales, mesas, timing, programa protocolar',
      'Wedding Planner + 1 Usuario'
    ],
    price: 110.0,
    badge: 'Más Popular',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-700',
    highlight: true
  },
  {
    id: 'pack-platinum',
    number: '4',
    name: 'Pack Platinum',
    shortDesc: 'La experiencia integral con automatización y control total.',
    items: [
      'Más de 100 invitados',
      'La experiencia integral con automatización y control total',
      'Gestión de asistencias y asignar pases individuales, mesas, timing, programa protocolar',
      'Acceso de invitados y notificaciones',
      'Recepción digital con QR y máxima interactividad'
    ],
    price: 160.0,
    badge: 'Experiencia Total',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
    iconBg: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-800'
  }
];

export const TokensPurchaseScreen: React.FC = () => {
  const { currentUser, isLevel1Admin, tokensPaymentConfig, activeWeddingId } = useWedding();

  // Selection state for the 4 plans: active status and quantity
  // Plan 1 is independent.
  // Plans 2, 3 and 4 are mutually exclusive (only one can be chosen at a time).
  const [selectedPlans, setSelectedPlans] = useState<{ [id: string]: boolean }>({
    'invitacion-lujo': true,
    'pack-silver': false,
    'pack-gold': false,
    'pack-platinum': false
  });

  const [quantities, setQuantities] = useState<{ [id: string]: number }>({
    'invitacion-lujo': 1,
    'pack-silver': 1,
    'pack-gold': 1,
    'pack-platinum': 1
  });

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
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Toggle selection for a plan
  // Plan 1 is completely independent.
  // Plans 2, 3, 4: Only ONE of them can be selected at a time.
  const togglePlanSelection = (id: string) => {
    setSelectedPlans(prev => {
      const isCurrentlySelected = !!prev[id];

      if (id === 'invitacion-lujo') {
        // Plan 1 is independent
        return {
          ...prev,
          'invitacion-lujo': !isCurrentlySelected
        };
      }

      // If clicking on pack-silver, pack-gold, or pack-platinum
      const packKeys = ['pack-silver', 'pack-gold', 'pack-platinum'];
      if (isCurrentlySelected) {
        // Uncheck it
        return {
          ...prev,
          [id]: false
        };
      } else {
        // Select this pack and unselect all other packs (2, 3, 4)
        const updated = { ...prev };
        packKeys.forEach(k => {
          updated[k] = (k === id);
        });
        return updated;
      }
    });
  };

  // Quantity changes
  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  // Calculations
  const formatPrice = (val: number) => `S/ ${val.toFixed(2)}`;

  const activePlansList = PRICING_PLANS.filter(p => selectedPlans[p.id]);
  const activeItemsCount = activePlansList.reduce((acc, p) => acc + (quantities[p.id] || 1), 0);

  const subtotal = PRICING_PLANS.reduce((acc, plan) => {
    if (selectedPlans[plan.id]) {
      return acc + plan.price * (quantities[plan.id] || 1);
    }
    return acc;
  }, 0);

  const totalToPay = subtotal;

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

  const copyPreciosLink = () => {
    try {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const bodaParam = activeWeddingId ? `?boda=${encodeURIComponent(activeWeddingId)}&page=precios` : '?page=precios';
      const fullUrl = `${origin}${pathname}${bodaParam}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // ignore
    }
  };

  // Submit Order
  const handlePurchase = () => {
    if (totalToPay <= 0) {
      alert('Por favor selecciona al menos una opción o pack para proceder con la compra.');
      return;
    }

    const generatedCode = `PRE-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(generatedCode);
    setOrderModalOpen(true);
  };

  const copyOrderDetails = () => {
    const summary = `*PEDIDO PLANES & PRECIOS* - Código: ${orderCode}\n` +
      `• Total a Pagar: ${formatPrice(totalToPay)}\n` +
      `• Opciones Seleccionadas:\n` +
      activePlansList.map(p => `  - ${p.number}.- ${p.name} (${quantities[p.id]} u.): ${formatPrice(p.price * (quantities[p.id] || 1))}`).join('\n');

    navigator.clipboard.writeText(summary);
    setOrderCopied(true);
    setTimeout(() => setOrderCopied(false), 2000);
  };

  const renderPlanIcon = (plan: PricingPlan) => {
    switch (plan.id) {
      case 'invitacion-lujo':
        return <Mail className="w-6 h-6" />;
      case 'pack-silver':
        return <Shield className="w-6 h-6" />;
      case 'pack-gold':
        return <Crown className="w-6 h-6" />;
      case 'pack-platinum':
        return <Gem className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2D2A26] selection:bg-[#E5B869]/30 selection:text-[#2D2A26]">
      
      {/* Top Bar with Admin Controls */}
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
              id="btn-admin-config-precios-payment"
              onClick={() => setAdminSettingsOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#2A1810] hover:bg-[#1E110B] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>Editar Datos de Pago & QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Centered Logo & Header */}
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

          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#2A1810]">
              Planes & Precios
            </h1>
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-[#8C8276] font-bold">
            Servicios Digitales & Coordinación Nupcial
          </p>

          {/* Share Precios Link Button */}
          <button
            type="button"
            id="btn-copiar-link-precios"
            onClick={copyPreciosLink}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#D9CEBF] text-xs font-semibold text-[#524B42] shadow-2xs transition-colors cursor-pointer"
            title="Copiar enlace directo de la página de Precios"
          >
            {copiedLink ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">¡Enlace de Precios Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#8B3A4A]" />
                <span>Copiar Enlace de Precios</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main 2-Column Content Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Items Table / List): lg:col-span-8 */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Table Header Bar (Warm Gold Bar matching Casanovia) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 rounded-xl bg-[#E5B869] text-[#2A1810] text-xs font-bold uppercase tracking-wider shadow-xs items-center">
              <div className="col-span-6">Servicio / Pack</div>
              <div className="col-span-2 text-center">Precio Unit.</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {/* List of 4 Pricing Options */}
            {PRICING_PLANS.map((plan) => {
              const isSelected = selectedPlans[plan.id];
              const qty = quantities[plan.id] || 1;
              const planSubtotal = plan.price * qty;

              return (
                <div 
                  key={plan.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs ${
                    isSelected 
                      ? 'border-[#E5B869] ring-1 ring-[#E5B869]/40 shadow-sm' 
                      : 'border-[#E8DCCF] opacity-80 hover:opacity-100 hover:border-[#D9CEBF]'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start sm:items-center">
                    
                    {/* Details Column with Checkbox & Icon */}
                    <div className="sm:col-span-6 flex items-start space-x-3.5">
                      <button
                        type="button"
                        onClick={() => togglePlanSelection(plan.id)}
                        className={`w-6 h-6 mt-1 sm:mt-0.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-[#2A1810] border-[#2A1810] text-white shadow-xs'
                            : 'border-[#D9CEBF] bg-[#FAF8F5] hover:border-[#2A1810]'
                        }`}
                        aria-label={`Seleccionar ${plan.name}`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3] text-[#E5B869]" />}
                      </button>

                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${plan.iconBg} ${plan.iconColor}`}>
                        {renderPlanIcon(plan)}
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h2 className="font-bold text-sm sm:text-base text-[#2A1810]">
                            {plan.number}.- {plan.name}
                          </h2>
                          {plan.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${plan.badgeColor || 'bg-stone-100 text-stone-700'}`}>
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#524B42] leading-snug font-medium">
                          {plan.shortDesc}
                        </p>

                        {/* Feature bullets */}
                        <div className="pt-1 space-y-1">
                          {plan.items.map((item, idx) => (
                            <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-[#7A7268] leading-tight">
                              <span className="text-[#8B3A4A] font-bold text-xs leading-none mt-0.5">•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2 text-left sm:text-center pl-9 sm:pl-0">
                      <span className="sm:hidden text-xs text-[#7A7268] mr-2">Precio:</span>
                      <span className="text-xs sm:text-sm font-bold text-[#2A1810]">
                        {formatPrice(plan.price)}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="sm:col-span-2 flex items-center justify-start sm:justify-center pl-9 sm:pl-0">
                      <div className="inline-flex items-center rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          disabled={!isSelected}
                          onClick={() => handleQuantityChange(plan.id, -1)}
                          className="p-1 sm:p-1.5 text-[#524B42] hover:bg-[#EFEAE3] active:bg-[#E2DDD5] disabled:opacity-30 cursor-pointer transition-colors"
                          title="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={qty}
                          onChange={(e) => setQuantities({ ...quantities, [plan.id]: Math.max(1, parseInt(e.target.value) || 1) })}
                          disabled={!isSelected}
                          className="w-10 sm:w-12 py-1 text-center font-bold text-xs sm:text-sm text-[#2A1810] bg-transparent focus:outline-hidden disabled:opacity-50"
                        />
                        <button
                          type="button"
                          disabled={!isSelected}
                          onClick={() => handleQuantityChange(plan.id, 1)}
                          className="p-1 sm:p-1.5 text-[#524B42] hover:bg-[#EFEAE3] active:bg-[#E2DDD5] disabled:opacity-30 cursor-pointer transition-colors"
                          title="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="sm:col-span-2 text-left sm:text-right pl-9 sm:pl-0 font-mono font-bold text-sm sm:text-base text-[#2A1810]">
                      <span className="sm:hidden text-xs font-sans text-[#7A7268] mr-2">Subtotal:</span>
                      {formatPrice(isSelected ? planSubtotal : 0)}
                    </div>

                  </div>
                </div>
              );
            })}

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
                  <span>Opciones Seleccionadas</span>
                  <span className="font-bold text-[#2A1810]">{activeItemsCount} u.</span>
                </div>

                {/* Breakdown list */}
                {activePlansList.length > 0 && (
                  <div className="py-2 border-y border-[#F0EAE1] space-y-1.5 text-xs text-[#524B42]">
                    {activePlansList.map(plan => (
                      <div key={plan.id} className="flex justify-between items-center">
                        <span className="truncate max-w-[180px]">• {plan.number}.- {plan.name} x{quantities[plan.id]}</span>
                        <span className="font-mono font-semibold">{formatPrice(plan.price * (quantities[plan.id] || 1))}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[#7A7268]">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-[#2A1810]">{formatPrice(subtotal)}</span>
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
                  <span>Subir Imagen (JPG / PNG)</span>
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
                <p className="font-semibold text-[#2D2A26]">Detalle de Opciones:</p>
                {activePlansList.map(plan => (
                  <div key={plan.id} className="flex justify-between">
                    <span>• {plan.number}.- {plan.name} ({quantities[plan.id]} u.)</span>
                    <span className="font-mono">{formatPrice(plan.price * (quantities[plan.id] || 1))}</span>
                  </div>
                ))}
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
