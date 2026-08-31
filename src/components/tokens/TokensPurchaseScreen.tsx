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
  Mail,
  Shield,
  Crown,
  Gem,
  Cloud,
  Loader2
} from 'lucide-react';
import { TokensAdminSettingsModal } from './TokensAdminSettingsModal';
import { uploadImageToCloudStorage } from '../../lib/storageUtils';

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
    badgeColor: 'bg-rose-50 text-[#2D3748] border-rose-200',
    iconBg: 'bg-[#FAF3ED] border-transparent',
    iconColor: 'text-[#2D3748]'
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
  const { isLevel1Admin, tokensPaymentConfig, currentUser, saveUploadedImage } = useWedding();

  // Selection state for the 4 plans
  // Plan 1 is independent.
  // Plans 2, 3 and 4 are mutually exclusive (only one can be chosen at a time).
  const [selectedPlans, setSelectedPlans] = useState<{ [id: string]: boolean }>({
    'invitacion-lujo': true,
    'pack-silver': false,
    'pack-gold': false,
    'pack-platinum': false
  });

  // Payment upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploadingVoucher, setIsUploadingVoucher] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [voucherCloudUrl, setVoucherCloudUrl] = useState<string | null>(null);
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

  // Calculations
  const formatPrice = (val: number) => `S/ ${val.toFixed(2)}`;

  const activePlansList = PRICING_PLANS.filter(p => selectedPlans[p.id]);
  const activeItemsCount = activePlansList.length;

  const totalToPay = PRICING_PLANS.reduce((acc, plan) => {
    if (selectedPlans[plan.id]) {
      return acc + plan.price;
    }
    return acc;
  }, 0);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
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

    // Auto upload to Cloud Storage & save record in Firestore for Admin review
    setIsUploadingVoucher(true);
    setUploadProgressText('Procesando imagen...');
    try {
      const uploadRes = await uploadImageToCloudStorage(file, 'vouchers', (status) => {
        setUploadProgressText(status);
      });
      setVoucherCloudUrl(uploadRes.url);

      const code = orderCode || `PRE-${Math.floor(100000 + Math.random() * 900000)}`;
      if (!orderCode) setOrderCode(code);

      const plansSummary = activePlansList.map(p => p.name).join(', ');

      await saveUploadedImage({
        url: uploadRes.url,
        name: file.name,
        size: file.size,
        type: file.type,
        category: 'voucher',
        uploadedBy: {
          userId: currentUser.id,
          username: currentUser.isAuthenticated ? currentUser.username : 'Visitante Público',
          isVisitor: !currentUser.isAuthenticated,
          roleTitle: currentUser.roleTitle,
        },
        orderCode: code,
        orderTotal: totalToPay,
        selectedPlansSummary: plansSummary,
      });

      setUploadProgressText('¡Comprobante guardado en la nube!');
    } catch (uploadErr) {
      console.warn('Error al subir comprobante:', uploadErr);
      setFileError('Hubo un inconveniente al conectar con la nube, pero se conservó la imagen localmente.');
    } finally {
      setIsUploadingVoucher(false);
    }
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
    setVoucherCloudUrl(null);
    setFileError(null);
    setUploadProgressText('');
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
      alert('Por favor selecciona al menos una opción o pack para proceder con la compra.');
      return;
    }

    const generatedCode = orderCode || `PRE-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(generatedCode);
    setOrderModalOpen(true);
  };

  const copyOrderDetails = () => {
    const summary = `*PEDIDO PLANES & PRECIOS* - Código: ${orderCode}\n` +
      `• Total a Pagar: ${formatPrice(totalToPay)}\n` +
      `• Opciones Seleccionadas:\n` +
      activePlansList.map(p => `  - ${p.name}: ${formatPrice(p.price)}`).join('\n');

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
    <div className="min-h-screen bg-[#EBEBEB] text-[#2D2A26] selection:bg-[#E5B869]/30 selection:text-[#2D2A26]">
      
      {/* Top Bar with Admin Controls */}
      {isLevel1Admin && (
        <div className="bg-[#EBEBEB] border-b border-transparent px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF3ED] text-[#2D3748] text-[11px] font-bold border border-transparent">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Modo Administrador</span>
              </span>
            </div>

            <button
              type="button"
              id="btn-admin-config-precios-payment"
              onClick={() => setAdminSettingsOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#2A1810] hover:bg-[#1E110B] text-[#2D3748] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>Editar Datos de Pago & QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Centered Logo & Header */}
      <header className="pt-8 pb-10 px-4 text-center flex flex-col items-center">
        {/* Neumorphic Heart Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-center justify-center mb-6">
            <svg 
              className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        </div>
        <h1 className="font-serif-display text-3xl sm:text-[2.5rem] font-bold text-gray-900 mb-2">
          Planes & Precios
        </h1>
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">
          Gestión Nupcial Digital
        </p>
      </header>

      {/* Main 2-Column Content Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Items Table / List): lg:col-span-8 */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Table Header Bar (Neumorphic Inset) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-bold uppercase tracking-wider shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] items-center">
              <div className="col-span-9 sm:col-span-10">Servicio / Pack</div>
              <div className="col-span-3 sm:col-span-2 text-right">Precio</div>
            </div>

            {/* List of 4 Pricing Options */}
            <div className="space-y-6">
              {PRICING_PLANS.map((plan) => {
                const isSelected = selectedPlans[plan.id];
                return (
                  <div 
                    key={plan.id}
                    onClick={() => togglePlanSelection(plan.id)}
                    className={`bg-[#EBEBEB] rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'shadow-[inset_8px_8px_16px_#d1d1d1,inset_-8px_-8px_16px_#ffffff]'
                        : 'shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff]'
                    }`}
                  >
                    {/* Radio / Selection Circle */}
                    <div className="shrink-0 pt-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]'
                          : 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="shrink-0 pt-1">
                      <div className="w-12 h-12 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center text-gray-700">
                        {renderPlanIcon(plan)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                        {plan.badge && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] ${plan.badgeColor}`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 pr-4">{plan.shortDesc}</p>
                      
                      <ul className="space-y-2">
                        {plan.items.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2 text-xs text-gray-500">
                            <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 sm:pl-4 sm:border-l border-transparent flex flex-col justify-start">
                      <div className="text-lg font-bold text-gray-900 font-mono tracking-tight whitespace-nowrap mt-4 sm:mt-0">
                        S/ {plan.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

                    {/* Right Column: Resumen del Pedido & Checkout (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Order Summary Card */}
            <div className="bg-[#EBEBEB] rounded-2xl border border-transparent p-6 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] space-y-4">
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
                        <span className="truncate max-w-[180px]">• {plan.name}</span>
                        <span className="font-mono font-semibold">{formatPrice(plan.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-transparent text-sm sm:text-base font-extrabold text-[#2A1810]">
                  <span>Total</span>
                  <span className="font-mono text-xl text-[#2A1810]">{formatPrice(totalToPay)}</span>
                </div>
              </div>

              {/* Proceed to Checkout / Proceder al Pago */}
              <button
                type="button"
                id="btn-proceder-pago"
                onClick={handlePurchase}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#2A1810] hover:bg-[#1A0E0A] active:scale-98 text-[#2D3748] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] cursor-pointer flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#E5B869]" />
                <span>Proceder al Pago</span>
              </button>
            </div>

            {/* Payment Details & Quick Copy (Yape & Transferencia) */}
            <div className="bg-[#EBEBEB] rounded-2xl border border-transparent p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A1810]">
                  Datos de Pago
                </h3>
                {isLevel1Admin && (
                  <button
                    type="button"
                    onClick={() => setAdminSettingsOpen(true)}
                    className="text-[11px] text-[#2D3748] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Configurar</span>
                  </button>
                )}
              </div>

              {/* QR Image 1:1 Display */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#FAF8F5] border border-transparent">
                <div className="w-32 h-32 aspect-square rounded-xl bg-[#EBEBEB] p-1.5 border border-[#D9CEBF] shadow-xs flex items-center justify-center overflow-hidden">
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
            <div className="bg-[#EBEBEB] rounded-2xl border border-transparent p-5 shadow-2xs space-y-3">
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
                  disabled={isUploadingVoucher}
                  className="w-full py-2 px-3 rounded-lg bg-[#EBEBEB] hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs disabled:opacity-50"
                >
                  {isUploadingVoucher ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#E5B869] animate-spin" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5 text-[#E5B869]" />
                  )}
                  <span>{isUploadingVoucher ? (uploadProgressText || 'Subiendo...') : (selectedFile ? 'Cambiar Imagen (JPG / PNG)' : 'Subir Imagen (JPG / PNG)')}</span>
                </button>

                {selectedFile && (
                  <div className="mt-2 text-[11px] text-[#2A1810] flex items-center justify-between bg-[#EBEBEB] p-2 rounded-lg border border-emerald-200">
                    <span className="truncate flex items-center text-emerald-800 font-medium max-w-[240px]">
                      {isUploadingVoucher ? (
                        <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin mr-1 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                      )}
                      <span className="truncate">{selectedFile.name}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      {voucherCloudUrl && !isUploadingVoucher && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          Nube OK
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="Eliminar comprobante"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
          <div className="bg-[#EBEBEB] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-transparent space-y-6 relative">
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

            <div className="bg-[#EBEBEB] rounded-2xl p-4 border border-transparent space-y-3 text-xs">
              <div className="flex justify-between font-bold text-sm border-b border-[#F0EAE1] pb-2 text-[#2D2A26]">
                <span>Total a Transferir:</span>
                <span className="font-mono text-[#2A1810] font-extrabold">{formatPrice(totalToPay)}</span>
              </div>

              <div className="space-y-1.5 text-[#524B42]">
                <p className="font-semibold text-[#2D2A26]">Detalle de Opciones:</p>
                {activePlansList.map(plan => (
                  <div key={plan.id} className="flex justify-between">
                    <span>• {plan.name}</span>
                    <span className="font-mono">{formatPrice(plan.price)}</span>
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
            <div className="bg-[#EBEBEB] rounded-2xl border border-transparent p-4 shadow-2xs space-y-2.5">
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
                  disabled={isUploadingVoucher}
                  className="w-full py-2 px-3 rounded-lg bg-[#EBEBEB] hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs disabled:opacity-50"
                >
                  {isUploadingVoucher ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#E5B869] animate-spin" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5 text-[#E5B869]" />
                  )}
                  <span>{isUploadingVoucher ? (uploadProgressText || 'Subiendo...') : (selectedFile ? 'Cambiar Imagen (JPG / PNG)' : 'Subir Imagen (JPG / PNG)')}</span>
                </button>

                {selectedFile && (
                  <div className="mt-2 text-[11px] text-[#2A1810] flex items-center justify-between bg-[#EBEBEB] p-2 rounded-lg border border-emerald-200">
                    <span className="truncate flex items-center text-emerald-800 font-medium max-w-[240px]">
                      {isUploadingVoucher ? (
                        <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin mr-1 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                      )}
                      <span className="truncate">{selectedFile.name}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      {voucherCloudUrl && !isUploadingVoucher && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          Nube OK
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="Eliminar comprobante"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                className="w-full py-2.5 px-4 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] hover:bg-[#FAF3ED] text-[#2D2A26] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[#2A1810]" />
                <span>{orderCopied ? '¡Detalles Copiados!' : 'Copiar Resumen de Pedido'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2A1810] hover:bg-[#1A0E0A] text-[#2D3748] text-xs font-bold transition-colors cursor-pointer"
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
