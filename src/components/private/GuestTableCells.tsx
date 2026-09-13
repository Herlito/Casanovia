import React, { useState, useRef, useEffect } from 'react';
import { Guest, RsvpStatus } from '../../types';
import { 
  User, 
  Users, 
  UserPlus, 
  Plus, 
  Minus, 
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown
} from 'lucide-react';

// ==========================================
// 1. GuestRoleCell
// Displays only the icon without text.
// No button styling.
// Text appears on hover or click, bounded inside screen.
// ==========================================

interface GuestRoleCellProps {
  guest: Guest;
  roleLabel: string;
  protocolRoleTitle?: string;
  Icon: React.ElementType;
}

export const GuestRoleCell: React.FC<GuestRoleCellProps> = ({
  guest,
  roleLabel,
  protocolRoleTitle,
  Icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [openUpward, setOpenUpward] = useState(true);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // If close to the top of the viewport, position below
      if (rect.top < 180) {
        setOpenUpward(false);
      } else {
        setOpenUpward(true);
      }

      // Calculate horizontal position so it stays inside viewport
      const margin = 10;
      const targetWidth = 190;
      const width = Math.min(targetWidth, window.innerWidth - margin * 2);
      let offset = (rect.width - width) / 2;

      const viewportLeft = rect.left + offset;
      const viewportRight = viewportLeft + width;

      if (viewportLeft < margin) {
        offset += (margin - viewportLeft);
      } else if (viewportRight > window.innerWidth - margin) {
        offset -= (viewportRight - (window.innerWidth - margin));
      }

      setPopoverStyle({
        left: `${offset}px`,
        width: `${width}px`,
        maxWidth: `calc(100vw - ${margin * 2}px)`
      });
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    calculatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    calculatePosition();
    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    } else {
      setIsPinned(true);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen && !isPinned) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, isPinned]);

  const showTooltip = isOpen || isPinned;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon only, completely unstyled as a button */}
      <button
        type="button"
        onClick={handleToggleClick}
        className="p-1 rounded-full text-[#524B42] hover:text-[#2D3748] transition-colors cursor-pointer border-0 bg-transparent shadow-none focus:outline-none flex items-center justify-center"
        aria-label={roleLabel}
        title={roleLabel}
      >
        <Icon className="w-4 h-4 shrink-0" />
      </button>

      {/* Floating tooltip/popover with role text - clamped to screen */}
      {showTooltip && (
        <div
          style={popoverStyle}
          className={`absolute z-50 px-3 py-2 rounded-2xl bg-[#EBEBEB] text-[#2D3748] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-white/80 text-xs font-semibold flex flex-col items-center gap-0.5 pointer-events-auto transition-all animate-in fade-in duration-150 text-center ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#2D3748]">
            <Icon className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{roleLabel}</span>
          </div>
          {protocolRoleTitle && protocolRoleTitle !== roleLabel && (
            <span className="text-[10px] text-stone-500 font-normal truncate max-w-full">
              {protocolRoleTitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. GuestCompanionCell
// Displays only the icon without text:
// - Double person icon if assigned companion exists
// - Single person with '+' icon if no companion
// - Two persons, one of a different color if follows another guest
// Hover/Click reveals popover with actions, bounded inside viewport.
// ==========================================

interface GuestCompanionCellProps {
  guest: Guest;
  linkedCompanions: Guest[];
  isCompanionOfSomeone: boolean;
  mainGuest: Guest | null;
  onOpenAssignCompanion: () => void;
  onUnlinkCompanion: (companionGuest: Guest) => void;
}

export const GuestCompanionCell: React.FC<GuestCompanionCellProps> = ({
  guest,
  linkedCompanions,
  isCompanionOfSomeone,
  mainGuest,
  onOpenAssignCompanion,
  onUnlinkCompanion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [openUpward, setOpenUpward] = useState(true);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < 230) {
        setOpenUpward(false);
      } else {
        setOpenUpward(true);
      }

      // Calculate horizontal position so it stays inside screen
      const margin = 12;
      const targetWidth = 260;
      const width = Math.min(targetWidth, window.innerWidth - margin * 2);
      let offset = (rect.width - width) / 2;

      const viewportLeft = rect.left + offset;
      const viewportRight = viewportLeft + width;

      if (viewportLeft < margin) {
        offset += (margin - viewportLeft);
      } else if (viewportRight > window.innerWidth - margin) {
        offset -= (viewportRight - (window.innerWidth - margin));
      }

      setPopoverStyle({
        left: `${offset}px`,
        width: `${width}px`,
        maxWidth: `calc(100vw - ${margin * 2}px)`
      });
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    calculatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    calculatePosition();
    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    } else {
      setIsPinned(true);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen && !isPinned) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, isPinned]);

  const showTooltip = isOpen || isPinned;

  const handleOpenAssign = () => {
    setIsOpen(false);
    setIsPinned(false);
    onOpenAssignCompanion();
  };

  const handleUnlink = () => {
    setIsOpen(false);
    setIsPinned(false);
    onUnlinkCompanion(guest);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon only, without text or button styling */}
      <button
        type="button"
        onClick={handleToggleClick}
        className="p-1 rounded-full transition-colors cursor-pointer border-0 bg-transparent shadow-none focus:outline-none flex items-center justify-center"
        aria-label="Estado de acompañante"
      >
        {isCompanionOfSomeone ? (
          // Sigue a otro invitado: icono de dos personas, pero una de diferente color
          <div className="relative inline-flex items-center justify-center" title={`Sigue a ${mainGuest?.fullName || 'su titular'}`}>
            <User className="w-4 h-4 text-stone-400 shrink-0" />
            <User className="w-3.5 h-3.5 text-purple-600 shrink-0 -ml-1.5" />
          </div>
        ) : linkedCompanions.length > 0 ? (
          // Tiene acompañante asignado: icono de persona doble
          <div title={`${linkedCompanions.length} acompañante(s) asignado(s)`}>
            <Users className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>
        ) : (
          // No tiene acompañante: icono de persona sola con el signo '+'
          <div title="Sin acompañante (Asignar)">
            <UserPlus className="w-4 h-4 text-stone-400 hover:text-emerald-700 shrink-0 transition-colors" />
          </div>
        )}
      </button>

      {/* Floating Popover on hover or click - bounded inside viewport */}
      {showTooltip && (
        <div
          style={popoverStyle}
          className={`absolute z-50 p-3 rounded-2xl bg-[#EBEBEB] text-[#2D3748] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-white/80 text-xs pointer-events-auto transition-all animate-in fade-in duration-150 ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isCompanionOfSomeone ? (
            // State C: Sigue a alguien
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Acompañante de:
              </div>
              <div className="flex items-center space-x-1.5 font-bold text-xs text-[#2D2A26] mb-1">
                <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{mainGuest?.fullName || 'Invitado titular'}</span>
              </div>
              <div className="text-[11px] text-stone-500 mb-2.5">
                Mesa compartida: <strong>{guest.assignedTable || mainGuest?.assignedTable || 'Mesa por asignar'}</strong>
              </div>
              <button
                type="button"
                onClick={handleUnlink}
                className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-rose-600 hover:text-rose-700 transition-all cursor-pointer"
                title={`Quitar como acompañante de ${mainGuest?.fullName || 'su titular'}`}
              >
                <Minus className="w-3.5 h-3.5 shrink-0" />
                <span>Quitar acompañante</span>
              </button>
            </div>
          ) : linkedCompanions.length > 0 ? (
            // State A: Tiene acompañante(s) asignado(s)
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>{linkedCompanions.length === 1 ? 'Acompañante asignado:' : `Acompañantes (${linkedCompanions.length}):`}</span>
                <span className="text-[9px] font-normal text-stone-400">Pase titular</span>
              </div>
              <div className="space-y-1 mb-2.5 max-h-28 overflow-y-auto pr-1">
                {linkedCompanions.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-[#2D2A26] bg-[#FAF8F5] px-2 py-1 rounded-lg border border-[#D9CEBF]/60"
                  >
                    <User className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{comp.fullName}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleOpenAssign}
                className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-emerald-800 transition-all cursor-pointer"
                title="Asignar o registrar acompañante"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Asignar Acompañante</span>
              </button>
            </div>
          ) : (
            // State B: No tiene acompañante
            <div>
              <div className="text-xs text-stone-600 font-medium text-center mb-2">
                Sin acompañante
              </div>
              <button
                type="button"
                onClick={handleOpenAssign}
                className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-emerald-800 transition-all cursor-pointer"
                title="Asignar acompañante"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Asignar Acompañante</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. GuestRsvpCell
// Displays only the single icon of the current RSVP status.
// When clicked, expands/pops up the options to change status.
// ==========================================

interface GuestRsvpCellProps {
  guest: Guest;
  canEdit: boolean;
  onUpdateStatus: (newStatus: RsvpStatus) => void;
  size?: 'sm' | 'md';
}

export const GuestRsvpCell: React.FC<GuestRsvpCellProps> = ({
  guest,
  canEdit,
  onUpdateStatus,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(true);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < 180) {
        setOpenUpward(false);
      } else {
        setOpenUpward(true);
      }

      const margin = 10;
      const targetWidth = 145;
      const width = Math.min(targetWidth, window.innerWidth - margin * 2);
      let offset = (rect.width - width) / 2;

      const viewportLeft = rect.left + offset;
      const viewportRight = viewportLeft + width;

      if (viewportLeft < margin) {
        offset += (margin - viewportLeft);
      } else if (viewportRight > window.innerWidth - margin) {
        offset -= (viewportRight - (window.innerWidth - margin));
      }

      setPopoverStyle({
        left: `${offset}px`,
        width: `${width}px`,
        maxWidth: `calc(100vw - ${margin * 2}px)`
      });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    calculatePosition();
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (e: React.MouseEvent, status: RsvpStatus) => {
    e.stopPropagation();
    onUpdateStatus(status);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const currentStatus = guest.rsvpStatus || 'pending';
  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div ref={containerRef} className="relative inline-flex items-center justify-center">
      {/* Trigger: single icon of current status */}
      <button
        type="button"
        disabled={!canEdit}
        onClick={handleToggle}
        className={`p-1.5 rounded-xl transition-all flex items-center justify-center group ${
          canEdit
            ? 'cursor-pointer hover:bg-stone-200/60 active:scale-95'
            : 'cursor-default'
        } ${isOpen ? 'bg-stone-200/80 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]' : ''}`}
        title={
          canEdit
            ? `Estado: ${
                currentStatus === 'confirmed'
                  ? 'Confirmado'
                  : currentStatus === 'declined'
                  ? 'Declinado'
                  : 'Pendiente'
              } (Clic para cambiar)`
            : `Estado: ${
                currentStatus === 'confirmed'
                  ? 'Confirmado'
                  : currentStatus === 'declined'
                  ? 'Declinado'
                  : 'Pendiente'
              }`
        }
      >
        {currentStatus === 'confirmed' && (
          <CheckCircle2
            className={`${iconSizeClass} transition-transform group-hover:scale-110`}
            color="#059669"
            strokeWidth={2.6}
          />
        )}
        {currentStatus === 'pending' && (
          <Clock
            className={`${iconSizeClass} transition-transform group-hover:scale-110`}
            color="#d97706"
            strokeWidth={2.6}
          />
        )}
        {currentStatus === 'declined' && (
          <XCircle
            className={`${iconSizeClass} transition-transform group-hover:scale-110`}
            color="#e11d48"
            strokeWidth={2.6}
          />
        )}
      </button>

      {/* Popover / Options Menu */}
      {isOpen && (
        <div
          style={popoverStyle}
          className={`absolute z-50 p-1.5 bg-[#FAF8F5] rounded-2xl border border-[#D9CEBF] shadow-[6px_6px_16px_#c8c8c8,-6px_-6px_16px_#ffffff] flex flex-col gap-1 transition-all ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Opción 1: Confirmado */}
          <button
            type="button"
            onClick={(e) => handleSelect(e, 'confirmed')}
            className={`flex items-center space-x-2 w-full px-2 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
              currentStatus === 'confirmed'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs'
                : 'hover:bg-stone-200/50 text-[#2D2A26]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" color="#059669" strokeWidth={2.6} />
            <span className="truncate">Confirmado</span>
          </button>

          {/* Opción 2: Pendiente */}
          <button
            type="button"
            onClick={(e) => handleSelect(e, 'pending')}
            className={`flex items-center space-x-2 w-full px-2 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
              currentStatus === 'pending'
                ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                : 'hover:bg-stone-200/50 text-[#2D2A26]'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" color="#d97706" strokeWidth={2.6} />
            <span className="truncate">Pendiente</span>
          </button>

          {/* Opción 3: Declinado */}
          <button
            type="button"
            onClick={(e) => handleSelect(e, 'declined')}
            className={`flex items-center space-x-2 w-full px-2 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
              currentStatus === 'declined'
                ? 'bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs'
                : 'hover:bg-stone-200/50 text-[#2D2A26]'
            }`}
          >
            <XCircle className="w-4 h-4 shrink-0" color="#e11d48" strokeWidth={2.6} />
            <span className="truncate">Declinado</span>
          </button>
        </div>
      )}
    </div>
  );
};
