import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Guest, ProtocolCategory, RsvpStatus, CustomGuestRole } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { CompanionModal } from './CompanionModal';
import { formatAltibajas } from '../../lib/formatUtils';
import { 
  X, 
  User, 
  Crown, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Briefcase, 
  Phone, 
  Mail, 
  Users, 
  UserPlus,
  UserMinus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Settings,
  Plus,
  Edit2,
  Check,
  ChevronDown,
  Palette
} from 'lucide-react';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guestData: any) => void;
  guestToEdit?: Guest | null;
}

interface RoleOption {
  id: string;
  label: string;
  shortLabel: string;
  desc: string;
  icon: React.ElementType;
  activeColor: string;
  badgeClass: string;
  isCustom?: boolean;
}

const DEFAULT_BUILTIN_ROLES: RoleOption[] = [
  {
    id: 'anfitrion',
    label: 'Anfitrión',
    shortLabel: 'Anfitrión',
    desc: 'Novios / Anfitriones del evento',
    icon: Sparkles,
    activeColor: 'bg-purple-700 text-white border-purple-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'invitado',
    label: 'Invitado',
    shortLabel: 'Invitado',
    desc: 'Invitado general / Amigos',
    icon: User,
    activeColor: 'bg-stone-800 text-white border-stone-900 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
  },
  {
    id: 'familia_directa',
    label: 'Familia directa',
    shortLabel: 'Familia',
    desc: 'Padres, hermanos, abuelos',
    icon: Heart,
    activeColor: 'bg-amber-700 text-white border-amber-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'wedding_planner',
    label: 'Wedding Planner',
    shortLabel: 'Planner',
    desc: 'Coordinador, staff y logística',
    icon: ShieldCheck,
    activeColor: 'bg-emerald-700 text-white border-emerald-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'cortejo_honor',
    label: 'Cortejo de honor',
    shortLabel: 'Cortejo',
    desc: 'Padrinos, madrinas, damas',
    icon: Crown,
    activeColor: 'bg-rose-700 text-white border-rose-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'damita_honor',
    label: 'Damita de Honor',
    shortLabel: 'Damita',
    desc: 'Acompañamiento en cortejo y ramo',
    icon: Sparkles,
    activeColor: 'bg-pink-700 text-white border-pink-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  {
    id: 'paje_honor',
    label: 'Paje de Honor',
    shortLabel: 'Paje',
    desc: 'Portador de arras, anillos o letreros',
    icon: Crown,
    activeColor: 'bg-sky-700 text-white border-sky-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  {
    id: 'nino_boda',
    label: 'Niño/a de Boda',
    shortLabel: 'Niño/a',
    desc: 'Menor de edad / comensal infantil',
    icon: Heart,
    activeColor: 'bg-teal-700 text-white border-teal-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'proveedor',
    label: 'Proveedor',
    shortLabel: 'Proveedor',
    desc: 'Fotografía, DJ, banquete, flores',
    icon: Briefcase,
    activeColor: 'bg-blue-700 text-white border-blue-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
];

const COLOR_THEMES = [
  { id: 'rose', name: 'Vino / Rosa', activeColor: 'bg-rose-700 text-white border-rose-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'purple', name: 'Púrpura', activeColor: 'bg-purple-700 text-white border-purple-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'pink', name: 'Rosa Pastel', activeColor: 'bg-pink-700 text-white border-pink-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-pink-100 text-pink-800 border-pink-200' },
  { id: 'sky', name: 'Azul Cielo', activeColor: 'bg-sky-700 text-white border-sky-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-sky-100 text-sky-800 border-sky-200' },
  { id: 'teal', name: 'Verde Azulado', activeColor: 'bg-teal-700 text-white border-teal-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'amber', name: 'Ámbar / Dorado', activeColor: 'bg-amber-700 text-white border-amber-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'emerald', name: 'Esmeralda', activeColor: 'bg-emerald-700 text-white border-emerald-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'indigo', name: 'Índigo', activeColor: 'bg-indigo-700 text-white border-indigo-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'stone', name: 'Piedra / Gris', activeColor: 'bg-stone-800 text-white border-stone-900 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200' },
];

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  guestToEdit,
}) => {
  const { 
    guests, 
    updateGuest, 
    deleteGuest, 
    tables, 
    timeline, 
    settings, 
    updateSettings,
    currentUser,
    isLevel1Admin,
    isHostUser,
    isLevel3Planner,
  } = useWedding();

  // Permission check: Only Administrator (Level 1), Host/Anfitrión (Level 2), and Wedding Planner (Level 3) can manage roles
  const canManageRoles = isLevel1Admin || isHostUser || isLevel3Planner || (currentUser && [1, 2, 3].includes(currentUser.level));

  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [lastAddedCompanion, setLastAddedCompanion] = useState<string | null>(null);
  const [companionActionMessage, setCompanionActionMessage] = useState<string | null>(null);
  const [isProcessingCompanion, setIsProcessingCompanion] = useState(false);

  // Role management state
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState<{
    label: string;
    shortLabel: string;
    desc: string;
    themeIndex: number;
  }>({
    label: '',
    shortLabel: '',
    desc: '',
    themeIndex: 0,
  });

  // Timeline selector state for Horario Especial de Llegada
  const [isTimelinePickerOpen, setIsTimelinePickerOpen] = useState(false);
  const timelinePickerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<Guest>>({
    fullName: '',
    email: '',
    phone: '',
    category: 'invitado',
    protocolRoleTitle: '',
    isProtocolParticipant: false,
    specialArrivalTime: '',
    rehearsalSchedule: '',
    photoshootSchedule: '',
    dressCodeNote: '',
    accessoryAssigned: '',
    assignedMilestone: '',
    assignedTable: 'Mesa por asignar',
    totalPasses: 1,
    confirmedPasses: 0,
    rsvpStatus: 'pending',
    dietaryRestrictions: 'Ninguna',
    confirmedRehearsalPhotoAttendance: false,
    congratulationMessage: '',
  });

  // Combined roles list: default + custom
  const allRoles: RoleOption[] = useMemo(() => {
    const customList: RoleOption[] = (settings.customGuestRoles || []).map((cr) => {
      const theme = COLOR_THEMES.find(t => t.id === cr.colorClass) || COLOR_THEMES[0];
      return {
        id: cr.id,
        label: cr.label,
        shortLabel: cr.shortLabel || cr.label,
        desc: cr.desc || 'Rol personalizado',
        icon: Crown,
        activeColor: cr.badgeClass ? cr.badgeClass : theme.activeColor,
        badgeClass: cr.badgeClass ? cr.badgeClass : theme.badgeClass,
        isCustom: true,
      };
    });
    return [...DEFAULT_BUILTIN_ROLES, ...customList];
  }, [settings.customGuestRoles]);

  // Close timeline popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timelinePickerRef.current && !timelinePickerRef.current.contains(event.target as Node)) {
        setIsTimelinePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate companions strictly linked to this guest
  const linkedCompanions = useMemo(() => {
    const guestId = guestToEdit?.id;
    if (!guestId) return [];
    return guests.filter((g) => g.id !== guestId && g.mainGuestId === guestId);
  }, [guests, guestToEdit]);

  const totalPasses = formData.totalPasses !== undefined ? formData.totalPasses : 1;
  const maxAllowedCompanions = Math.max(0, totalPasses - 1);

  useEffect(() => {
    if (guestToEdit) {
      let cat = guestToEdit.category || 'invitado';
      if ((cat as string) === 'invitado_general') cat = 'invitado';
      if ((cat as string) === 'programa_evento') cat = 'cortejo_honor';

      setFormData({
        ...guestToEdit,
        category: cat,
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        category: 'invitado',
        protocolRoleTitle: '',
        isProtocolParticipant: false,
        specialArrivalTime: '',
        rehearsalSchedule: '',
        photoshootSchedule: '',
        dressCodeNote: '',
        accessoryAssigned: '',
        assignedMilestone: '',
        assignedTable: 'Mesa por asignar',
        totalPasses: 1,
        confirmedPasses: 0,
        rsvpStatus: 'pending',
        dietaryRestrictions: 'Ninguna',
        confirmedRehearsalPhotoAttendance: false,
        congratulationMessage: '',
      });
    }
    setLastAddedCompanion(null);
    setCompanionActionMessage(null);
    setIsRoleManagerOpen(false);
    setIsTimelinePickerOpen(false);
  }, [guestToEdit, isOpen]);

  // Quitar acompañante de esta mesa (desvincularlo)
  const handleRemoveCompanionFromTable = async (companion: Guest) => {
    setIsProcessingCompanion(true);
    try {
      await updateGuest(companion.id, {
        mainGuestId: undefined,
        assignedTable: 'Mesa por asignar',
      });
      setCompanionActionMessage(`"${companion.fullName}" fue desvinculado(a) de ${formData.fullName || 'este invitado'} y enviado a 'Mesa por asignar'.`);
      setTimeout(() => setCompanionActionMessage(null), 4000);
    } catch (err) {
      console.error('Error removing companion from table:', err);
    } finally {
      setIsProcessingCompanion(false);
    }
  };

  // Eliminar acompañante de la lista de invitados por completo
  const handleDeleteCompanionGuest = async (companion: Guest) => {
    if (window.confirm(`¿Deseas eliminar a "${companion.fullName}" de la lista de invitados?`)) {
      setIsProcessingCompanion(true);
      try {
        await deleteGuest(companion.id);
        setCompanionActionMessage(`"${companion.fullName}" fue eliminado(a) de la lista de invitados.`);
        setTimeout(() => setCompanionActionMessage(null), 4000);
      } catch (err) {
        console.error('Error deleting companion guest:', err);
      } finally {
        setIsProcessingCompanion(false);
      }
    }
  };

  const handleCategoryChange = (cat: string) => {
    const isSpecial = cat !== 'invitado';
    const currentOpt = allRoles.find(r => r.id === cat);
    
    setFormData(prev => ({
      ...prev,
      category: cat,
      isProtocolParticipant: isSpecial,
      protocolRoleTitle: prev.protocolRoleTitle || (
        cat === 'anfitrion' ? 'Anfitrión Principal' :
        cat === 'wedding_planner' ? 'Director de Coordinación' :
        cat === 'proveedor' ? 'Servicio / Proveedor' :
        cat === 'cortejo_honor' ? 'Padrino / Madrina' :
        cat === 'damita_honor' ? 'Damita de Honor' :
        cat === 'paje_honor' ? 'Paje de Honor' :
        cat === 'nino_boda' ? 'Niño/a de Boda' :
        cat === 'familia_directa' ? 'Familiar Cercano' : 
        (currentOpt?.label || '')
      ),
    }));
  };

  // Helper for timeline milestone selection
  const handleSelectMilestone = (m: { time: string; title: string; location?: string }, offsetMinutes: number = 0) => {
    let timeStr = m.time;
    if (offsetMinutes !== 0) {
      const parts = m.time.split(':');
      if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const mins = parseInt(parts[1], 10);
        if (!isNaN(hours) && !isNaN(mins)) {
          const totalMins = hours * 60 + mins + offsetMinutes;
          const adjustedMins = ((totalMins % 1440) + 1440) % 1440;
          const newH = Math.floor(adjustedMins / 60).toString().padStart(2, '0');
          const newM = (adjustedMins % 60).toString().padStart(2, '0');
          timeStr = `${newH}:${newM}`;
        }
      }
    }

    const note = offsetMinutes < 0 ? ` (${Math.abs(offsetMinutes)}m antes)` : '';
    const formatted = `${timeStr} hrs - ${m.title}${note}`;
    setFormData(prev => ({
      ...prev,
      specialArrivalTime: formatted,
      assignedMilestone: m.title,
    }));
    setIsTimelinePickerOpen(false);
  };

  // Role Manager: Add or Update custom role (Only Admin, Planner, Anfitrión)
  const handleSaveCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRoles) {
      alert('Solo el Administrador, Wedding Planner o Anfitrión tienen permiso para gestionar los roles.');
      return;
    }
    if (!roleForm.label.trim()) return;

    const theme = COLOR_THEMES[roleForm.themeIndex] || COLOR_THEMES[0];
    const currentCustom = settings.customGuestRoles || [];

    if (editingRoleId) {
      // Editing existing custom role or overriding
      const updated = currentCustom.map(r => {
        if (r.id === editingRoleId) {
          return {
            ...r,
            label: roleForm.label.trim(),
            shortLabel: roleForm.shortLabel.trim() || roleForm.label.trim(),
            desc: roleForm.desc.trim(),
            badgeClass: theme.badgeClass,
            colorClass: theme.id,
          };
        }
        return r;
      });
      await updateSettings({ customGuestRoles: updated });
    } else {
      // Creating new role
      const newId = `role_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newRole: CustomGuestRole = {
        id: newId,
        label: roleForm.label.trim(),
        shortLabel: roleForm.shortLabel.trim() || roleForm.label.trim(),
        desc: roleForm.desc.trim() || 'Rol de protocolo nupcial',
        badgeClass: theme.badgeClass,
        colorClass: theme.id,
        isCustom: true,
      };
      await updateSettings({ customGuestRoles: [...currentCustom, newRole] });
      // Automatically select the new role for this guest
      handleCategoryChange(newId);
    }

    setRoleForm({ label: '', shortLabel: '', desc: '', themeIndex: 0 });
    setEditingRoleId(null);
  };

  // Role Manager: Delete custom role (Only Admin, Planner, Anfitrión)
  const handleDeleteCustomRole = async (roleId: string, roleName: string) => {
    if (!canManageRoles) {
      alert('Solo el Administrador, Wedding Planner o Anfitrión tienen permiso para eliminar roles.');
      return;
    }
    if (!window.confirm(`¿Deseas eliminar el rol "${roleName}"? Los invitados con este rol mantendrán su categoría general.`)) return;

    const currentCustom = settings.customGuestRoles || [];
    const updated = currentCustom.filter(r => r.id !== roleId);
    await updateSettings({ customGuestRoles: updated });

    if (formData.category === roleId) {
      handleCategoryChange('invitado');
    }
  };

  const startEditRole = (role: RoleOption) => {
    setEditingRoleId(role.id);
    const themeIdx = COLOR_THEMES.findIndex(t => t.activeColor === role.activeColor || t.badgeClass === role.badgeClass);
    setRoleForm({
      label: role.label,
      shortLabel: role.shortLabel,
      desc: role.desc,
      themeIndex: themeIdx >= 0 ? themeIdx : 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim()) return;
    onSave({
      ...formData,
      fullName: formatAltibajas(formData.fullName),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#EBEBEB] rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-transparent my-6 relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C827A] hover:text-[#2D2A26] p-1.5 rounded-lg hover:bg-[#EFEAE2] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] flex items-center justify-center shadow-xs">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#2D2A26]">
              {guestToEdit ? 'Editar Invitado / Rol' : 'Agregar Nuevo Invitado'}
            </h3>
            <p className="text-xs text-[#7A7268]">
              Define su rol (Anfitrión, Invitado, Familia Directa, Wedding Planner, Cortejo de Honor, Damita, Paje, Niño/a o Proveedor)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {/* 1. Datos Personales */}
          <div className="bg-[#EBEBEB] p-4 rounded-xl border border-transparent space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#2D3748] uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span>1. Datos Personales</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Nombre Completo <span className="text-[#2D3748]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ej. Carlos Mendoza Garza"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#8C8276] absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+52 81 8394 1122"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#8C8276] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="carlos@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Mesa & Asistencia */}
          <div className="bg-[#EBEBEB] p-4 rounded-xl border border-transparent space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#2D3748] uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>2. Mesa & Asistencia</span>
              </h4>

              {/* + Acompañante Button (available when editing guest or having a registered guest) */}
              {guestToEdit && (
                <button
                  type="button"
                  onClick={() => setIsCompanionModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Vincular o registrar un acompañante para este invitado"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Acompañante</span>
                </button>
              )}
            </div>

            {/* Notification when a companion was just added */}
            {lastAddedCompanion && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Acompañante <strong>{lastAddedCompanion}</strong> registrado(a) con <strong>{formData.assignedTable || 'Mesa por asignar'}</strong>.
                </span>
              </div>
            )}

            {/* Notification when a companion was removed/unlinked */}
            {companionActionMessage && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs flex items-center justify-between animate-fadeIn shadow-2xs">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{companionActionMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCompanionActionMessage(null)}
                  className="text-amber-700 hover:text-amber-900 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Table Companions Interactive Management List */}
            {guestToEdit && linkedCompanions.length > 0 && (
              <div className="p-3 bg-[#FAF8F5] border border-transparent rounded-xl text-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-transparent pb-1.5">
                  <span className="font-bold text-[#7A7268] flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Acompañantes vinculados ({linkedCompanions.length} de {maxAllowedCompanions} permitidos):</span>
                  </span>
                  <span className="text-[10px] text-stone-500 italic">
                    {formData.assignedTable || 'Mesa por asignar'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {linkedCompanions.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-2 bg-[#EBEBEB] border border-[#D9CEBF] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-transparent transition-all"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {comp.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[#2D2A26] block truncate">
                            {comp.fullName}
                          </span>
                          <div className="flex items-center space-x-1.5 text-[10px] text-[#7A7268]">
                            <span className="text-stone-500 font-mono">{comp.code}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">
                              {comp.category === 'invitado' ? 'Invitado' : comp.category}
                            </span>
                            <span>•</span>
                            <span className="text-[#8C8276] italic">Pase de acompañante</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons to remove companion */}
                      <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={isProcessingCompanion}
                          onClick={() => handleRemoveCompanionFromTable(comp)}
                          className="px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
                          title="Quitar de esta mesa y enviarlo a 'Mesa por asignar' sin borrarlo de la lista"
                        >
                          <UserMinus className="w-3 h-3 text-amber-700" />
                          <span>Desvincular</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessingCompanion}
                          onClick={() => handleDeleteCompanionGuest(comp)}
                          className="p-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                          title="Eliminar este acompañante de la lista de invitados"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Nombre de Mesa.
                </label>
                <select
                  value={formData.assignedTable || 'Mesa por asignar'}
                  onChange={(e) => setFormData({ ...formData, assignedTable: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] text-[#2D2A26] cursor-pointer font-medium"
                >
                  <option value="Mesa por asignar">Mesa por asignar</option>
                  {tables?.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} (Capacidad: {t.capacity} pax)
                    </option>
                  ))}
                  {formData.assignedTable &&
                    formData.assignedTable.trim().toLowerCase() !== 'mesa por asignar' &&
                    !tables?.some((t) => t.name.trim().toLowerCase() === formData.assignedTable?.trim().toLowerCase()) && (
                      <option value={formData.assignedTable}>{formData.assignedTable}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Pases Asignados
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.totalPasses !== undefined ? formData.totalPasses : 1}
                  onChange={(e) => setFormData({ ...formData, totalPasses: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Estado RSVP
                </label>
                <select
                  value={formData.rsvpStatus || 'pending'}
                  onChange={(e) => {
                    const status = e.target.value as RsvpStatus;
                    setFormData({ 
                      ...formData, 
                      rsvpStatus: status,
                      confirmedPasses: status === 'confirmed' ? (formData.confirmedPasses || formData.totalPasses || 1) : 0
                    });
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] font-medium"
                >
                  <option value="pending">⏳ Pendiente</option>
                  <option value="confirmed">✅ Confirmado</option>
                  <option value="declined">❌ Declinado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Pases Confirmados Reales
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.totalPasses || 20}
                  value={formData.confirmedPasses || 0}
                  onChange={(e) => setFormData({ ...formData, confirmedPasses: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Restricciones Dietarias / Alergias
                </label>
                <input
                  type="text"
                  value={formData.dietaryRestrictions || ''}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                  placeholder="Ej. Celíaco, Vegano, Menú infantil, Sin nueces..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                />
              </div>
            </div>
          </div>

          {/* 3. Role Selection & Management */}
          <div className="bg-[#EBEBEB] p-4 rounded-xl border border-transparent space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold text-[#2D3748] uppercase tracking-wider flex items-center space-x-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>3. Rol en la Boda (Selecciona uno)</span>
              </h4>
              
              {/* Role Management Button (Restricted to Admin, Planner, Anfitrión) */}
              {canManageRoles ? (
                <button
                  type="button"
                  onClick={() => setIsRoleManagerOpen(!isRoleManagerOpen)}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    isRoleManagerOpen
                      ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-[#2D3748]'
                      : 'bg-[#FAF8F5] text-[#524B42] border-[#D9CEBF] hover:bg-[#EFEAE2]'
                  }`}
                  title="Administrar roles: Añadir, editar o borrar roles de la boda (Admin, Planner, Anfitrión)"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{isRoleManagerOpen ? 'Ocultar Gestor' : '⚙️ Gestionar Roles'}</span>
                </button>
              ) : (
                <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200" title="Solo el Administrador, Wedding Planner o Anfitrión pueden crear, editar o borrar roles">
                  🔒 Edición de roles reservada a Admin / Planner / Anfitrión
                </span>
              )}
            </div>

            {/* Role Manager Sub-Panel */}
            {isRoleManagerOpen && (
              <div className="p-3.5 bg-[#F9F6F0] rounded-xl border border-[#E4D7C8] space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#E4D7C8] pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Palette className="w-4 h-4 text-[#2D3748]" />
                    <span className="text-xs font-bold text-[#2D2A26]">
                      {editingRoleId ? 'Editar Rol' : 'Añadir / Personalizar Roles de la Boda'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#7A7268]">
                    Permitido para Administrador, Planner y Anfitrión
                  </span>
                </div>

                {/* Form to Add / Edit Role */}
                <div className="bg-[#EBEBEB] p-3 rounded-lg border border-[#D9CEBF] space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#524B42] mb-0.5">
                        Nombre del Rol <span className="text-[#2D3748]">*</span>
                      </label>
                      <input
                        type="text"
                        value={roleForm.label}
                        onChange={(e) => setRoleForm({ ...roleForm, label: e.target.value })}
                        placeholder="Ej. Damita de Honor, Músico, Testigo..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#524B42] mb-0.5">
                        Etiqueta Corta (Badge)
                      </label>
                      <input
                        type="text"
                        value={roleForm.shortLabel}
                        onChange={(e) => setRoleForm({ ...roleForm, shortLabel: e.target.value })}
                        placeholder="Ej. Damita, Músico, Testigo"
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#524B42] mb-0.5">
                      Descripción del Rol
                    </label>
                    <input
                      type="text"
                      value={roleForm.desc}
                      onChange={(e) => setRoleForm({ ...roleForm, desc: e.target.value })}
                      placeholder="Ej. Acompañamiento en cortejo y ramo infantil"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#524B42] mb-1">
                      Color / Tema Visual
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_THEMES.map((th, idx) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setRoleForm({ ...roleForm, themeIndex: idx })}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                            roleForm.themeIndex === idx
                              ? `${th.badgeClass} ring-2 ring-[#d1d1d1]`
                              : 'bg-[#EBEBEB] text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {th.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    {editingRoleId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoleId(null);
                          setRoleForm({ label: '', shortLabel: '', desc: '', themeIndex: 0 });
                        }}
                        className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700"
                      >
                        Cancelar Edición
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveCustomRole}
                      disabled={!roleForm.label.trim()}
                      className="px-3 py-1.5 rounded-md bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold hover:bg-[#EBEBEB] transition-all disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingRoleId ? 'Guardar Rol' : '+ Añadir Rol'}</span>
                    </button>
                  </div>
                </div>

                {/* List of Custom Roles */}
                {(settings.customGuestRoles && settings.customGuestRoles.length > 0) && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#7A7268]">Roles Personalizados Activos:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {settings.customGuestRoles.map((cr) => (
                        <div
                          key={cr.id}
                          className="p-2 bg-[#EBEBEB] rounded-lg border border-[#D9CEBF] flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-1">
                            <span className="font-bold text-[#2D2A26] block truncate">{cr.label}</span>
                            <span className="text-[10px] text-[#7A7268] block truncate">{cr.desc || 'Sin descripción'}</span>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoleId(cr.id);
                                const themeIdx = COLOR_THEMES.findIndex(t => t.id === cr.colorClass);
                                setRoleForm({
                                  label: cr.label,
                                  shortLabel: cr.shortLabel || cr.label,
                                  desc: cr.desc || '',
                                  themeIndex: themeIdx >= 0 ? themeIdx : 0,
                                });
                              }}
                              className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded"
                              title="Editar rol"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomRole(cr.id, cr.label)}
                              className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                              title="Eliminar rol"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Roles Grid: Standard + Custom */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allRoles.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.category === opt.id || 
                  (opt.id === 'invitado' && (formData.category as string) === 'invitado_general') ||
                  (opt.id === 'cortejo_honor' && (formData.category as string) === 'programa_evento');

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleCategoryChange(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? opt.activeColor
                        : 'bg-[#FAF8F5] text-[#524B42] border-[#D9CEBF] hover:bg-[#EFEAE2]'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-stone-700'}`} />
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-stone-800'}`}>{opt.label}</span>
                    </div>
                    <span className={`text-[10px] leading-tight line-clamp-2 ${isSelected ? 'text-white/90' : 'text-[#7A7268]'}`}>
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Role Title / Specific Details & Timeline Milestone Link */}
            <div className="pt-2 space-y-3 border-t border-[#F2ECE3]">
              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Título / Detalle Específico del Rol
                </label>
                <input
                  type="text"
                  value={formData.protocolRoleTitle || ''}
                  onChange={(e) => setFormData({ ...formData, protocolRoleTitle: e.target.value })}
                  placeholder="Ej. Damita de Honor, Paje de Anillos, Padrino de Velación, Niño de Boda, Fotógrafo..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                />
              </div>

              {/* Horario Especial de Llegada with Cronograma Integration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative" ref={timelinePickerRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#524B42]">
                      Horario Especial de Llegada
                    </label>

                    {/* Timeline Quick Picker Button */}
                    <button
                      type="button"
                      onClick={() => setIsTimelinePickerOpen(!isTimelinePickerOpen)}
                      className="text-[11px] text-[#2D3748] hover:text-[#2D3748] font-semibold flex items-center space-x-1 cursor-pointer bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/20 px-2 py-0.5 rounded-md transition-colors"
                      title="Seleccionar horario desde un hito del Cronograma de la boda"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{timeline && timeline.length > 0 ? `Cronograma (${timeline.length})` : 'Elegir hito'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-[#8C8276] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.specialArrivalTime || ''}
                      onChange={(e) => setFormData({ ...formData, specialArrivalTime: e.target.value })}
                      placeholder={timeline && timeline.length > 0 ? "Ej. 16:30 hrs (Ceremonia) o escribe manual" : "Ej. 15:30 hrs (Recepción)"}
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                    />
                    {formData.specialArrivalTime && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, specialArrivalTime: '', assignedMilestone: '' })}
                        className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 p-0.5"
                        title="Limpiar horario"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Timeline Milestones Dropdown Popover */}
                  {isTimelinePickerOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#EBEBEB] rounded-xl shadow-xl border border-[#D9CEBF] p-3 space-y-2 max-h-64 overflow-y-auto animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-1.5">
                        <span className="text-[11px] font-bold text-[#2D3748] flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Hitos del Cronograma ({timeline?.length || 0})</span>
                        </span>
                        <span className="text-[10px] text-[#7A7268]">Clic para asignar</span>
                      </div>

                      {timeline && timeline.length > 0 ? (
                        <div className="space-y-1.5">
                          {timeline.map((m) => (
                            <div
                              key={m.id}
                              className="p-2 rounded-lg border border-transparent hover:border-transparent hover:bg-[#FAF8F5] transition-all text-xs flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#2D2A26] flex items-center space-x-1.5">
                                  <span className="px-1.5 py-0.5 rounded bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] text-[11px] font-mono font-bold">
                                    {m.time}
                                  </span>
                                  <span className="truncate">{m.title}</span>
                                </span>
                                {m.location && (
                                  <span className="text-[10px] text-stone-500 truncate max-w-[120px]">{m.location}</span>
                                )}
                              </div>

                              {/* Quick offset selection buttons */}
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleSelectMilestone(m, 0)}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:text-[#2D3748] text-[10px] font-semibold text-stone-700 transition-colors"
                                >
                                  A la hora ({m.time})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMilestone(m, -15)}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:text-[#2D3748] text-[10px] font-semibold text-stone-700 transition-colors"
                                >
                                  -15 min
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMilestone(m, -30)}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:text-[#2D3748] text-[10px] font-semibold text-stone-700 transition-colors"
                                >
                                  -30 min
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMilestone(m, -60)}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:text-[#2D3748] text-[10px] font-semibold text-stone-700 transition-colors"
                                >
                                  -1 hora
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-stone-500 text-xs">
                          <p className="font-medium">No hay hitos en el Cronograma aún.</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">Puedes ingresar el horario de forma manual en el campo.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Sesión de Fotos / Ensayo
                  </label>
                  <input
                    type="text"
                    value={formData.photoshootSchedule || ''}
                    onChange={(e) => setFormData({ ...formData, photoshootSchedule: e.target.value })}
                    placeholder="Ej. Sábado 16:00 hrs en Jardines"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Nota de Vestuario / Paleta Asignada
                  </label>
                  <input
                    type="text"
                    value={formData.dressCodeNote || ''}
                    onChange={(e) => setFormData({ ...formData, dressCodeNote: e.target.value })}
                    placeholder="Ej. Corbata Champagne Dorado / Smoking"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Accesorio / Corsage / Boutonniere
                  </label>
                  <input
                    type="text"
                    value={formData.accessoryAssigned || ''}
                    onChange={(e) => setFormData({ ...formData, accessoryAssigned: e.target.value })}
                    placeholder="Ej. Boutonniere Rosa Blanca #1, Corona floral"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-transparent">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#2D3748] bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] transition-colors shadow-xs cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>

        {/* Sub-modal: Select or Register Companion */}
        <CompanionModal
          isOpen={isCompanionModalOpen}
          onClose={() => setIsCompanionModalOpen(false)}
          primaryGuestName={formData.fullName || 'Invitado'}
          primaryGuestId={guestToEdit?.id}
          initialTotalPasses={formData.totalPasses}
          onPassesChange={(newPasses) => {
            setFormData((prev) => ({ ...prev, totalPasses: newPasses }));
          }}
          currentTable={formData.assignedTable || 'Mesa 1'}
          excludeGuestId={guestToEdit?.id}
          onTableChange={(newTable) => {
            setFormData((prev) => ({ ...prev, assignedTable: newTable }));
          }}
          onCompanionAdded={(compName) => {
            setLastAddedCompanion(compName);
          }}
        />

      </div>
    </div>
  );
};
