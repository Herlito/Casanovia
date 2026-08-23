import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TimelineMilestone } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { formatAltibajas } from '../../lib/formatUtils';
import { 
  X, 
  Clock, 
  MapPin, 
  Milestone, 
  Sparkles, 
  User, 
  Users,
  Building2, 
  UserCheck, 
  Crown, 
  Plus, 
  Search, 
  Check, 
  HeartHandshake,
  MapPinned,
  Briefcase 
} from 'lucide-react';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestoneData: any) => void;
  milestoneToEdit?: TimelineMilestone | null;
}

interface SuggestionOption {
  id: string;
  name: string;
  role: string;
  type: 'planner' | 'novios' | 'vendor' | 'guest';
  formatted: string;
  roleFormatted?: string;
  contactNameOnly?: string;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  milestoneToEdit,
}) => {
  const { guests, vendors, settings, activeWedding, currentUser, addAdditionalVenue } = useWedding();

  // Build available venues list strictly from Wedding Settings (ceremonyVenue, receptionVenue, additionalVenues)
  const availableVenues = useMemo(() => {
    const list: { name: string; type?: string; source: 'ceremony' | 'reception' | 'additional' }[] = [];
    const seen = new Set<string>();

    const addVenueItem = (name: string, type?: string, source: 'ceremony' | 'reception' | 'additional' = 'additional') => {
      const trimmed = name?.trim();
      if (trimmed && !seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase());
        list.push({ name: trimmed, type, source });
      }
    };

    // 1. Settings ceremony venue
    if (settings.ceremonyVenue?.name) {
      addVenueItem(settings.ceremonyVenue.name, 'Ceremonia Religiosa', 'ceremony');
    }

    // 2. Settings reception venue
    if (settings.receptionVenue?.name) {
      addVenueItem(settings.receptionVenue.name, 'Recepción & Banquete', 'reception');
    }

    // 3. Settings additional venues
    if (settings.additionalVenues && Array.isArray(settings.additionalVenues)) {
      settings.additionalVenues.forEach((v) => {
        if (v.name) {
          addVenueItem(v.name, v.type || 'Sede Adicional', 'additional');
        }
      });
    }

    return list;
  }, [settings]);

  const [formData, setFormData] = useState<Partial<TimelineMilestone>>({
    time: '18:00',
    title: '',
    location: '',
    description: '',
    category: 'protocolo',
    responsiblePerson: '',
    isProtocolCrucial: true,
    dressOrItemsRequired: '',
  });

  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [selectedSuggestionTab, setSelectedSuggestionTab] = useState<'all' | 'planner_novios' | 'vendors' | 'guests'>('all');
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  // New location inline adder state
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState('Hospedaje / Preparación');
  const [isSavingNewLocation, setIsSavingNewLocation] = useState(false);

  useEffect(() => {
    if (milestoneToEdit) {
      setFormData({
        ...milestoneToEdit,
        location: milestoneToEdit.location || '',
      });
    } else {
      const defaultVenue = settings.ceremonyVenue?.name || settings.receptionVenue?.name || settings.additionalVenues?.[0]?.name || availableVenues[0]?.name || '';
      setFormData({
        time: '20:30',
        title: '',
        location: defaultVenue,
        description: '',
        category: 'protocolo',
        responsiblePerson: '',
        isProtocolCrucial: true,
        dressOrItemsRequired: '',
      });
    }
    setShowSuggestionsDropdown(false);
    setShowAddLocationModal(false);
    setNewLocationName('');
  }, [milestoneToEdit, isOpen, settings]);

  const handleSaveNewLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    setIsSavingNewLocation(true);
    try {
      const createdVenue = await addAdditionalVenue({
        name: newLocationName.trim(),
        type: newLocationType,
      });
      setFormData((prev) => ({ ...prev, location: createdVenue.name }));
      setShowAddLocationModal(false);
      setNewLocationName('');
    } catch (err) {
      console.error('Error saving new venue:', err);
      // fallback set in form
      setFormData((prev) => ({ ...prev, location: newLocationName.trim() }));
      setShowAddLocationModal(false);
    } finally {
      setIsSavingNewLocation(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Build comprehensive suggestions pool from Planner, Novios, Vendors, and Guests
  const allSuggestions = useMemo<SuggestionOption[]>(() => {
    const list: SuggestionOption[] = [];

    // 1. Wedding Planner & Novios (strictly use assigned plannerName or logged in planner, no dummy fallback)
    const brideName = settings.brideName || 'Novia';
    const groomName = settings.groomName || 'Novio';
    
    // Resolve real planner name: activeWedding.plannerName -> createdByUserName -> currentUser (if level 3) -> empty
    const realPlanner = activeWedding?.plannerName?.trim() || 
                        activeWedding?.createdByUserName?.trim() || 
                        (currentUser?.level === 3 ? currentUser.roleTitle || currentUser.username : '');

    if (realPlanner) {
      const formattedPlannerName = formatAltibajas(realPlanner);
      list.push({
        id: 'sug-wp',
        name: formattedPlannerName,
        role: 'Wedding Planner / Coordinador General',
        type: 'planner',
        formatted: formattedPlannerName,
        roleFormatted: 'Wedding Planner',
        contactNameOnly: formattedPlannerName,
      });
    } else {
      list.push({
        id: 'sug-wp-generic',
        name: 'Wedding Planner',
        role: 'Coordinador General',
        type: 'planner',
        formatted: 'Wedding Planner',
        roleFormatted: 'Wedding Planner',
        contactNameOnly: 'Wedding Planner',
      });
    }

    list.push({
      id: 'sug-bride',
      name: brideName,
      role: 'Novia',
      type: 'novios',
      formatted: brideName,
      roleFormatted: 'Novia',
      contactNameOnly: brideName,
    });

    list.push({
      id: 'sug-groom',
      name: groomName,
      role: 'Novio',
      type: 'novios',
      formatted: groomName,
      roleFormatted: 'Novio',
      contactNameOnly: groomName,
    });

    list.push({
      id: 'sug-couple',
      name: `${brideName} & ${groomName}`,
      role: 'Novios (Ambos)',
      type: 'novios',
      formatted: `${brideName} & ${groomName}`,
      roleFormatted: 'Novios',
      contactNameOnly: `${brideName} & ${groomName}`,
    });

    // 2. Proveedores (Vendors)
    // Rule: When selecting vendor, ONLY insert the "Persona de Contacto / Asesor" without supplier company name
    vendors.forEach((v) => {
      if (v.name || v.contactPerson) {
        const contactName = v.contactPerson?.trim() ? formatAltibajas(v.contactPerson.trim()) : formatAltibajas(v.name.trim());
        const roleCategory = v.category?.trim() || 'Proveedor';
        
        list.push({
          id: `sug-vendor-${v.id}`,
          name: contactName,
          role: `${roleCategory} (${v.name})`,
          type: 'vendor',
          // Primary insert value: ONLY the Contact Person / Advisor
          formatted: contactName,
          // Role insert value: Category / Role of provider
          roleFormatted: roleCategory,
          contactNameOnly: contactName,
        });
      }
    });

    // 3. Invitados & Cortejo (Guests)
    guests.forEach((g) => {
      const isProtocol = g.isProtocolParticipant;
      const role = g.protocolRoleTitle || (g.category === 'cortejo_honor' ? 'Cortejo de Honor' : g.category === 'anfitrion' ? 'Anfitrión' : 'Invitado');
      const contactName = formatAltibajas(g.fullName);
      
      list.push({
        id: `sug-guest-${g.id}`,
        name: contactName,
        role: role,
        type: 'guest',
        formatted: isProtocol && g.protocolRoleTitle ? `${contactName} (${g.protocolRoleTitle})` : contactName,
        roleFormatted: role,
        contactNameOnly: contactName,
      });
    });

    return list;
  }, [guests, vendors, settings, activeWedding, currentUser]);

  // Filter suggestions based on typed input
  const filteredSuggestions = useMemo(() => {
    const rawInput = (formData.responsiblePerson || '').trim().toLowerCase();
    
    // If the input has commas or "&", match with the last segment
    const lastTerm = rawInput.split(/[,&]/).pop()?.trim().toLowerCase() || '';

    return allSuggestions.filter((item) => {
      // Filter by category tab
      if (selectedSuggestionTab === 'planner_novios' && item.type !== 'planner' && item.type !== 'novios') return false;
      if (selectedSuggestionTab === 'vendors' && item.type !== 'vendor') return false;
      if (selectedSuggestionTab === 'guests' && item.type !== 'guest') return false;

      // Filter by search text
      if (!lastTerm) return true;
      return (
        item.name.toLowerCase().includes(lastTerm) ||
        item.role.toLowerCase().includes(lastTerm) ||
        item.formatted.toLowerCase().includes(lastTerm) ||
        (item.roleFormatted && item.roleFormatted.toLowerCase().includes(lastTerm))
      );
    });
  }, [allSuggestions, formData.responsiblePerson, selectedSuggestionTab]);

  const handleSelectSuggestion = (suggestion: SuggestionOption, appendMode: boolean = false, byRole: boolean = false) => {
    const textToInsert = byRole && suggestion.roleFormatted ? suggestion.roleFormatted : suggestion.formatted;
    const current = (formData.responsiblePerson || '').trim();
    
    if (!current || !appendMode) {
      setFormData({ ...formData, responsiblePerson: textToInsert });
    } else {
      // Check if user is typing after a comma or ampersand
      const hasTrailingSeparator = /[,&]\s*$/.test(current);
      const newText = hasTrailingSeparator 
        ? `${current} ${textToInsert}`
        : `${current} & ${textToInsert}`;
      setFormData({ ...formData, responsiblePerson: newText });
    }
    setShowSuggestionsDropdown(false);
  };

  // Split multiple participants by '&' or ',' for removable chip buttons
  const currentParticipants = useMemo(() => {
    if (!formData.responsiblePerson || !formData.responsiblePerson.trim()) return [];
    return formData.responsiblePerson
      .split(/[,&]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [formData.responsiblePerson]);

  const handleRemoveParticipant = (indexToRemove: number) => {
    const updated = currentParticipants.filter((_, idx) => idx !== indexToRemove);
    setFormData({
      ...formData,
      responsiblePerson: updated.join(' & ')
    });
  };

  const handleClearAllParticipants = () => {
    setFormData({
      ...formData,
      responsiblePerson: ''
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.time?.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8DCCF] relative my-6 max-h-[94vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C827A] hover:text-[#2D2A26] p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#8B3A4A] text-white flex items-center justify-center shadow-xs">
            <Milestone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#2D2A26]">
              {milestoneToEdit ? 'Editar Hito del Cronograma' : 'Nuevo Hito en el Minuto a Minuto'}
            </h3>
            <p className="text-xs text-[#7A7268]">
              Organiza la secuencia temporal y asigna responsables directos del cortejo, proveedores o wedding planner
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Hora (24 hrs) <span className="text-[#8B3A4A]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.time || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="Ej. 20:30"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] font-mono focus:border-[#8B3A4A] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Título del Momento / Hito <span className="text-[#8B3A4A]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej. Brindis de Honor y Palabras"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-[#8B3A4A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Ubicación / Espacio */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#524B42] flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8A9A86]" />
                  <span>Ubicación / Espacio</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(true)}
                  className="text-[11px] font-bold text-[#8B3A4A] hover:text-[#6E2937] flex items-center space-x-0.5 cursor-pointer"
                  title="Añadir una nueva sede o lugar a la lista"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Agregar Lugar</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  list="wedding-venues-list"
                  value={formData.location || ''}
                  onChange={(e) => {
                    if (e.target.value === '__add_new_venue__') {
                      setShowAddLocationModal(true);
                    } else {
                      setFormData({ ...formData, location: e.target.value });
                    }
                  }}
                  placeholder="Elige o escribe: Hotel Casa Grande, Iglesia..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-[#8B3A4A] focus:outline-none"
                />

                <datalist id="wedding-venues-list">
                  {availableVenues.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.type ? `(${v.type})` : ''}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Quick Select Venue Chips */}
              <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                {availableVenues.slice(0, 4).map((v) => {
                  const isSelected = formData.location === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, location: v.name })}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer truncate max-w-[170px] ${
                        isSelected
                          ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] font-bold'
                          : 'bg-[#FAF7F2] border-[#E8DCCF] text-[#524B42] hover:bg-[#EFE7DE]'
                      }`}
                      title={v.name}
                    >
                      📍 {v.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Fase / Categoría
              </label>
              <select
                value={formData.category || 'protocolo'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-[#8B3A4A] focus:outline-none"
              >
                <option value="preparacion">Preparación</option>
                <option value="ceremonia">Ceremonia Religiosa</option>
                <option value="ceremonia_civil">Ceremonia Civil</option>
                <option value="coctel">Cóctel de Bienvenida</option>
                <option value="sesion_fotos">Sesión de Fotos</option>
                <option value="recepcion">Recepción & Banquete</option>
                <option value="servir_alimentos">Servir Alimentos</option>
                <option value="saludo_mesas">Saludo mesa x mesa</option>
                <option value="protocolo">Protocolo y Brindis</option>
                <option value="baile_novios_familia">Baile Novios y Familia</option>
                <option value="fiesta">Fiesta y Baile</option>
              </select>
            </div>
          </div>

          {/* Campo: Persona(s) Responsable o Participante Clave con Autocompletado */}
          <div ref={suggestionsContainerRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#524B42]">
                Persona(s) Responsable o Participante Clave
              </label>
              <span className="text-[11px] text-[#8C8276]">
                Escribe o selecciona proveedores, invitados o wedding planner
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                list="responsible-persons-list"
                value={formData.responsiblePerson || ''}
                onFocus={() => setShowSuggestionsDropdown(true)}
                onChange={(e) => {
                  setFormData({ ...formData, responsiblePerson: e.target.value });
                  setShowSuggestionsDropdown(true);
                }}
                placeholder="Ej. Carlos Mendoza (Padrino), Lumière Studio (Fotografía), Wedding Planner..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] focus:outline-none pr-14"
              />
              {formData.responsiblePerson && (
                <button
                  type="button"
                  onClick={handleClearAllParticipants}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-[#8C8276] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Dejar en blanco"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSuggestionsDropdown(!showSuggestionsDropdown)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8C8276] hover:text-[#8B3A4A] cursor-pointer"
                title="Ver sugerencias de responsables"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Removable Participant Chips & Clear Option Underneath */}
            {currentParticipants.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                {currentParticipants.map((person, idx) => (
                  <button
                    key={`${person}-${idx}`}
                    type="button"
                    onClick={() => handleRemoveParticipant(idx)}
                    className="text-[10px] px-2 py-0.5 rounded-md border bg-[#FAF7F2] border-[#E8DCCF] text-[#524B42] hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all cursor-pointer inline-flex items-center gap-1 group max-w-[220px]"
                    title={`Clic para quitar a "${person}"`}
                  >
                    <span className="truncate">👤 {person}</span>
                    <X className="w-2.5 h-2.5 text-[#8C8276] group-hover:text-rose-600 shrink-0 ml-0.5" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleClearAllParticipants}
                  className="text-[10px] px-2 py-0.5 rounded-md border bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer inline-flex items-center gap-1 font-medium"
                  title="Quitar todos y dejar el casillero en blanco"
                >
                  <X className="w-2.5 h-2.5 text-rose-600" />
                  <span>Dejar en blanco</span>
                </button>
              </div>
            )}

            {/* Native Datalist Fallback */}
            <datalist id="responsible-persons-list">
              {allSuggestions.map((s) => (
                <option key={s.id} value={s.formatted}>
                  {s.role}
                </option>
              ))}
            </datalist>

            {/* Interactive Suggestions Popover Panel */}
            {showSuggestionsDropdown && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[#D9CEBF] p-3 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[#F0EAE1] overflow-x-auto text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestionTab('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 cursor-pointer ${
                      selectedSuggestionTab === 'all'
                        ? 'bg-[#8B3A4A] text-white'
                        : 'bg-[#F4EFEA] text-[#524B42] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    Todos ({allSuggestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestionTab('planner_novios')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                      selectedSuggestionTab === 'planner_novios'
                        ? 'bg-[#8B3A4A] text-white'
                        : 'bg-[#F4EFEA] text-[#524B42] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Crown className="w-3 h-3" />
                    <span>Planner & Novios</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestionTab('vendors')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                      selectedSuggestionTab === 'vendors'
                        ? 'bg-[#8B3A4A] text-white'
                        : 'bg-[#F4EFEA] text-[#524B42] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    <span>Proveedores ({vendors.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestionTab('guests')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                      selectedSuggestionTab === 'guests'
                        ? 'bg-[#8B3A4A] text-white'
                        : 'bg-[#F4EFEA] text-[#524B42] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Invitados & Cortejo ({guests.length})</span>
                  </button>
                </div>

                {/* Suggestions List */}
                <div className="space-y-1">
                  {filteredSuggestions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#8C8276] italic">
                      No se encontraron coincidencias. Puedes escribir el nombre manualmente.
                    </div>
                  ) : (
                    filteredSuggestions.slice(0, 15).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAF7F2] transition-colors group cursor-pointer"
                        onClick={() => handleSelectSuggestion(item, false)}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {item.type === 'planner' && (
                            <span className="w-6 h-6 rounded-md bg-[#8B3A4A]/10 text-[#8B3A4A] flex items-center justify-center shrink-0">
                              <Crown className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {item.type === 'novios' && (
                            <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                              <HeartHandshake className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {item.type === 'vendor' && (
                            <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                              <Building2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {item.type === 'guest' && (
                            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#2D2A26] truncate">
                              {item.name}
                            </p>
                            <span className="text-[10px] text-[#7A7268] block truncate">
                              {item.role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100">
                          {/* Seleccionar por Nombre */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSuggestion(item, false, false);
                            }}
                            className="px-2 py-1 bg-white border border-[#D9CEBF] text-[#524B42] hover:bg-[#8B3A4A] hover:text-white rounded-md text-[10px] font-medium transition-colors"
                            title={`Seleccionar por Nombre: ${item.formatted}`}
                          >
                            Por Nombre
                          </button>
                          
                          {/* Seleccionar por Rol si tiene rol específico */}
                          {item.roleFormatted && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSuggestion(item, false, true);
                              }}
                              className="px-2 py-1 bg-[#FAF7F2] border border-[#D9CEBF] text-[#8B3A4A] hover:bg-[#8B3A4A] hover:text-white rounded-md text-[10px] font-medium transition-colors"
                              title={`Seleccionar por Rol: ${item.roleFormatted}`}
                            >
                              Por Rol
                            </button>
                          )}

                          {formData.responsiblePerson && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSuggestion(item, true, false);
                              }}
                              className="px-2 py-1 bg-[#FAF8F5] border border-[#D9CEBF] text-[#8B3A4A] hover:bg-[#8B3A4A] hover:text-white rounded-md text-[10px] font-medium transition-colors flex items-center gap-0.5"
                              title="Añadir a la lista de responsables actuales"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Añadir</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1">
              Descripción Detallada / Indicaciones
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Instrucciones precisas para DJ, fotógrafos, padrinos y coordinadores..."
              className="w-full p-2.5 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-[#8B3A4A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1">
              Elementos o Utilería Necesaria
            </label>
            <input
              type="text"
              value={formData.dressOrItemsRequired || ''}
              onChange={(e) => setFormData({ ...formData, dressOrItemsRequired: e.target.value })}
              placeholder="Ej. Copas grabadas, bengalas, micrófono inalámbrico, etc."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-[#8B3A4A] focus:outline-none"
            />
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E8DCCF] flex items-center space-x-2">
            <input
              type="checkbox"
              id="check-is-protocol"
              checked={formData.isProtocolCrucial ?? true}
              onChange={(e) => setFormData({ ...formData, isProtocolCrucial: e.target.checked })}
              className="w-4 h-4 rounded-sm text-[#8B3A4A] accent-[#8B3A4A] cursor-pointer"
            />
            <label htmlFor="check-is-protocol" className="text-xs text-[#2D2A26] font-medium cursor-pointer">
              Marcar como <span className="font-bold text-[#8B3A4A]">Hito Protocolar Clave</span> (Aparece destacado en la Hoja Protocolar del Wedding Planner)
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E8DCCF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#8B3A4A] hover:bg-[#6E2937] transition-colors cursor-pointer shadow-xs"
            >
              Guardar Hito
            </button>
          </div>
        </form>

        {/* Modal: + Agregar Lugar / Sede Rápida */}
        {showAddLocationModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D9CEBF] relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#8B3A4A]/10 text-[#8B3A4A] flex items-center justify-center">
                    <MapPinned className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif-display text-base font-bold text-[#2D2A26]">
                      + Agregar Nuevo Lugar / Sede
                    </h4>
                    <p className="text-[11px] text-[#7A7268]">
                      Se guardará en los ajustes de la boda y estará disponible para todos los hitos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="text-[#8C827A] hover:text-[#2D2A26] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNewLocation} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Nombre del Lugar / Recinto <span className="text-[#8B3A4A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="Ej. Hotel Casa Grande - Vallecito, Capilla San Francisco..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-[#8B3A4A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Tipo de Sede / Uso
                  </label>
                  <select
                    value={newLocationType}
                    onChange={(e) => setNewLocationType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-[#8B3A4A] focus:outline-none"
                  >
                    <option value="Hospedaje / Preparación">Hospedaje / Preparación (Getting Ready)</option>
                    <option value="Ceremonia Religiosa">Ceremonia Religiosa</option>
                    <option value="Ceremonia Civil">Ceremonia Civil</option>
                    <option value="Sesión de Fotos">Sesión de Fotos</option>
                    <option value="Recepción & Banquete">Recepción & Banquete</option>
                    <option value="Cóctel & Bienvenida">Cóctel & Bienvenida</option>
                    <option value="After Party / Tornaboda">After Party / Tornaboda</option>
                    <option value="Otro">Otro espacio</option>
                  </select>
                </div>

                {/* Quick suggestions chips in modal */}
                <div className="pt-1">
                  <span className="text-[10px] text-[#8C8276] font-medium block mb-1">Ejemplos sugeridos:</span>
                  <div className="flex flex-wrap gap-1">
                    {['Hotel Casa Grande - Vallecito', 'Iglesia Santa Marta', 'Jardines de Sabandía'].map((suggested) => (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() => setNewLocationName(suggested)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DCCF] text-[#524B42] hover:bg-[#EAE2D8] transition-colors cursor-pointer"
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8DCCF]">
                  <button
                    type="button"
                    onClick={() => setShowAddLocationModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingNewLocation || !newLocationName.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#8B3A4A] hover:bg-[#6E2937] disabled:opacity-50 transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    {isSavingNewLocation ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar y Asignar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

