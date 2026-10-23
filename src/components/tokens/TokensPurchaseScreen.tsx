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
  Loader2,
  Download,
  Archive
} from 'lucide-react';
import { TokensAdminSettingsModal } from './TokensAdminSettingsModal';
import { uploadImageToCloudStorage } from '../../lib/storageUtils';

interface PricingPlan {
  id: string;
  name: string;
  category: 'novias' | 'servicios';
  price: number;
  guests: string;
  usersCount: string;
  userRoles: string;
  features: string;
  items: string[];
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'novia-free',
    name: 'Novia Free',
    category: 'novias',
    price: 0,
    guests: 'Hasta 20',
    usersCount: '',
    userRoles: 'Novia',
    features: 'Acceso gratis por 2 dias al sistema',
    items: [
      'Acceso gratis por 2 días al sistema',
      'Gestión de Invitados hasta 20 personas',
      'Confirmaciones de asistencia en línea (RSVP)',
      'Distribución de Mesas básicas'
    ],
    badge: 'Gratis',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    id: 'essential',
    name: 'Essential',
    category: 'novias',
    price: 75.0,
    guests: 'Hasta 50 invitados',
    usersCount: '',
    userRoles: 'Novia',
    features: 'Gestión de invitados, confirmaciones, mesas, planos y reportes',
    items: [
      'Gestión de Invitados hasta 50 personas',
      'Confirmaciones de asistencia en línea (RSVP)',
      'Distribución de Mesas y Asientos',
      'Diseñador de Planos de Distribución',
      'Reportes y Exportación PDF / Excel'
    ],
    badge: 'Hasta 50 invitados',
    badgeColor: 'bg-stone-200 text-stone-800 border-stone-300'
  },
  {
    id: 'premium',
    name: 'Premium',
    category: 'novias',
    price: 100.0,
    guests: 'Hasta 100 invitados',
    usersCount: '',
    userRoles: 'Novia + Novio o Planner',
    features: 'Gestión de invitados, confirmaciones, mesas, croquis, proveedores, presupuesto, cronograma y reportes',
    items: [
      'Todo lo incluido en el plan Essential',
      'Capacidad ampliada hasta 100 Invitados',
      'Novia + Novio o Planner',
      'Módulo de Proveedores y Cotizaciones',
      'Control de Presupuesto y Pagos',
      'Mapa interactivo, croquis y cronograma protocolar'
    ],
    badge: 'Más Popular',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    highlight: true
  },
  {
    id: 'luxury',
    name: 'Luxury',
    category: 'novias',
    price: 150.0,
    guests: 'Hasta 200 invitados',
    usersCount: '',
    userRoles: 'Novia + Novio + Planner',
    features: 'Sistema completo + funciones avanzadas, reportes e invitados ampliados',
    items: [
      'Sistema completo con todas las funciones avanzadas',
      'Invitados ampliados (Hasta 200 invitados)',
      'Novia + Novio + Planner',
      'Reportes gerenciales completos y análisis en tiempo real',
      'Acceso integral sin restricciones'
    ],
    badge: 'Experiencia Total',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  {
    id: 'digital-card',
    name: 'Digital Card',
    category: 'servicios',
    price: 50.0,
    guests: 'Ilimitado',
    usersCount: '',
    userRoles: 'Novia',
    features: 'Invitación Virtual en servidor privado, se obtiene confirmacion de invitados',
    items: [
      'Invitación Virtual personalizada alojada en servidor privado',
      'Invitados ilimitados con enlaces personalizados',
      'Recepción y registro de confirmaciones en tiempo real'
    ],
    badge: 'Invitación Virtual',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200'
  },
  {
    id: 'plus',
    name: 'Plus',
    category: 'servicios',
    price: 50.0,
    guests: '-',
    usersCount: '',
    userRoles: '-',
    features: '+ 50 invitados, Sistema QR para registro de accesos en puerta, invitados y proveedores.',
    items: [
      '+ 50 invitados',
      'Sistema QR para registro de accesos en puerta, invitados y proveedores',
      'Registro de acceso en tiempo real para invitados',
      'Control y validación de entrada de proveedores'
    ],
    badge: 'Control de Acceso QR',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-200'
  }
];

