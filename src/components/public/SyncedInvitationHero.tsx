import React, { useState, useEffect, useRef } from 'react';
import { WeddingDesignDocument, CanvasElement } from '../../WeddingCraft/types';
import { getCanvasBoxShadow } from '../../WeddingCraft/lib/canvasShadowUtils';
import { DOMElementRenderer } from '../../WeddingCraft/renderers/DOMElementRenderer';
import {
  Sparkles,
  Edit3,
  Check,
  Link2,
  Lock,
  AlertCircle,
  X
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { parseDateSafe, formatSpanishDateLong, isRsvpDeadlinePassed, formatRsvpDeadline } from '../../lib/dateUtils';
import { normalizeImageUrl } from '../../lib/imageUtils';
import { generateEventSlug } from '../../lib/slugUtils';
import { loadDocumentFonts } from '../../WeddingCraft/lib/fontLoader';

interface SyncedInvitationHeroProps {
  document: WeddingDesignDocument;
  onOpenEditor?: () => void;
  showEditTrigger?: boolean;
}

export const SyncedInvitationHero: React.FC<SyncedInvitationHeroProps> = ({
  document: doc,
  onOpenEditor,
  showEditTrigger = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [copiedButtonId, setCopiedButtonId] = useState<string | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);
  const [deadlineNotice, setDeadlineNotice] = useState<string | null>(null);

  const canvasWidth = doc.canvas?.width || 720;
  const canvasHeight = doc.canvas?.height || 980;

  // Responsive scale calculation to fit screen perfectly
  useEffect(() => {
    if (doc) {
      loadDocumentFonts(doc);
    }
  }, [doc]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const clientW = containerRef.current.clientWidth;
        const availableWidth = clientW > 0 ? clientW : Math.min(window.innerWidth - 16, canvasWidth);
        const newScale = Math.min(1, Math.max(0.05, availableWidth / canvasWidth));
        setScale(newScale);
      }
    };

    updateScale();
    const ro = new ResizeObserver(() => {
      updateScale();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [canvasWidth]);

  const page = doc.pages?.[0];
  const elements = page ? [...page.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)) : [];

  console.log('[SyncedInvitationHero] Rendering design:', {
    eventId: doc.parentEventId,
    elementsCount: elements.length,
    elements: elements.map(el => ({ id: el.id, type: el.type, visible: el.visible }))
  });

  const { openRsvpModal, currentUser, activeWedding, activeWeddingId, setShowAuthModal, settings, weddings } = useWedding();

  const coupleNamesArr: [string, string] = activeWedding?.coupleNames?.includes(' & ')
    ? (activeWedding.coupleNames.split(' & ') as [string, string])
    : settings?.coupleNames?.includes(' & ')
    ? (settings.coupleNames.split(' & ') as [string, string])
    : [settings?.groomName || 'Novio', settings?.brideName || 'Novia'];

  // Link venueName strictly to receptionVenue (Nombre del Salón / Hacienda de la Sede de la Recepción & Fiesta)
  const curWed = activeWedding || weddings.find(w => w.id === activeWeddingId);
  const receptionVenue = settings?.receptionVenue || curWed?.settings?.receptionVenue || (activeWedding as any)?.receptionVenue;
  const ceremonyVenue = settings?.ceremonyVenue || curWed?.settings?.ceremonyVenue || (activeWedding as any)?.ceremonyVenue;
  const receptionVenueName = receptionVenue?.name?.trim() || '';
  const ceremonyVenueName = ceremonyVenue?.name?.trim() || '';
  const resolvedVenueName = receptionVenueName || ceremonyVenueName || 'Fundo Paraíso';

  const eventData = {
    coupleNames: coupleNamesArr,
    eventDate: settings?.weddingDate || activeWedding?.weddingDate || new Date().toISOString(),
    venueName: resolvedVenueName,
    receptionVenue: receptionVenue,
    ceremonyVenue: ceremonyVenue,
    romanticQuote: settings?.romanticQuote || (activeWedding as any)?.romanticQuote || ''
  };

  // Floating Copy Link Button is strictly visible ONLY to Administrator (Level 1) and Wedding Planner (Level 3)
  const isAuthorizedToCopyLink = Boolean(
    currentUser?.isAuthenticated && (currentUser.level === 1 || currentUser.level === 3)
  );

  const handleCopyInvitationLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curWed = activeWedding || weddings.find(w => w.id === activeWeddingId);
    
    // Determine accurate canonical slug
    let targetSlug = '0919-juanyjuana';
    if (doc?.parentEventId && !doc.parentEventId.startsWith('boda-')) {
      targetSlug = doc.parentEventId;
    } else if (curWed?.id && !curWed.id.startsWith('boda-')) {
      targetSlug = curWed.id;
    } else if (activeWeddingId && !activeWeddingId.startsWith('boda-')) {
      targetSlug = activeWeddingId;
    } else if (curWed?.coupleNames) {
      targetSlug = generateEventSlug(curWed.coupleNames, curWed.weddingDate || curWed.settings?.weddingDate, weddings, curWed.id);
    }

    const linkToCopy = `https://www.casanovia.pe/?boda=${encodeURIComponent(targetSlug)}`;
    
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 3000);
    }).catch(() => {
      // Fallback
      const input = document.createElement('input');
      input.value = linkToCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 3000);
    });
  };

  const handleButtonClick = (el: CanvasElement) => {
    const content = el.content || {};
    const actionType = content.actionType;
    const linkUrl = content.linkUrl || '';
    const buttonText = (content.text || '').toLowerCase();

    // Open RSVP Full-Screen Modal if button is for RSVP confirmation
    if (
      actionType === 'rsvp' || 
      linkUrl === '#rsvp-section' || 
      buttonText.includes('confirmar') || 
      buttonText.includes('rsvp')
    ) {
      if (isRsvpDeadlinePassed(settings?.rsvpDeadline)) {
        const formattedDeadline = formatRsvpDeadline(settings?.rsvpDeadline, settings?.weddingDate);
        setDeadlineNotice(`El plazo para confirmar asistencia finalizó el ${formattedDeadline}.`);
        setTimeout(() => setDeadlineNotice(null), 6000);
        return;
      }
      openRsvpModal();
      return;
    }

    if (actionType === 'scroll-to-section' || (linkUrl && linkUrl.startsWith('#'))) {
      const targetId = linkUrl.replace('#', '');
      const targetEl = window.document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (linkUrl.startsWith('#')) {
        window.location.hash = linkUrl;
      }
    } else if (actionType === 'copy-link') {
      const textToCopy = linkUrl || window.location.href;
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedButtonId(el.id);
        setTimeout(() => setCopiedButtonId(null), 2500);
      });
    } else if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section 
      className="relative overflow-hidden pt-0 pb-12 sm:pb-16 transition-colors duration-300"
      style={{ backgroundColor: doc.canvas?.webBackgroundColor || 'transparent' }}
    >
      {/* Optional Top Floating Customizer Pill for Admin */}
      {showEditTrigger && onOpenEditor && (
        <div 
          className="w-full mx-auto px-4 pt-3 mb-3 flex items-center justify-end"
          style={{ maxWidth: `${canvasWidth}px` }}
        >
          <button
            id="btn-edit-visual-invitation"
            onClick={onOpenEditor}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#EBEBEB] text-xs font-semibold text-[#2D3748] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Personalizar en Editor</span>
          </button>
        </div>
      )}

      {/* Main Fluid Canvas Container matching the exact WeddingCraft design width and styling */}
      <div 
        className="w-full mx-auto px-0 sm:px-0 flex justify-center"
        style={{ maxWidth: `${canvasWidth}px` }}
      >
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden mx-auto transition-all duration-300"
          style={{
            height: `${canvasHeight * scale}px`,
            maxWidth: `${canvasWidth}px`,
            backgroundColor: doc.canvas?.backgroundColor || '#ffffff',
            backgroundImage: doc.canvas?.backgroundImage ? `url(${normalizeImageUrl(doc.canvas.backgroundImage)})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: getCanvasBoxShadow(doc.canvas),
            borderRadius: doc.canvas?.borderRadius !== undefined ? `${doc.canvas.borderRadius}px` : '0px',
            border: doc.canvas?.borderWidth ? `${doc.canvas.borderWidth}px solid ${doc.canvas.borderColor || 'rgba(0,0,0,0.08)'}` : undefined
          }}
        >
          {/* Scaled Canvas Layer */}
          <div
            className="absolute top-0 left-0"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: doc.canvas?.backgroundColor || '#ffffff',
              backgroundImage: doc.canvas?.backgroundImage ? `url(${normalizeImageUrl(doc.canvas.backgroundImage)})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {elements.map((el) => {
              if (el.visible === false) return null;
              return (
                <DOMElementRenderer
                  key={el.id}
                  element={el}
                  eventData={eventData}
                  onButtonClick={handleButtonClick}
                  isCopied={copiedButtonId === el.id}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Copy Link Button strictly visible ONLY to Administrator & Wedding Planner */}
      {isAuthorizedToCopyLink && (
        <aside 
          aria-label="Controles de acceso del organizador"
          className="fixed bottom-5 right-5 z-[9999] animate-fade-in"
        >
          <button
            id="btn-copy-invitation-link-floating"
            type="button"
            onClick={handleCopyInvitationLink}
            className={`group relative flex items-center gap-2.5 px-4 py-3 bg-[#EBEBEB] text-gray-800 rounded-2xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border border-white/80 transition-all duration-300 cursor-pointer ${
              isLinkCopied ? 'ring-2 ring-emerald-500/50' : ''
            }`}
            title="Copiar enlace directo a esta invitación web para compartir con los invitados"
          >
            <div className={`w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center transition-colors ${
              isLinkCopied ? 'text-emerald-600' : 'text-[#D4AF37]'
            }`}>
              {isLinkCopied ? (
                <Check className="w-4 h-4 text-emerald-600 animate-scale-up" />
              ) : (
                <Link2 className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              )}
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold transition-colors ${
                  isLinkCopied ? 'text-emerald-700' : 'text-gray-900'
                }`}>
                  {isLinkCopied ? '¡Enlace Copiado!' : 'Copiar Link Invitación'}
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-200/70 text-amber-900 border border-amber-300 shadow-xs">
                  {currentUser?.level === 1 ? 'ADMIN' : 'PLANNER'}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium truncate max-w-[170px]">
                {curWed?.coupleNames || activeWedding?.coupleNames || 'Invitación Web Activa'}
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* Floating discreet admin login button for non-authenticated administrators */}
      {!currentUser?.isAuthenticated && (
        <aside 
          aria-label="Acceso de organizador"
          className="fixed bottom-4 right-4 z-[9999] opacity-30 hover:opacity-100 transition-opacity duration-300"
        >
          <button
            type="button"
            id="btn-admin-floating-login"
            onClick={() => setShowAuthModal(true)}
            className="w-8 h-8 rounded-full bg-[#EBEBEB] text-gray-500 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center cursor-pointer transition-all border border-white/60"
            title="Acceso de Administrador / Organizador"
          >
            <Lock className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </aside>
      )}

      {/* RSVP Deadline Passed Notification Toast (Neumorphic) */}
      {deadlineNotice && (
        <div 
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] max-w-md w-[92%] sm:w-auto px-5 py-4 rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-white/80 flex items-center space-x-3.5 transition-all duration-300"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center shrink-0 text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-gray-900 leading-tight">Plazo de Confirmación Cerrado</p>
            <p className="text-gray-600 text-[11px] mt-0.5">{deadlineNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setDeadlineNotice(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
            title="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};
