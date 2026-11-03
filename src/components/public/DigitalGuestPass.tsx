import React, { useState, useEffect, useRef } from 'react';
import { DigitalGuestPass as DigitalGuestPassType, Wedding } from '../../types';
import { 
  evaluateQrWindowStatus, 
  generateQrCodeDataUrl, 
  resolveSeatAssignmentDisplay 
} from '../../lib/digitalPassUtils';
import { subscribeToPassUpdates } from '../../services/digitalPassService';
import { 
  Heart, 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  Copy, 
  Download, 
  Share2, 
  Sparkles, 
  Lock, 
  AlertCircle,
  Armchair,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { formatSpanishDateLong } from '../../lib/dateUtils';
import html2canvas from 'html2canvas';

interface DigitalGuestPassProps {
  pass: DigitalGuestPassType;
  wedding: Wedding;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const DigitalGuestPass: React.FC<DigitalGuestPassProps> = ({
  pass: initialPass,
  wedding,
  onClose,
  showCloseButton = false,
}) => {
  const [pass, setPass] = useState<DigitalGuestPassType>(initialPass);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time changes
  useEffect(() => {
    setPass(initialPass);
    const unsubscribe = subscribeToPassUpdates(initialPass.id, (updated) => {
      setPass(updated);
    });
    return () => unsubscribe();
  }, [initialPass.id, initialPass]);

  // Evaluate conditional QR activation status
  const qrWindow = evaluateQrWindowStatus(
    wedding?.settings?.weddingDate || wedding?.weddingDate,
    wedding?.settings?.weddingTime,
    pass.validFrom,
    pass.validUntil
  );

  // Generate QR code only when active
  useEffect(() => {
    let isMounted = true;
    if (qrWindow.status === 'active' && pass.qrToken) {
      generateQrCodeDataUrl(pass.qrToken).then((url) => {
        if (isMounted) setQrDataUrl(url);
      });
    } else {
      setQrDataUrl('');
    }
    return () => {
      isMounted = false;
    };
  }, [qrWindow.status, pass.qrToken]);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pass.guestCode) return;
    navigator.clipboard.writeText(pass.guestCode).then(() => {
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2500);
    });
  };

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#EBEBEB',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `Pase-Digital-${pass.guestFullName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.warn('Error downloading digital pass image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pase de Acceso - Boda ${wedding.coupleNames}`,
          text: `Pase digital de ${pass.guestFullName}. Código de invitado: ${pass.guestCode}`,
          url: window.location.href,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyCode({ stopPropagation: () => {} } as any);
    }
  };

  const formattedDate = formatSpanishDateLong(wedding.settings?.weddingDate || wedding.weddingDate);
  const weddingTime = wedding.settings?.weddingTime || '18:00 hrs';
  
  // Venue resolution
  const venue = wedding.settings?.receptionVenue || wedding.settings?.ceremonyVenue;
  const venueName = venue?.name?.trim() || wedding.locationSummary || 'Lugar de Celebración';
  const venueAddress = venue?.address?.trim() || '';

  // Table and seat assignment: strictly check for valid assignments
  const hasAssignedTable = Boolean(
    pass.assignedTable &&
    pass.assignedTable.trim().length > 0 &&
    !pass.assignedTable.toLowerCase().includes('por asignar') &&
    pass.assignedTable.toLowerCase() !== 'pendiente'
  );

  return (
    <div className="w-full max-w-md mx-auto my-4 font-sans animate-fadeIn">
      {/* Neumorphic Virtual Pass Container */}
      <div 
        ref={cardRef}
        className="bg-[#EBEBEB] rounded-[2.5rem] p-6 sm:p-8 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-white/60 relative overflow-hidden"
      >
        {/* Subtle decorative background watermarks */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-linear-to-br from-amber-200/20 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-linear-to-tr from-gray-300/30 to-transparent blur-2xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 text-[10px] font-bold uppercase tracking-wider">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            <span>Pase Virtual de Acceso</span>
          </div>

          <div className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmado</span>
          </div>
        </div>

        {/* Wedding Identity */}
        <div className="text-center mb-6 border-b border-gray-200/60 pb-5">
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {wedding.coupleNames || 'Nuestra Boda'}
          </h2>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Celebración Oficial & Recepción</span>
            <Sparkles className="w-3 h-3 text-amber-600" />
          </p>
        </div>

        {/* Guest Information Section */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Invitado(a) Titular
            </span>
            <p className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {pass.guestFullName}
            </p>

            {/* Passes count pill */}
            <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-gray-200/50">
              <span className="text-gray-500 font-medium">Pases Confirmados:</span>
              <span className="font-bold text-gray-900 bg-[#EBEBEB] px-3 py-1 rounded-full shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]">
                {pass.confirmedPasses} {pass.confirmedPasses === 1 ? 'Pase' : 'Pases'}
              </span>
            </div>

            {/* Registered Companions (if any) */}
            {pass.companionNames && pass.companionNames.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-gray-200/50">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Acompañante(s) Registrado(s):
                </span>
                <ul className="space-y-1">
                  {pass.companionNames.map((comp, idx) => (
                    <li key={idx} className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Table & Seat Assignment (CLEAN COMPOSITION: ONLY rendered if assignment exists!) */}
          {hasAssignedTable && (
            <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center text-amber-700">
                  <Armchair className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Ubicación Asignada
                  </span>
                  <p className="text-sm font-bold text-gray-900">
                    {pass.assignedTable}
                  </p>
                </div>
              </div>
              {pass.assignedSeat && (
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Asiento
                  </span>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                    {pass.assignedSeat}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Event Logistics (Date, Time, Location) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-start space-x-2.5">
              <Calendar className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fecha</span>
                <span className="font-bold text-gray-800 leading-tight block">{formattedDate}</span>
                <span className="text-[11px] text-gray-500 font-medium">{weddingTime}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lugar</span>
                <span className="font-bold text-gray-800 leading-tight block">{venueName}</span>
                {venueAddress && (
                  <span className="text-[10px] text-gray-500 line-clamp-1">{venueAddress}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QR Section with strict conditional time activation */}
        <div className="mb-6 p-5 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-center flex flex-col items-center justify-center">
          <div className="mb-3 flex items-center justify-center space-x-2">
            <QrCode className="w-4 h-4 text-gray-600" />
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Control de Ingreso en Puerta
            </span>
          </div>

          {qrWindow.status === 'active' && qrDataUrl ? (
            /* ACTIVE QR STATE */
            <div className="animate-scaleUp flex flex-col items-center">
              <div className="p-3.5 rounded-2xl bg-white shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] border border-gray-100 flex items-center justify-center">
                <img
                  src={qrDataUrl}
                  alt={`Código QR de acceso para ${pass.guestFullName}`}
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-[11px] font-semibold text-emerald-700 mt-3 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Presenta este código en la recepción del evento</span>
              </p>
            </div>
          ) : qrWindow.status === 'upcoming' ? (
            /* UPCOMING STATE (Before wedding day) */
            <div className="py-6 px-4 text-center max-w-xs space-y-3 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-amber-700">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">
                  Código QR Programado
                </p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Tu código QR de acceso estará disponible el día de la boda
                  {qrWindow.activeFromText ? ` (${qrWindow.activeFromText})` : ''}.
                </p>
                {qrWindow.remainingDays !== undefined && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-amber-900 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
                    Faltan {qrWindow.remainingDays} {qrWindow.remainingDays === 1 ? 'día' : 'días'} para su activación
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* EXPIRED STATE (After event concluded) */
            <div className="py-6 px-4 text-center max-w-xs space-y-2 animate-fadeIn">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-700">Acceso Finalizado</p>
              <p className="text-[11px] text-gray-500">
                El período de ingreso para este evento ha concluido.
              </p>
            </div>
          )}

          {/* Pass validation status indicator */}
          {pass.usedPasses > 0 && (
            <div className="mt-3 text-[10px] font-bold text-gray-600 bg-gray-200/80 px-3 py-1 rounded-full">
              Pases utilizados: {pass.usedPasses} de {pass.confirmedPasses}
            </div>
          )}
        </div>

        {/* Recovery Code Section for Cross-Device Access */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Código de Invitado (Recuperación)
            </span>
            <span className="text-xs font-mono font-bold text-gray-900 tracking-wider">
              {pass.guestCode}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-2 rounded-xl bg-[#EBEBEB] text-gray-700 text-xs font-bold shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Copiar código de invitado para recuperarlo en otro dispositivo"
          >
            {isCopiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 text-[11px]">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[11px]">Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Card Action Buttons (Download, Share, Close) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="py-3 px-4 rounded-2xl bg-[#EBEBEB] text-gray-900 font-bold text-xs uppercase tracking-wider shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-gray-700" />
            <span>{isDownloading ? 'Guardando...' : 'Descargar'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="py-3 px-4 rounded-2xl bg-[#EBEBEB] text-gray-900 font-bold text-xs uppercase tracking-wider shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
            <span>{isShared ? '¡Listo!' : 'Compartir'}</span>
          </button>
        </div>

        {showCloseButton && onClose && (
          <div className="mt-4 pt-3 border-t border-gray-200/60 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors py-1 cursor-pointer"
            >
              Cerrar y volver a la invitación
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