export const TokensPurchaseScreen: React.FC = () => {
  const { isLevel1Admin, tokensPaymentConfig, currentUser, saveUploadedImage } = useWedding();

  // Selection state for plans
  // Main plans ('novia-free', 'essential', 'premium', 'luxury') are mutually exclusive.
  // Addons/Services ('digital-card', 'plus') can be added independently.
  const [selectedPlans, setSelectedPlans] = useState<{ [id: string]: boolean }>({
    'novia-free': false,
    'essential': true,
    'premium': false,
    'luxury': false,
    'digital-card': false,
    'plus': false
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
  const togglePlanSelection = (id: string) => {
    setSelectedPlans(prev => {
      const isCurrentlySelected = !!prev[id];
      const mainPlanKeys = ['novia-free', 'essential', 'premium', 'luxury'];

      if (mainPlanKeys.includes(id)) {
        if (isCurrentlySelected) {
          // Uncheck it
          return {
            ...prev,
            [id]: false
          };
        } else {
          // Select this main plan and unselect the other main plans
          const updated = { ...prev };
          mainPlanKeys.forEach(k => {
            updated[k] = (k === id);
          });
          return updated;
        }
      }

      // Addons ('digital-card', 'plus') toggle independently
      return {
        ...prev,
        [id]: !isCurrentlySelected
      };
    });
  };

  // Calculations
  const formatPrice = (val: number) => val === 0 ? 'Gratis' : `S/ ${val.toFixed(2)}`;

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
    // If Novia Free is selected, redirect directly to WhatsApp
    if (selectedPlans['novia-free']) {
      window.location.href = 'http://wa.me/952341165?text=Deseo%20inscribirme%20al%20plan%20Novia%20Free.%20Mi%20nombre%20es';
      return;
    }

    if (totalToPay <= 0) {
      alert('Por favor selecciona al menos un plan o servicio para proceder con el pago.');
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
      case 'novia-free':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'essential':
        return <Shield className="w-5 h-5 text-stone-700" />;
      case 'premium':
        return <Crown className="w-5 h-5 text-amber-700" />;
      case 'luxury':
        return <Gem className="w-5 h-5 text-purple-700" />;
      case 'digital-card':
        return <Mail className="w-5 h-5 text-rose-700" />;
      case 'plus':
        return <QrCode className="w-5 h-5 text-teal-700" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-700" />;
    }
  };

  const [isDownloadingPackage, setIsDownloadingPackage] = useState<boolean>(false);

  const handleDownloadTarGz = async () => {
    setIsDownloadingPackage(true);
    try {
      const response = await fetch('/Actualizacion_Reciente.tar.gz');
      if (!response.ok) throw new Error('File not found');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Actualizacion_Reciente.tar.gz';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Fallback direct download:', err);
      window.location.href = '/Actualizacion_Reciente.tar.gz';
    } finally {
      setIsDownloadingPackage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB] text-[#2D2A26] selection:bg-[#E5B869]/30 selection:text-[#2D2A26]">
      
      {/* Top Bar with Admin Controls */}
      {isLevel1Admin && (
        <div className="bg-[#EBEBEB] border-b border-gray-300/60 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF3ED] text-[#2D3748] text-[11px] font-bold border border-transparent shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Modo Administrador</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                id="btn-admin-config-precios-payment"
                onClick={() => setAdminSettingsOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-amber-600" />
                <span>Editar Datos de Pago & QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Logo & Header */}
      <header className="pt-3 pb-2 sm:pt-8 sm:pb-8 px-4 text-center flex flex-col items-center">
        {/* Neumorphic Heart Icon */}
        <div className="w-8 h-8 sm:w-20 sm:h-20 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] sm:shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-center justify-center mb-1.5 sm:mb-4">
          <svg 
            className="w-4 h-4 sm:w-10 sm:h-10 text-rose-600" 
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
        <h1 className="font-serif-display text-xl sm:text-4xl font-bold text-gray-900 mb-0.5 sm:mb-2">
          Planes & Precios
        </h1>
        <p className="text-[9px] sm:text-xs font-bold tracking-wider sm:tracking-[0.25em] text-gray-500 uppercase">
          Tarifario Oficial Casanovia
        </p>
      </header>

      {/* Main Layout: Table / Plans list on the Left, Summary & Checkout on the Right */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pb-10 sm:pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-8 items-start">
          
          {/* Left Column (Planes & Precios Table): xl:col-span-8 */}
          <div className="xl:col-span-8 space-y-3 sm:space-y-6">
            
            {/* Table Container Card (Neumorphic) */}
            <div className="bg-[#EBEBEB] rounded-2xl sm:rounded-[2.5rem] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] sm:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-2.5 sm:p-6 overflow-hidden space-y-2 sm:space-y-4">
              
              {/* Table Header Row with Rose Banner */}
              <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-[#F2D6D6] text-gray-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] border border-[#E8C2C2]">
                <div className="grid grid-cols-12 gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-3 text-[11px] sm:text-xs font-bold tracking-wider uppercase items-center">
                  <div className="col-span-9 sm:col-span-3 font-extrabold text-[#7A1E32] flex items-center space-x-1.5">
                    <span>PACKS</span>
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-right sm:text-center">Precio (S/.)</div>
                  <div className="hidden sm:block sm:col-span-2 text-center">Invitados</div>
                  <div className="hidden sm:block sm:col-span-3 text-center">Acceden</div>
                  <div className="hidden sm:block sm:col-span-2 text-right sm:text-left">Selección</div>
                </div>
              </div>

              {/* Plans Table Items */}
              <div className="space-y-2 sm:space-y-4">
                {/* Section 1: Main Wedding Plans */}
                <div className="space-y-1.5 sm:space-y-3">
                  {PRICING_PLANS.filter(p => p.category === 'novias').map((plan) => {
                    const isSelected = !!selectedPlans[plan.id];
                    return (
                      <div
                        key={plan.id}
                        onClick={() => togglePlanSelection(plan.id)}
                        className={`rounded-xl sm:rounded-2xl p-2 sm:p-5 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#F2D6D6] shadow-[inset_3px_3px_6px_rgba(180,120,120,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] sm:shadow-[inset_4px_4px_8px_rgba(180,120,120,0.25),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-[#E8C2C2]'
                            : 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] sm:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] border border-transparent'
                        }`}
                      >
                        {/* Top row with Table summary columns */}
                        <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                          
                          {/* Plan Name & Icon */}
                          <div className="col-span-9 sm:col-span-3 flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className={`hidden sm:flex w-6 h-6 rounded-full items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-[#F2D6D6] shadow-[inset_2px_2px_4px_rgba(180,120,120,0.35),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border border-[#E8C2C2]'
                                : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]'
                            }`}>
                              {isSelected ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#7A1E32]" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-transparent" />
                              )}
                            </div>
                            
                            {/* Icon */}
                            <div className={`w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5 transition-all ${
                              isSelected
                                ? 'bg-[#F2D6D6] shadow-[inset_2px_2px_4px_rgba(180,120,120,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border border-[#E8C2C2]'
                                : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]'
                            }`}>
                              {renderPlanIcon(plan)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-1">
                                <h3 className={`font-bold text-[13px] sm:text-base leading-tight ${isSelected ? 'text-[#7A1E32]' : 'text-gray-900'}`}>
                                  {plan.name}
                                </h3>
                                {plan.userRoles && plan.userRoles !== '-' && (
                                  <span className="sm:hidden font-semibold text-[10.5px] text-gray-600 leading-tight">
                                    • {plan.userRoles}
                                  </span>
                                )}
                              </div>
                              <span className="sm:hidden text-[10px] font-bold text-gray-500 block leading-tight">
                                {plan.guests}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-3 sm:col-span-2 text-right sm:text-center flex justify-end sm:justify-center items-center">
                            {plan.price === 0 ? (
                              <>
                                <span className="sm:hidden font-mono text-[13px] font-black text-emerald-700 uppercase whitespace-nowrap">
                                  Gratis
                                </span>
                                <span className="hidden sm:inline font-mono text-base font-black text-emerald-700 uppercase whitespace-nowrap">
                                  Gratis
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="sm:hidden font-mono text-[13px] font-black text-rose-700 whitespace-nowrap">
                                  S/ {Math.round(plan.price)}
                                </span>
                                <span className={`hidden sm:inline font-mono text-base font-black whitespace-nowrap ${isSelected ? 'text-[#7A1E32]' : 'text-gray-900'}`}>
                                  S/ {plan.price.toFixed(2).replace('.', ',')}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Invitados (Desktop) */}
                          <div className="hidden sm:block sm:col-span-2 text-center text-xs font-semibold text-gray-700">
                            <span className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                              isSelected
                                ? 'bg-[#F2D6D6] text-[#7A1E32] shadow-[inset_2px_2px_4px_rgba(180,120,120,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border border-[#E8C2C2]'
                                : 'bg-[#EBEBEB] text-gray-700 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                            }`}>
                              {plan.guests}
                            </span>
                          </div>

                          {/* Acceden (Desktop) */}
                          <div className={`hidden sm:block sm:col-span-3 text-center text-[11px] font-medium ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                            {plan.userRoles}
                          </div>

                          {/* Status / Select button */}
                          <div className="hidden sm:flex sm:col-span-2 justify-end">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all ${
                              isSelected 
                                ? 'bg-[#7A1E32] text-white shadow-[2px_2px_4px_rgba(122,30,50,0.25)] border border-[#7A1E32]'
                                : 'bg-[#EBEBEB] text-gray-500 shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]'
                            }`}>
                              {isSelected ? 'Seleccionado' : 'Elegir'}
                            </span>
                          </div>
                        </div>

                        {/* Features Description row matching table specifications */}
                        <div className={`mt-1 sm:mt-3 pt-1 sm:pt-3 sm:border-t flex items-center justify-between gap-1 ${isSelected ? 'border-[#E8C2C2]' : 'border-gray-300/50'}`}>
                          <div className={`text-[10.5px] sm:text-xs flex items-center space-x-1.5 truncate ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-medium">{plan.features}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Separation Line between Novias Plans and Digital Services / Add-ons */}
                <div className="relative py-1 sm:py-2 flex items-center justify-center">
                  <div className="w-full border-t border-dashed border-gray-400/60" />
                  <span className="absolute bg-[#EBEBEB] px-3 sm:px-4 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Servicios & Complementos
                  </span>
                </div>

                {/* Section 2: Services & Add-ons (Digital Card & Plus) */}
                <div className="space-y-1.5 sm:space-y-3">
                  {PRICING_PLANS.filter(p => p.category === 'servicios').map((plan) => {
                    const isSelected = !!selectedPlans[plan.id];
                    return (
                      <div
                        key={plan.id}
                        onClick={() => togglePlanSelection(plan.id)}
                        className={`rounded-xl sm:rounded-2xl p-2 sm:p-5 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#F2D6D6] shadow-[inset_3px_3px_6px_rgba(180,120,120,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] sm:shadow-[inset_4px_4px_8px_rgba(180,120,120,0.25),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-[#E8C2C2]'
                            : 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] sm:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] border border-transparent'
                        }`}
                      >
                        {/* Top row */}
                        <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                          
                          {/* Plan Name & Icon */}
                          <div className="col-span-9 sm:col-span-3 flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className={`hidden sm:flex w-6 h-6 rounded-md items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-[#F2D6D6] shadow-[inset_2px_2px_4px_rgba(180,120,120,0.35),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border border-[#E8C2C2]'
                                : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#7A1E32] stroke-[3]" />}
                            </div>

                            {/* Icon */}
                            <div className={`w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5 transition-all ${
                              isSelected
                                ? 'bg-[#F2D6D6] shadow-[inset_2px_2px_4px_rgba(180,120,120,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border border-[#E8C2C2]'
                                : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]'
                            }`}>
                              {renderPlanIcon(plan)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-1">
                                <h3 className={`font-bold text-[13px] sm:text-base leading-tight ${isSelected ? 'text-[#7A1E32]' : 'text-gray-900'}`}>
                                  {plan.name}
                                </h3>
                                {plan.userRoles && plan.userRoles !== '-' && (
                                  <span className="sm:hidden font-semibold text-[10.5px] text-gray-600 leading-tight">
                                    • {plan.userRoles}
                                  </span>
                                )}
                              </div>
                              <span className="sm:hidden text-[10px] font-bold text-gray-500 block leading-tight">
                                {plan.guests !== '-' ? plan.guests : 'Complemento QR'}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-3 sm:col-span-2 text-right sm:text-center flex justify-end sm:justify-center items-center">
                            <span className="sm:hidden font-mono text-[13px] font-black text-rose-700 whitespace-nowrap">
                              S/ {Math.round(plan.price)}
                            </span>
                            <span className={`hidden sm:inline font-mono text-base font-black whitespace-nowrap ${isSelected ? 'text-[#7A1E32]' : 'text-gray-900'}`}>
                              S/ {plan.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>

                          {/* Invitados (Desktop) */}
                          <div className="hidden sm:block sm:col-span-2 text-center text-xs font-semibold text-gray-700">
                            {plan.guests !== '-' ? (
                              <span className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                                isSelected
                                  ? 'bg-[#F2D6D6] text-[#7A1E32] shadow-[inset_2px_2px_4px_rgba(180,120,120,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border border-[#E8C2C2]'
                                  : 'bg-[#EBEBEB] text-gray-700 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                              }`}>
                                {plan.guests}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>

                          {/* Acceden (Desktop) */}
                          <div className={`hidden sm:block sm:col-span-3 text-center text-[11px] font-medium ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                            {plan.userRoles !== '-' ? plan.userRoles : '-'}
                          </div>

                          {/* Status / Select button */}
                          <div className="hidden sm:flex sm:col-span-2 justify-end">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all ${
                              isSelected 
                                ? 'bg-[#7A1E32] text-white shadow-[2px_2px_4px_rgba(122,30,50,0.25)] border border-[#7A1E32]'
                                : 'bg-[#EBEBEB] text-gray-500 shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]'
                            }`}>
                              {isSelected ? 'Agregado' : '+ Agregar'}
                            </span>
                          </div>
                        </div>

                        {/* Features Description row */}
                        <div className={`mt-1 sm:mt-3 pt-1 sm:pt-3 sm:border-t flex items-center justify-between gap-1 ${isSelected ? 'border-[#E8C2C2]' : 'border-gray-300/50'}`}>
                          <div className={`text-[10.5px] sm:text-xs flex items-center space-x-1.5 truncate ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate font-medium">{plan.features}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Resumen del Pedido & Checkout (xl:col-span-4) */}
          <div className="xl:col-span-4 space-y-3 sm:space-y-5">
            
            {/* Order Summary Card */}
            <div className="bg-[#EBEBEB] rounded-2xl sm:rounded-[2.5rem] p-3.5 sm:p-6 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] sm:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] space-y-2.5 sm:space-y-4">
              <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-wide border-b border-gray-300/70 pb-2 sm:pb-3 flex items-center justify-between">
                <span>Resumen del Pedido</span>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700">
                  {activeItemsCount} seleccionado(s)
                </span>
              </h2>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {/* Breakdown list */}
                {activePlansList.length > 0 ? (
                  <div className="py-1 sm:py-2 space-y-1.5 sm:space-y-2 text-xs text-gray-700">
                    {activePlansList.map(plan => (
                      <div key={plan.id} className="flex justify-between items-center bg-[#EBEBEB] p-2 sm:p-2.5 rounded-xl shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]">
                        <div className="flex items-center space-x-1.5 sm:space-x-2 truncate max-w-[200px]">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shrink-0" />
                          <span className="font-bold text-gray-900 truncate text-xs">{plan.name}</span>
                        </div>
                        <span className="font-mono font-bold text-gray-900 text-xs">
                          {formatPrice(plan.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2.5 sm:py-4 text-center text-xs text-gray-500 italic bg-[#EBEBEB] rounded-xl shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]">
                    Selecciona un plan o servicio para continuar
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-300/80 text-xs sm:text-base font-extrabold text-gray-900">
                  <span>Total a Pagar</span>
                  <span className="font-mono text-lg sm:text-2xl text-rose-700 font-black">
                    {formatPrice(totalToPay)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout / Proceder al Pago */}
              <button
                type="button"
                id="btn-proceder-pago"
                onClick={handlePurchase}
                disabled={activeItemsCount === 0}
                className="w-full mt-1 sm:mt-2 py-3 sm:py-4 px-4 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#EBEBEB] text-gray-900 font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] sm:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4 text-rose-600" />
                <span>Proceder al Pago</span>
              </button>
            </div>

            {/* Payment Details & Quick Copy (Yape & Transferencia) */}
            <div className="bg-[#EBEBEB] rounded-2xl sm:rounded-[2rem] p-3.5 sm:p-5 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] sm:shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] space-y-2.5 sm:space-y-4">
              <div className="flex items-center justify-between border-b border-gray-300/70 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Medios de Pago Oficiales
                </h3>
                {isLevel1Admin && (
                  <button
                    type="button"
                    onClick={() => setAdminSettingsOpen(true)}
                    className="text-[11px] text-amber-700 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Configurar</span>
                  </button>
                )}
              </div>

              {/* QR Image 1:1 Display */}
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] sm:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
                <div className="w-24 h-24 sm:w-32 sm:h-32 aspect-square rounded-xl bg-white p-1.5 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] sm:shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center overflow-hidden">
                  {tokensPaymentConfig.qrImageUrl ? (
                    <img 
                      src={tokensPaymentConfig.qrImageUrl} 
                      alt="Código QR Oficial" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-2 space-y-1">
                      <QrCode className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 mx-auto opacity-40" />
                      <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">QR no configurado</p>
                    </div>
                  )}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 mt-1.5 sm:mt-2 uppercase tracking-wider text-center">
                  Escanea para pagar con Yape / Plin
                </span>
              </div>

              {/* Yape Button */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-gray-700">Yape / Plin:</span>
                  <span className="font-mono font-black text-purple-800">{tokensPaymentConfig.yapePhone}</span>
                </div>
                <button
                  type="button"
                  id="btn-copiar-nro-yape"
                  onClick={copyYapeNumber}
                  className="w-full py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl bg-[#EBEBEB] hover:text-purple-800 text-gray-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] sm:shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-purple-700" />
                  <span>{copiedYape ? '¡Nro. Copiado!' : 'Copiar Nro de Yape'}</span>
                </button>
              </div>

              {/* Transferencia Button */}
              <div className="space-y-1 sm:space-y-1.5 pt-1.5 sm:pt-2 border-t border-gray-300/60">
                <div className="text-xs px-1">
                  <div className="font-bold text-gray-900">{tokensPaymentConfig.bankName}</div>
                  <div className="text-[10px] sm:text-[11px] text-gray-500 truncate">Cta: {tokensPaymentConfig.accountNumber}</div>
                </div>
                <button
                  type="button"
                  id="btn-copiar-datos-transferencia"
                  onClick={copyTransferData}
                  className="w-full py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl bg-[#EBEBEB] hover:text-gray-950 text-gray-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] sm:shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-800" />
                  <span>{copiedBank ? '¡Datos Copiados!' : 'Copiar datos de Transferencia'}</span>
                </button>
              </div>
            </div>

            {/* Voucher Upload Card */}
            <div className="bg-[#EBEBEB] rounded-2xl sm:rounded-[2rem] p-3.5 sm:p-5 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] sm:shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] space-y-2 sm:space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Subir Comprobante (JPG / PNG)
              </h3>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center transition-all ${
                  isDragging 
                    ? 'bg-[#EBEBEB] shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] border border-rose-400' 
                    : 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] sm:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]'
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
                  className="w-full py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl bg-[#EBEBEB] text-xs font-bold text-gray-800 transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] sm:shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] disabled:opacity-50"
                >
                  {isUploadingVoucher ? (
                    <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>{isUploadingVoucher ? (uploadProgressText || 'Subiendo...') : (selectedFile ? 'Cambiar Imagen (JPG / PNG)' : 'Subir Imagen (JPG / PNG)')}</span>
                </button>

                {selectedFile && (
                  <div className="mt-2 text-[11px] text-gray-900 flex items-center justify-between bg-[#EBEBEB] p-2 rounded-lg shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]">
                    <span className="truncate flex items-center text-emerald-800 font-medium max-w-[180px]">
                      {isUploadingVoucher ? (
                        <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin mr-1 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                      )}
                      <span className="truncate">{selectedFile.name}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      {voucherCloudUrl && !isUploadingVoucher && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
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
                  <div className="mt-2 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] flex items-center space-x-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#EBEBEB] rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-[12px_12px_24px_#1a1a1a,-12px_-12px_24px_#333333] space-y-6 relative text-center">
            <button
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif-display text-2xl font-bold text-gray-900">
                ¡Solicitud de Pedido Generada!
              </h3>
              <p className="text-xs text-gray-500">
                Código de Transacción: <span className="font-mono font-bold text-gray-900">{orderCode}</span>
              </p>
            </div>

            <div className="bg-[#EBEBEB] rounded-2xl p-4 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-3 text-xs text-left">
              <div className="flex justify-between font-bold text-sm border-b border-gray-300/70 pb-2 text-gray-900">
                <span>Total a Transferir:</span>
                <span className="font-mono text-rose-700 font-extrabold">{formatPrice(totalToPay)}</span>
              </div>

              <div className="space-y-1.5 text-gray-700">
                <p className="font-bold text-gray-900">Detalle de Selección:</p>
                {activePlansList.map(plan => (
                  <div key={plan.id} className="flex justify-between">
                    <span>• {plan.name}</span>
                    <span className="font-mono font-semibold">{formatPrice(plan.price)}</span>
                  </div>
                ))}
              </div>

              {selectedFile && (
                <div className="pt-2 border-t border-gray-300/70 text-emerald-800 text-[11px] flex items-center space-x-1.5">
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
                className="w-full py-3 px-4 rounded-xl bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:text-gray-950 text-gray-800 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]"
              >
                <Copy className="w-4 h-4 text-gray-800" />
                <span>{orderCopied ? '¡Detalles Copiados!' : 'Copiar Resumen de Pedido'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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

