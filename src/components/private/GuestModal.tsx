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
  ChevronUp,
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

// Roles protocolares exclusivos para Fiesta de Promoción
const PROMOTION_BUILTIN_ROLES: RoleOption[] = [
  {
    id: 'comision_organizadora',
    label: 'Comisión (Comisión Organizadora)',
    shortLabel: 'Comisión',
    desc: 'Comisión Organizadora (gestión de cuotas, pagos y coordinación)',
    icon: Crown,
    activeColor: 'bg-purple-700 text-white border-purple-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'padres_familia',
    label: 'Padres de Familia (Padre de familia)',
    shortLabel: 'Padres',
    desc: 'Padres de familia o apoderados titulares responsables de cuotas',
    icon: Heart,
    activeColor: 'bg-amber-700 text-white border-amber-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'alumnos',
    label: 'Alumnos',
    shortLabel: 'Alumnos',
    desc: 'Alumnos y graduandos de la promoción',
    icon: Sparkles,
    activeColor: 'bg-emerald-700 text-white border-emerald-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'parejas',
    label: 'Parejas',
    shortLabel: 'Parejas',
    desc: 'Parejas y acompañantes de los graduandos / invitados',
    icon: User,
    activeColor: 'bg-pink-700 text-white border-pink-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  {
    id: 'familiares',
    label: 'Familiares',
    shortLabel: 'Familiares',
    desc: 'Familiares e invitados de los graduandos',
    icon: Users,
    activeColor: 'bg-sky-700 text-white border-sky-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  {
    id: 'proveedor',
    label: 'Proveedor',
    shortLabel: 'Proveedor',
    desc: 'Fotografía, sonido, luces, banquete, animación',
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
    activeWedding,
  } = useWedding();

  const isPromotionEvent = 
    (settings?.eventType?.toLowerCase().includes('promoc') || 
     activeWedding?.settings?.eventType?.toLowerCase().includes('promoc') ||
     activeWedding?.coupleNames?.toLowerCase().includes('promoc'));

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

  // Accordion state for optional protocol details (dressCode, accessory, photoshoot)
  const [isProtocolDetailsOpen, setIsProtocolDetailsOpen] = useState(false);

  const defaultCategory = isPromotionEvent ? 'alumnos' : 'invitado';

  const [formData, setFormData] = useState<Partial<Guest>>({
    fullName: '',
    email: '',
    phone: '',
    category: defaultCategory,
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

  // Combined roles list: default + custom (switches to promotion roles for Fiesta de Promoción)
  const allRoles: RoleOption[] = useMemo(() => {
    const baseRoles = isPromotionEvent ? PROMOTION_BUILTIN_ROLES : DEFAULT_BUILTIN_ROLES;
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
    return [...baseRoles, ...customList];
  }, [settings.customGuestRoles, isPromotionEvent]);

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
        category: defaultCategory,
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
    setIsProtocolDetailsOpen(
      Boolean(
        guestToEdit?.photoshootSchedule || 
        guestToEdit?.dressCodeNote || 
        guestToEdit?.accessoryAssigned
      )
    );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#EBEBEB] rounded-3xl w-full max-w-lg md:max-w-4xl lg:max-w-5xl p-3.5 sm:p-4.5 md:p-5 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-transparent my-1 sm:my-2 relative max-h-[94vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-900 p-2 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer z-10"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Header */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 mb-2.5 sm:mb-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] text-gray-800 flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="font-serif-display text-base sm:text-lg font-bold text-gray-900 leading-tight">
              {guestToEdit ? 'Editar Invitado / Rol' : 'Agregar Nuevo Invitado'}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 hidden sm:block">
              Organiza datos personales, asignación de mesa, confirmaciones y rol protocolar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main 2-Column Grid on PC (md:), 1-Column on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3.5 items-start">
            
            {/* ===================== COLUMNA IZQUIERDA (md:col-span-6) ===================== */}
            <div className="md:col-span-6 space-y-2.5 sm:space-y-3">
              
              {/* 1. Datos Personales */}
              <div className="bg-[#EBEBEB] p-2.5 sm:p-3 rounded-2xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2">
                <div className="flex items-center justify-between border-b border-gray-300/40 pb-1">
                  <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                    <span>1. Datos Personales</span>
                  </h4>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                    Nombre Completo <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ej. Carlos Mendoza Garza"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      Teléfono / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+52 81 8394 1122"
                        className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="carlos@ejemplo.com"
                        className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Mesa & Asistencia */}
              <div className="bg-[#EBEBEB] p-2.5 sm:p-3 rounded-2xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2">
                <div className="flex items-center justify-between border-b border-gray-300/40 pb-1">
                  <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-600" />
                    <span>2. Mesa & Asistencia</span>
                  </h4>

                  {guestToEdit && (
                    <button
                      type="button"
                      onClick={() => setIsCompanionModalOpen(true)}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Vincular o registrar un acompañante para este invitado"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Acompañante</span>
                    </button>
                  )}
                </div>

                {/* Notifications */}
                {lastAddedCompanion && (
                  <div className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">
                      Acompañante <strong>{lastAddedCompanion}</strong> registrado(a) con <strong>{formData.assignedTable || 'Mesa por asignar'}</strong>.
                    </span>
                  </div>
                )}

                {companionActionMessage && (
                  <div className="p-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center justify-between animate-fadeIn shadow-2xs">
                    <div className="flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px]">{companionActionMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompanionActionMessage(null)}
                      className="text-amber-700 hover:text-amber-900 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Companions interactive list */}
                {guestToEdit && linkedCompanions.length > 0 && (
                  <div className="p-2 bg-[#FAF8F5] border border-gray-300/40 rounded-xl text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-0.5">
                      <span className="font-bold text-gray-700 flex items-center space-x-1 text-[10px]">
                        <Users className="w-3 h-3 text-emerald-700" />
                        <span>Acompañantes ({linkedCompanions.length} de {maxAllowedCompanions}):</span>
                      </span>
                      <span className="text-[9px] text-gray-500 italic">
                        {formData.assignedTable || 'Mesa por asignar'}
                      </span>
                    </div>

                    <div className="space-y-1 max-h-20 overflow-y-auto pr-0.5">
                      {linkedCompanions.map((comp) => (
                        <div
                          key={comp.id}
                          className="p-1 px-1.5 bg-[#EBEBEB] border border-gray-300/40 rounded-lg flex items-center justify-between gap-1 shadow-2xs"
                        >
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <div className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                              {comp.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-800 truncate text-[11px]">
                              {comp.fullName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              disabled={isProcessingCompanion}
                              onClick={() => handleRemoveCompanionFromTable(comp)}
                              className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-semibold flex items-center space-x-0.5 transition-colors cursor-pointer disabled:opacity-50"
                              title="Desvincular de esta mesa"
                            >
                              <UserMinus className="w-2.5 h-2.5 text-amber-700" />
                              <span>Desvincular</span>
                            </button>
                            <button
                              type="button"
                              disabled={isProcessingCompanion}
                              onClick={() => handleDeleteCompanionGuest(comp)}
                              className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[9px] transition-colors cursor-pointer disabled:opacity-50"
                              title="Eliminar de invitados"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mesa, Pases Total, Estado RSVP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      Nombre de Mesa
                    </label>
                    <select
                      value={formData.assignedTable || 'Mesa por asignar'}
                      onChange={(e) => setFormData({ ...formData, assignedTable: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all cursor-pointer font-medium"
                    >
                      <option value="Mesa por asignar">Mesa por asignar</option>
                      {tables?.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.capacity} pax)
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
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      Pases Asignados
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.totalPasses !== undefined ? formData.totalPasses : 1}
                      onChange={(e) => setFormData({ ...formData, totalPasses: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
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
                      className="w-full px-2 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all font-medium cursor-pointer"
                    >
                      <option value="pending">⏳ Pendiente</option>
                      <option value="confirmed">✅ Confirmado</option>
                      <option value="declined">❌ Declinado</option>
                    </select>
                  </div>
                </div>

                {/* Confirmados Reales y Restricciones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      Pases Confirmados Reales
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={formData.totalPasses || 20}
                      value={formData.confirmedPasses || 0}
                      onChange={(e) => setFormData({ ...formData, confirmedPasses: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      Restricciones / Alergias
                    </label>
                    <input
                      type="text"
                      value={formData.dietaryRestrictions || ''}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                      placeholder="Ej. Celíaco, Vegano, Menú infantil..."
                      className="w-full px-2 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* ===================== COLUMNA DERECHA (md:col-span-6) ===================== */}
            <div className="md:col-span-6 space-y-2.5 sm:space-y-3">
              
              {/* 3. Rol en la Boda & Protocolo */}
              <div className="bg-[#EBEBEB] p-2.5 sm:p-3 rounded-2xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2">
                <div className="flex items-center justify-between border-b border-gray-300/40 pb-1">
                  <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Crown className="w-3.5 h-3.5 text-gray-600" />
                    <span>3. Rol en la Boda</span>
                  </h4>

                  {canManageRoles ? (
                    <button
                      type="button"
                      onClick={() => setIsRoleManagerOpen(!isRoleManagerOpen)}
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                        isRoleManagerOpen
                          ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 border border-gray-400'
                          : 'bg-[#EBEBEB] text-gray-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff]'
                      }`}
                      title="Administrar roles: Añadir, editar o borrar roles de la boda"
                    >
                      <Settings className="w-3 h-3" />
                      <span>{isRoleManagerOpen ? 'Cerrar Gestor' : '⚙️ Gestionar Roles'}</span>
                    </button>
                  ) : (
                    <span className="text-[9px] text-gray-500">
                      🔒 Rol predeterminado
                    </span>
                  )}
                </div>

                {/* Sub-Panel de Gestión de Roles */}
                {isRoleManagerOpen && (
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-gray-300/60 space-y-2 animate-fadeIn shadow-2xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                      <div className="flex items-center space-x-1.5">
                        <Palette className="w-3.5 h-3.5 text-gray-700" />
                        <span className="text-[11px] font-bold text-gray-800">
                          {editingRoleId ? 'Editar Rol' : 'Añadir / Personalizar Roles'}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-500">Admin, Planner & Anfitrión</span>
                    </div>

                    <div className="bg-[#EBEBEB] p-2 rounded-lg border border-gray-300/40 space-y-1.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                            Nombre del Rol <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={roleForm.label}
                            onChange={(e) => setRoleForm({ ...roleForm, label: e.target.value })}
                            placeholder="Ej. Damita de Honor"
                            className="w-full px-2 py-1 text-xs rounded-lg bg-[#EBEBEB] text-gray-800 border border-gray-300/40 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                            Etiqueta Corta (Badge)
                          </label>
                          <input
                            type="text"
                            value={roleForm.shortLabel}
                            onChange={(e) => setRoleForm({ ...roleForm, shortLabel: e.target.value })}
                            placeholder="Ej. Damita"
                            className="w-full px-2 py-1 text-xs rounded-lg bg-[#EBEBEB] text-gray-800 border border-gray-300/40 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                          Descripción del Rol
                        </label>
                        <input
                          type="text"
                          value={roleForm.desc}
                          onChange={(e) => setRoleForm({ ...roleForm, desc: e.target.value })}
                          placeholder="Ej. Acompañamiento en cortejo y ramo infantil"
                          className="w-full px-2 py-1 text-xs rounded-lg bg-[#EBEBEB] text-gray-800 border border-gray-300/40 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                          Color / Tema Visual
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {COLOR_THEMES.map((th, idx) => (
                            <button
                              key={th.id}
                              type="button"
                              onClick={() => setRoleForm({ ...roleForm, themeIndex: idx })}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                                roleForm.themeIndex === idx
                                  ? `${th.badgeClass} ring-2 ring-gray-400`
                                  : 'bg-[#EBEBEB] text-stone-600 border-stone-200 hover:bg-stone-50'
                              }`}
                            >
                              {th.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-0.5">
                        {editingRoleId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRoleId(null);
                              setRoleForm({ label: '', shortLabel: '', desc: '', themeIndex: 0 });
                            }}
                            className="px-2 py-0.5 text-xs text-stone-500 hover:text-stone-700 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveCustomRole}
                          disabled={!roleForm.label.trim()}
                          className="px-2.5 py-1 rounded-lg bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-800 text-xs font-bold hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>{editingRoleId ? 'Guardar Rol' : '+ Añadir Rol'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Roles personalizados activos */}
                    {(settings.customGuestRoles && settings.customGuestRoles.length > 0) && (
                      <div className="space-y-1 pt-0.5 max-h-24 overflow-y-auto pr-0.5">
                        <span className="text-[10px] font-bold text-gray-600 block">Roles Personalizados Activos:</span>
                        {settings.customGuestRoles.map((cr) => (
                          <div
                            key={cr.id}
                            className="p-1 px-1.5 bg-[#EBEBEB] rounded-lg border border-gray-300/40 flex items-center justify-between text-xs shadow-2xs"
                          >
                            <div className="min-w-0 pr-1">
                              <span className="font-bold text-gray-800 block truncate text-[11px]">{cr.label}</span>
                              <span className="text-[9px] text-gray-500 block truncate">{cr.desc || 'Sin descripción'}</span>
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
                                className="p-1 text-stone-500 hover:text-stone-800 rounded cursor-pointer"
                                title="Editar rol"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomRole(cr.id, cr.label)}
                                className="p-1 text-rose-600 hover:text-rose-800 rounded cursor-pointer"
                                title="Eliminar rol"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SELECTOR DE ROLES: Píldoras Horizontales Compactas */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Selecciona Rol / Categoría
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-0.5">
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
                          title={`${opt.label}: ${opt.desc}`}
                          className={`group flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            isSelected
                              ? `${opt.activeColor} shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] ring-1 ring-black/15`
                              : 'bg-[#EBEBEB] text-gray-700 border-gray-300/40 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}`} />
                          <span className={`truncate text-[11px] ${isSelected ? 'text-white font-bold' : 'text-gray-800'}`}>
                            {opt.shortLabel || opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Título / Detalle Específico del Rol */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                    Título / Detalle Específico del Rol
                  </label>
                  <input
                    type="text"
                    value={formData.protocolRoleTitle || ''}
                    onChange={(e) => setFormData({ ...formData, protocolRoleTitle: e.target.value })}
                    placeholder="Ej. Damita de Honor, Padrino de Velación, Paje de Anillos..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all"
                  />
                </div>

                {/* Horario Especial de Llegada con Popover de Cronograma */}
                <div className="relative" ref={timelinePickerRef}>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Horario Especial de Llegada
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsTimelinePickerOpen(!isTimelinePickerOpen)}
                      className="text-[10px] text-gray-700 font-bold flex items-center space-x-1 cursor-pointer bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:shadow-[3px_3px_6px_#c8c8c8,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] px-2 py-0.5 rounded-lg transition-all"
                      title="Seleccionar horario desde el Cronograma de la boda"
                    >
                      <Calendar className="w-3 h-3 text-gray-600" />
                      <span>{timeline && timeline.length > 0 ? `Hitos (${timeline.length})` : 'Elegir hito'}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>

                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={formData.specialArrivalTime || ''}
                      onChange={(e) => setFormData({ ...formData, specialArrivalTime: e.target.value })}
                      placeholder={timeline && timeline.length > 0 ? "Ej. 16:30 hrs (Ceremonia) o escribe manual" : "Ej. 15:30 hrs (Recepción)"}
                      className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden focus:shadow-[inset_4px_4px_8px_#c8c8c8,inset_-4px_-4px_8px_#ffffff] transition-all"
                    />
                    {formData.specialArrivalTime && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, specialArrivalTime: '', assignedMilestone: '' })}
                        className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                        title="Limpiar horario"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Popover de Hitos del Cronograma */}
                  {isTimelinePickerOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_16px_#b8b8b8,-6px_-6px_16px_#ffffff] border border-gray-300/40 p-2.5 space-y-1.5 max-h-52 overflow-y-auto animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-gray-300/40 pb-1">
                        <span className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-600" />
                          <span>Hitos del Cronograma ({timeline?.length || 0})</span>
                        </span>
                        <span className="text-[10px] text-gray-500">Clic para asignar</span>
                      </div>

                      {timeline && timeline.length > 0 ? (
                        <div className="space-y-1">
                          {timeline.map((m) => (
                            <div
                              key={m.id}
                              className="p-1.5 rounded-xl border border-transparent hover:border-gray-300/40 hover:bg-[#FAF8F5] transition-all text-xs flex flex-col gap-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-800 flex items-center space-x-1.5">
                                  <span className="px-1.5 py-0.5 rounded-md bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] text-gray-900 text-[10px] font-mono font-bold">
                                    {m.time}
                                  </span>
                                  <span className="truncate text-xs">{m.title}</span>
                                </span>
                                {m.location && (
                                  <span className="text-[9px] text-gray-500 truncate max-w-[120px]">{m.location}</span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleSelectMilestone(m, 0)}
                                  className="px-1.5 py-0.5 rounded-md bg-[#EBEBEB] hover:shadow-[2px_2px_4px_#c8c8c8,-2px_-2px_4px_#ffffff] text-gray-700 text-[9px] font-semibold transition-colors cursor-pointer"
                                >
                                  A la hora ({m.time})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMilestone(m, -15)}
                                  className="px-1.5 py-0.5 rounded-md bg-[#EBEBEB] hover:shadow-[2px_2px_4px_#c8c8c8,-2px_-2px_4px_#ffffff] text-gray-700 text-[9px] font-semibold transition-colors cursor-pointer"
                                >
                                  -15 min
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMilestone(m, -30)}
                                  className="px-1.5 py-0.5 rounded-md bg-[#EBEBEB] hover:shadow-[2px_2px_4px_#c8c8c8,-2px_-2px_4px_#ffffff] text-gray-700 text-[9px] font-semibold transition-colors cursor-pointer"
                                >
                                  -30 min
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMilestone(m, -60)}
                                  className="px-1.5 py-0.5 rounded-md bg-[#EBEBEB] hover:shadow-[2px_2px_4px_#c8c8c8,-2px_-2px_4px_#ffffff] text-gray-700 text-[9px] font-semibold transition-colors cursor-pointer"
                                >
                                  -1 hora
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-gray-500 text-xs">
                          <p className="font-medium">No hay hitos en el Cronograma aún.</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Puedes ingresar el horario de forma manual en el campo.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SECCIÓN COLAPSABLE: Detalles Adicionales de Protocolo (Vestuario, Accesorio, Fotos) */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsProtocolDetailsOpen(!isProtocolDetailsOpen)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs font-semibold text-gray-700 transition-all cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                      <span>Detalles Adicionales de Protocolo</span>
                      {(formData.photoshootSchedule || formData.dressCodeNote || formData.accessoryAssigned) && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" title="Contiene detalles guardados" />
                      )}
                    </span>
                    {isProtocolDetailsOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                    )}
                  </button>

                  {isProtocolDetailsOpen && (
                    <div className="mt-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-gray-300/40 space-y-2 animate-fadeIn shadow-2xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                          Sesión de Fotos / Ensayo
                        </label>
                        <input
                          type="text"
                          value={formData.photoshootSchedule || ''}
                          onChange={(e) => setFormData({ ...formData, photoshootSchedule: e.target.value })}
                          placeholder="Ej. Sábado 16:00 hrs en Jardines"
                          className="w-full px-2.5 py-1 text-xs rounded-lg bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                            Nota de Vestuario / Paleta
                          </label>
                          <input
                            type="text"
                            value={formData.dressCodeNote || ''}
                            onChange={(e) => setFormData({ ...formData, dressCodeNote: e.target.value })}
                            placeholder="Ej. Corbata Champagne Dorado"
                            className="w-full px-2.5 py-1 text-xs rounded-lg bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                            Accesorio / Boutonniere
                          </label>
                          <input
                            type="text"
                            value={formData.accessoryAssigned || ''}
                            onChange={(e) => setFormData({ ...formData, accessoryAssigned: e.target.value })}
                            placeholder="Ej. Boutonniere Rosa Blanca #1"
                            className="w-full px-2.5 py-1 text-xs rounded-lg bg-[#EBEBEB] text-gray-800 placeholder-gray-400 border border-gray-300/40 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end space-x-2.5 pt-2 sm:pt-2.5 border-t border-gray-300/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 hover:text-gray-900 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 sm:px-6 py-2 rounded-2xl text-xs font-bold text-gray-900 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Guardar Cambios</span>
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
