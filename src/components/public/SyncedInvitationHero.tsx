import React, { useState, useEffect, useRef } from 'react';
import { WeddingDesignDocument, CanvasElement } from '../../WeddingCraft/types';
import { 
  Sparkles, 
  Edit3, 
  Play, 
  Pause, 
  Heart, 
  Church, 
  PartyPopper, 
  Shirt, 
  MessageSquareHeart, 
  MapPin, 
  Clock, 
  Navigation, 
  Copy, 
  Check 
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';

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

  const canvasWidth = doc.canvas?.width || 720;
  const canvasHeight = doc.canvas?.height || 980;

  // Responsive scale calculation to fit screen perfectly
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

  const { openRsvpModal } = useWedding();

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
      className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 transition-colors duration-300"
      style={{ backgroundColor: doc.canvas?.webBackgroundColor || 'transparent' }}
    >
      {/* Optional Top Floating Customizer Pill for Bride/Groom or Admin */}
      {showEditTrigger && onOpenEditor && (
        <div 
          className="w-full mx-auto px-4 mb-3 flex items-center justify-between"
          style={{ maxWidth: `${canvasWidth}px` }}
        >
          <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Diseño visual sincronizado</span>
          </div>
          <button
            id="btn-edit-visual-invitation"
            onClick={onOpenEditor}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#EBEBEB] text-xs font-semibold text-[#2D3748] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer"
          >
            <Edit3 className="w-3 h-3 text-[#D4AF37]" />
            <span>Personalizar en Editor</span>
          </button>
        </div>
      )}

      {/* Main Fluid Canvas Container matching the exact WeddingCraft design width */}
      <div 
        className="w-full mx-auto px-2 sm:px-4 flex justify-center"
        style={{ maxWidth: `${canvasWidth}px` }}
      >
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden mx-auto rounded-3xl shadow-[6px_6px_16px_rgba(0,0,0,0.06),-6px_-6px_16px_rgba(255,255,255,0.7)]"
          style={{
            height: `${canvasHeight * scale}px`,
            maxWidth: `${canvasWidth}px`,
            backgroundColor: doc.canvas?.backgroundColor || '#ffffff'
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
              backgroundColor: doc.canvas?.backgroundColor || '#ffffff'
            }}
          >
            {elements.map((el) => {
              if (el.visible === false) return null;
              return (
                <ElementRenderer
                  key={el.id}
                  element={el}
                  onButtonClick={handleButtonClick}
                  isCopied={copiedButtonId === el.id}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// Individual Canvas Element Renderers
// ==========================================

interface ElementRendererProps {
  element: CanvasElement;
  onButtonClick: (el: CanvasElement) => void;
  isCopied: boolean;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, onButtonClick, isCopied }) => {
  const { transform, style = {}, type, content = {} } = element;
  const x = transform.x || 0;
  const y = transform.y || 0;
  const width = transform.width || 100;
  const height = transform.height || 40;
  const rotation = transform.rotation || 0;

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: 'top left',
    zIndex: element.zIndex || 1,
    opacity: style.opacity ?? 1,
    boxSizing: 'border-box'
  };

  // 1. TEXT ELEMENT
  if (type === 'text') {
    const textShadow = style.shadow?.enabled
      ? `${style.shadow.offsetX || 0}px ${style.shadow.offsetY || 0}px ${style.shadow.blur || 0}px ${style.shadow.color || 'rgba(0,0,0,0.3)'}`
      : undefined;

    return (
      <div
        style={{
          ...wrapperStyle,
          fontFamily: style.fontFamily ? `'${style.fontFamily}', sans-serif` : 'serif',
          fontSize: `${style.fontSize || 16}px`,
          fontWeight: style.fontWeight || 'normal',
          fontStyle: style.fontStyle || 'normal',
          color: style.color || style.fill || '#2D3748',
          textAlign: (style.align as any) || 'center',
          letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
          lineHeight: style.lineHeight || 1.25,
          textTransform: (style.textTransform as any) || 'none',
          textShadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: style.align === 'center' ? 'center' : style.align === 'right' ? 'flex-end' : 'flex-start',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      >
        {content.text || ''}
      </div>
    );
  }

  // 2. IMAGE ELEMENT
  if (type === 'image') {
    let borderRadius = '0px';
    if (style.maskId === 'circle') borderRadius = '50%';
    if (style.maskId === 'rounded') borderRadius = '20px';

    return (
      <div style={{ ...wrapperStyle, overflow: 'hidden', borderRadius }}>
        <img
          src={content.src || ''}
          alt="Visual Element"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  // 3. IMAGE FRAME
  if (type === 'image-frame') {
    const shape = content.shapeVariant || 'rectangle';
    const cornerRadius = style.cornerRadius ?? 24;
    const stroke = style.stroke || '#CBD5E1';
    const strokeWidth = style.strokeWidth ?? 1;

    let borderRadius = `${cornerRadius}px`;
    let clipPath: string | undefined = undefined;

    if (shape === 'circle' || shape === 'oval') {
      borderRadius = '50%';
    } else if (shape === 'arch') {
      borderRadius = `${width / 2}px ${width / 2}px 0 0`;
    } else if (shape === 'heart') {
      clipPath = 'polygon(50% 15%, 80% 0%, 100% 20%, 100% 50%, 50% 100%, 0% 50%, 0% 20%, 20% 0%)';
    }

    return (
      <div
        style={{
          ...wrapperStyle,
          borderRadius,
          clipPath,
          border: `${strokeWidth}px solid ${stroke}`,
          overflow: 'hidden',
          backgroundColor: style.fill || '#F1F5F9'
        }}
      >
        {content.imageSrc ? (
          <img
            src={content.imageSrc}
            alt="Frame Element"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>
    );
  }

  // 4. INTERACTIVE BUTTON
  if (type === 'interactive-button') {
    const isOutline = style.variant === 'outline';
    const bgColor = isOutline ? 'transparent' : style.backgroundColor || '#2D3748';
    const textColor = isOutline ? style.backgroundColor || '#2D3748' : style.color || '#FFFFFF';
    const border = isOutline ? `2px solid ${style.backgroundColor || '#2D3748'}` : 'none';

    // Hook standard Casanovia anchor IDs if linking to RSVP or Protocol
    const buttonId = (content.linkUrl === '#rsvp-section' || content.text?.includes('Confirmar'))
      ? 'hero-cta-rsvp'
      : (content.linkUrl === '#protocol-lookup-section' || content.text?.includes('Pase'))
      ? 'hero-cta-protocol'
      : `btn-${element.id}`;

    return (
      <button
        id={buttonId}
        type="button"
        onClick={() => onButtonClick(element)}
        style={{
          ...wrapperStyle,
          backgroundColor: bgColor,
          color: textColor,
          border,
          borderRadius: `${style.borderRadius ?? 18}px`,
          fontFamily: style.fontFamily ? `'${style.fontFamily}', sans-serif` : 'sans-serif',
          fontSize: `${style.fontSize || 15}px`,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          padding: '0 16px'
        }}
        className="hover:scale-[1.02] active:scale-[0.98]"
      >
        {isCopied ? '¡Enlace Copiado!' : (content.text || 'Botón')}
      </button>
    );
  }

  // 5. COUNTDOWN WIDGET
  if (type === 'countdown-widget') {
    return (
      <div style={wrapperStyle}>
        <SyncedCountdownWidget element={element} />
      </div>
    );
  }

  // 6. AUDIO PLAYER
  if (type === 'audio-player') {
    return (
      <div style={wrapperStyle}>
        <SyncedAudioPlayer element={element} />
      </div>
    );
  }

  // 7. SVG / SHAPE
  if (type === 'svg-shape') {
    const variant = style.variant || 'rectangle';
    const fill = style.fill || '#E2E8F0';
    const stroke = style.stroke || 'none';
    const strokeWidth = style.strokeWidth || 0;
    const cornerRadius = style.cornerRadius || 0;

    let shapeBorderRadius = `${cornerRadius}px`;
    if (variant === 'circle' || variant === 'oval') shapeBorderRadius = '50%';

    return (
      <div
        style={{
          ...wrapperStyle,
          backgroundColor: fill,
          border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : undefined,
          borderRadius: shapeBorderRadius
        }}
      />
    );
  }

  // 8. EVENT CEREMONY & RECEPTION CARDS
  if (type === 'event-ceremony-card' || type === 'event-reception-card') {
    return (
      <div style={wrapperStyle}>
        <SyncedEventCard element={element} />
      </div>
    );
  }

  // 9. DRESS CODE CARD
  if (type === 'dress-code-card') {
    return (
      <div style={wrapperStyle}>
        <SyncedDressCode element={element} />
      </div>
    );
  }

  // 10. WISHES WALL CARD
  if (type === 'wishes-wall-card') {
    return (
      <div style={wrapperStyle}>
        <SyncedWishesWall element={element} />
      </div>
    );
  }

  // 11. COUPLE QUOTE & CONTACTS CARD
  if (type === 'couple-quote-contacts-card') {
    return (
      <div style={wrapperStyle}>
        <SyncedCoupleContacts element={element} />
      </div>
    );
  }

  return null;
};

// ==========================================
// Real-Time Countdown Widget Component
// ==========================================

const SyncedCountdownWidget: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const { content = {}, style = {} } = element;
  const targetDateStr = content.targetDate || new Date(Date.now() + 60 * 86400000).toISOString();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDateStr).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const numColor = style.numberColor || '#2D3748';
  const labelColor = style.labelColor || '#718096';
  const bgColor = style.backgroundColor || '#FFFFFF';
  const borderRadius = style.borderRadius ?? 16;
  const numFont = style.numberFont ? `'${style.numberFont}', serif` : 'serif';
  const labelFont = style.labelFont ? `'${style.labelFont}', sans-serif` : 'sans-serif';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${borderRadius}px`,
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '6px 12px',
        boxSizing: 'border-box'
      }}
    >
      {[
        { val: timeLeft.days, label: 'DÍAS' },
        { val: String(timeLeft.hours).padStart(2, '0'), label: 'HORAS' },
        { val: String(timeLeft.minutes).padStart(2, '0'), label: 'MIN' },
        { val: String(timeLeft.seconds).padStart(2, '0'), label: 'SEG' }
      ].map((item, idx) => (
        <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
          <div
            style={{
              fontFamily: numFont,
              fontSize: '22px',
              fontWeight: 700,
              color: numColor,
              lineHeight: 1.1
            }}
          >
            {item.val}
          </div>
          <div
            style={{
              fontFamily: labelFont,
              fontSize: '9px',
              fontWeight: 600,
              color: labelColor,
              letterSpacing: '1px',
              marginTop: '2px'
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// Ambient Audio Player Component
// ==========================================

const SyncedAudioPlayer: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const { content = {}, style = {}, transform } = element;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const bgColor = style.backgroundColor || '#EBEBEB';
  const textColor = style.color || '#2D3748';
  const radius = style.borderRadius ?? 24;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${radius}px`,
        display: 'flex',
        alignItems: 'center',
        padding: '4px 10px',
        boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff',
        boxSizing: 'border-box'
      }}
    >
      <button
        type="button"
        onClick={togglePlay}
        style={{
          width: `${(transform.height || 44) - 10}px`,
          height: `${(transform.height || 44) - 10}px`,
          borderRadius: '50%',
          backgroundColor: textColor,
          color: bgColor,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <span
        style={{
          marginLeft: '10px',
          fontSize: '13px',
          fontWeight: 500,
          color: textColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexGrow: 1
        }}
      >
        {content.title || 'Música de Fondo'}
      </span>
      {content.src && <audio ref={audioRef} src={content.src} onEnded={() => setIsPlaying(false)} />}
    </div>
  );
};

// ==========================================
// Event Details Card (Ceremony / Reception)
// ==========================================

const SyncedEventCard: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const { content = {}, style = {}, type } = element;
  const isCeremony = type === 'event-ceremony-card';

  const [copied, setCopied] = useState(false);

  const bgColor = style.backgroundColor || '#FAF8F5';
  const borderColor = style.borderColor || '#EADDCE';
  const strokeWidth = style.strokeWidth ?? 1;
  const titleColor = style.titleColor || '#2D2A26';
  const textColor = style.color || '#524B42';
  const accentColor = style.accentColor || (isCeremony ? '#8A9A86' : '#C5A880');
  const radius = style.borderRadius ?? 20;

  const titleFontFamily = style.titleFontFamily || style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = style.fontFamily || 'sans-serif';
  const titleFontSize = style.titleFontSize || 18;
  const bodyFontSize = style.bodyFontSize || 11;
  const badgeFontSize = style.badgeFontSize || 11;
  const textAlign = (style.align || style.textAlign || 'left') as 'left' | 'center' | 'right';

  const badgeText = content.badge || (isCeremony ? 'Ceremonia Religiosa' : 'Recepción & Fiesta');
  const venueTitle = content.venueName || (isCeremony ? 'Parroquia Nuestra Señora' : 'Hacienda Villa del Sol');
  const timeText = content.time || (isCeremony ? '17:00 hrs (Puntual)' : '19:30 hrs');
  const addressText = content.address || 'Av. Principal #123, Zona Colonial';
  const googleMapsUrl = content.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueTitle + ' ' + addressText)}`;
  const wazeUrl = content.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(venueTitle + ' ' + addressText)}`;

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${venueTitle} - ${addressText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${radius}px`,
        border: `${strokeWidth}px solid ${borderColor}`,
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: textAlign,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}
    >
      <div>
        {/* Header Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            gap: '6px',
            backgroundColor: `${accentColor}25`,
            color: accentColor,
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: `${badgeFontSize}px`,
            fontFamily: bodyFontFamily,
            fontWeight: 700,
            marginBottom: '8px'
          }}
        >
          {isCeremony ? <Church className="w-3.5 h-3.5" /> : <PartyPopper className="w-3.5 h-3.5" />}
          <span>{badgeText}</span>
        </div>

        {/* Venue Title */}
        <h4
          style={{
            fontFamily: titleFontFamily,
            fontSize: `${titleFontSize}px`,
            fontWeight: 700,
            color: titleColor,
            lineHeight: 1.2,
            margin: '0 0 6px 0',
            textAlign: textAlign
          }}
        >
          {venueTitle}
        </h4>

        {/* Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            gap: '6px',
            color: accentColor,
            fontSize: `${bodyFontSize + 1}px`,
            fontFamily: bodyFontFamily,
            fontWeight: 600,
            marginBottom: '4px'
          }}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{timeText}</span>
        </div>

        {/* Address */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            gap: '6px',
            color: textColor,
            fontSize: `${bodyFontSize}px`,
            fontFamily: bodyFontFamily,
            lineHeight: 1.3
          }}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
          <span>{addressText}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '6px 8px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#2D3748',
            textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <Navigation className="w-3 h-3 text-blue-600" />
          <span>Maps</span>
        </a>

        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '6px 8px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#2D3748',
            textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <Navigation className="w-3 h-3 text-cyan-600" />
          <span>Waze</span>
        </a>

        <button
          type="button"
          onClick={handleCopyAddress}
          title="Copiar Dirección"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '6px 8px',
            fontSize: '10px',
            color: '#2D3748',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// Dress Code Section Component
// ==========================================

const SyncedDressCode: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const { content = {}, style = {} } = element;

  const bgColor = style.backgroundColor || '#FAF8F5';
  const borderColor = style.borderColor || '#EADDCE';
  const strokeWidth = style.strokeWidth ?? 1;
  const titleColor = style.titleColor || '#2D2A26';
  const textColor = style.color || '#524B42';
  const accentColor = style.accentColor || '#C5A880';
  const radius = style.borderRadius ?? 20;

  const titleFontFamily = style.titleFontFamily || style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = style.fontFamily || 'sans-serif';
  const titleFontSize = style.titleFontSize || 18;
  const bodyFontSize = style.bodyFontSize || 11;
  const badgeFontSize = style.badgeFontSize || 11;
  const textAlign = (style.align || style.textAlign || 'left') as 'left' | 'center' | 'right';

  const badgeText = content.badge || 'Código de Vestimenta';
  const styleName = content.styleName || 'Formal Rigurosa';
  const description = content.description || 'Damas: Vestido largo de gala en tonos tierra o pastel. Caballeros: Traje oscuro o smoking formal.';
  const colors: Array<{ name: string; hex: string }> = content.suggestedColors || [
    { name: 'Esmeralda', hex: '#2A4736' },
    { name: 'Salvia', hex: '#8A9A86' },
    { name: 'Champán', hex: '#D4AF37' },
    { name: 'Arena', hex: '#C5A880' },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${radius}px`,
        border: `${strokeWidth}px solid ${borderColor}`,
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: textAlign,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            gap: '6px',
            backgroundColor: `${accentColor}25`,
            color: accentColor,
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: `${badgeFontSize}px`,
            fontFamily: bodyFontFamily,
            fontWeight: 700,
            marginBottom: '8px'
          }}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>

        <h4
          style={{
            fontFamily: titleFontFamily,
            fontSize: `${titleFontSize}px`,
            fontWeight: 700,
            color: titleColor,
            lineHeight: 1.2,
            margin: '0 0 6px 0',
            textAlign: textAlign
          }}
        >
          {styleName}
        </h4>

        <p
          style={{
            fontSize: `${bodyFontSize}px`,
            fontFamily: bodyFontFamily,
            color: textColor,
            lineHeight: 1.4,
            margin: 0,
            textAlign: textAlign
          }}
        >
          {description}
        </p>
      </div>

      {/* Suggested Colors */}
      {colors.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <p
            style={{
              fontSize: '10px',
              fontFamily: bodyFontFamily,
              fontWeight: 700,
              color: '#718096',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 6px 0',
              textAlign: textAlign
            }}
          >
            Paleta Sugerida:
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            alignItems: 'center',
            justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'
          }}>
            {colors.map((c, idx) => (
              <div
                key={idx}
                title={c.name}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Wishes Wall Section Component
// ==========================================

const SyncedWishesWall: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const { content = {}, style = {} } = element;
  const { guests } = useWedding();

  const bgColor = style.backgroundColor || '#FAF8F5';
  const borderColor = style.borderColor || '#EADDCE';
  const strokeWidth = style.strokeWidth ?? 1;
  const titleColor = style.titleColor || '#2D2A26';
  const textColor = style.color || '#524B42';
  const accentColor = style.accentColor || '#C5A880';
  const radius = style.borderRadius ?? 20;

  const titleFontFamily = style.titleFontFamily || style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = style.fontFamily || 'sans-serif';
  const titleFontSize = style.titleFontSize || 18;
  const bodyFontSize = style.bodyFontSize || 11;
  const badgeFontSize = style.badgeFontSize || 11;
  const textAlign = (style.align || style.textAlign || 'left') as 'left' | 'center' | 'right';

  const badgeText = content.badge || 'Muro de los Deseos';
  const title = content.title || 'Muro de los Deseos';
  const subtitle = content.subtitle || 'Deseos y bendiciones de nuestros invitados';

  // Extract confirmed wishes from guests or fall back to template wishes
  const liveWishes = guests
    .filter(g => g.congratulationMessage && g.congratulationMessage.trim().length > 0)
    .map(g => ({
      author: g.fullName,
      message: g.congratulationMessage || ''
    }));

  const displayWishes = liveWishes.length > 0 
    ? liveWishes.slice(0, 3)
    : (content.wishes?.length > 0 ? content.wishes : [
        { author: 'Familia Ramírez', message: '¡Que su hogar siempre rebose de alegría, paz y amor incondicional!' },
        { author: 'Carlos y Sofía', message: '¡Felicitaciones en esta nueva etapa! Los queremos un montón.' }
      ]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${radius}px`,
        border: `${strokeWidth}px solid ${borderColor}`,
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: textAlign,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            gap: '6px',
            backgroundColor: `${accentColor}25`,
            color: accentColor,
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: `${badgeFontSize}px`,
            fontFamily: bodyFontFamily,
            fontWeight: 700,
            marginBottom: '6px'
          }}
        >
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>

        <h4
          style={{
            fontFamily: titleFontFamily,
            fontSize: `${titleFontSize}px`,
            fontWeight: 700,
            color: titleColor,
            lineHeight: 1.2,
            margin: '0 0 4px 0',
            textAlign: textAlign
          }}
        >
          {title}
        </h4>

        <p
          style={{
            fontSize: `${bodyFontSize}px`,
            fontFamily: bodyFontFamily,
            color: textColor,
            lineHeight: 1.3,
            margin: '0 0 10px 0',
            textAlign: textAlign
          }}
        >
          {subtitle}
        </p>

        {/* Wishes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayWishes.map((w: any, idx: number) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '8px 10px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: idx === 0 ? '#E8DCCF' : '#D1E0D7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2D3748',
                  flexShrink: 0
                }}
              >
                {w.author?.[0] || '❤️'}
              </div>
              <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#2D3748' }}>
                  {w.author}
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  "{w.message}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Couple Quote & Contacts Component
// ==========================================

const SyncedCoupleContacts: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const { content = {}, style = {} } = element;
  const bgColor = style.backgroundColor || '#FAF8F5';
  const borderColor = style.borderColor || '#EADDCE';
  const strokeWidth = style.strokeWidth ?? 1;
  const titleColor = style.titleColor || '#2D2A26';
  const textColor = style.color || '#524B42';
  const accentColor = style.accentColor || '#C5A880';
  const radius = style.borderRadius ?? 20;

  const titleFontFamily = style.titleFontFamily || style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = style.fontFamily || 'sans-serif';
  const titleFontSize = style.titleFontSize || 22;
  const bodyFontSize = style.bodyFontSize || 12;
  const badgeFontSize = style.badgeFontSize || 10;
  const textAlign = (style.align || style.textAlign || 'center') as 'left' | 'center' | 'right';

  const badgeText = content.badge || '💍 Frase, Nombres & Contactos';
  const coupleNames = content.coupleNames || 'Romina & Herly';
  const quote = content.quote || 'El amor no se mira, se siente, y aún más cuando se comparte con quienes amamos. ¡Gracias por acompañarnos!';
  const weddingDate = content.weddingDate || '15 de Noviembre de 2026';
  const contactTitle = content.contactTitle || 'Confirmación & Contactos';
  const contactPhone = content.contactPhone || '+54 9 11 1234-5678';
  const contactEmail = content.contactEmail || 'contacto@nuestraboda.com';
  const contactNote = content.contactNote || 'Por favor confirma tu asistencia lo antes posible.';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${radius}px`,
        border: `${strokeWidth}px solid ${borderColor}`,
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: textAlign,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            gap: '6px',
            backgroundColor: `${accentColor}20`,
            color: accentColor,
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: `${badgeFontSize}px`,
            fontFamily: bodyFontFamily,
            fontWeight: 700,
            marginBottom: '8px'
          }}
        >
          <Heart className="w-3 h-3 fill-current" />
          <span>{badgeText}</span>
        </div>

        <h3
          style={{
            fontFamily: titleFontFamily,
            fontSize: `${titleFontSize}px`,
            fontWeight: 700,
            color: titleColor,
            lineHeight: 1.15,
            margin: '0 0 4px 0',
            textAlign: textAlign
          }}
        >
          {coupleNames}
        </h3>

        {weddingDate && (
          <p
            style={{
              fontSize: `${Math.max(9, bodyFontSize - 1)}px`,
              fontFamily: bodyFontFamily,
              color: accentColor,
              letterSpacing: '1.5px',
              fontWeight: 600,
              margin: '0 0 8px 0',
              textAlign: textAlign
            }}
          >
            • {weddingDate} •
          </p>
        )}

        <blockquote
          style={{
            fontSize: `${bodyFontSize}px`,
            fontFamily: titleFontFamily,
            fontStyle: 'italic',
            color: textColor,
            lineHeight: 1.4,
            margin: '0 0 12px 0',
            padding: '0 4px',
            textAlign: textAlign
          }}
        >
          "{quote}"
        </blockquote>
      </div>

      <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '10px' }}>
        <p
          style={{
            margin: '0 0 4px 0',
            fontSize: `${Math.max(9, bodyFontSize - 1)}px`,
            fontWeight: 700,
            color: titleColor,
            fontFamily: bodyFontFamily,
            textAlign: textAlign
          }}
        >
          {contactTitle}
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            fontSize: `${Math.max(9, bodyFontSize - 1)}px`,
            fontFamily: bodyFontFamily,
            color: textColor
          }}
        >
          {contactPhone && (
            <a
              href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>📞 {contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>✉️ {contactEmail}</span>
            </a>
          )}
        </div>

        {contactNote && (
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: `${Math.max(8, bodyFontSize - 2)}px`,
              fontStyle: 'italic',
              color: accentColor,
              fontFamily: bodyFontFamily,
              textAlign: textAlign
            }}
          >
            {contactNote}
          </p>
        )}
      </div>
    </div>
  );
};
