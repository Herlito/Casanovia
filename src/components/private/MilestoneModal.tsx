import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TimelineMilestone } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { formatAltibajas, splitParticipants } from '../../lib/formatUtils';
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

    // 1. Settings ceremony venue (solo si tiene ceremonia religiosa habilitada)
    if (settings.hasReligiousCeremony !== false && settings.ceremonyVenue?.name) {
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
    isProtocolCrucial: false,
    dressOrItemsRequired: '',
  });

  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [selectedSuggestionTab, setSelectedSuggestionTab] = useState<'all' | 'planner_novios' | 'vendors' | 'guests'>('vendors');
  const [suggestionSearch, setSuggestionSearch] = useState('');
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
        isProtocolCrucial: Boolean(milestoneToEdit.isProtocolCrucial),
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
        isProtocolCrucial: false,
        dressOrItemsRequired: '',
      });
    }
    setShowSuggestionsDropdown(false);
    setSelectedSuggestionTab('vendors');
    setSuggestionSearch('');
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
    vendors.forEach((v) => {
      if (v.name || v.contactPerson) {
        const contactName = v.contactPerson?.trim() ? formatAltibajas(v.contactPerson.trim()) : formatAltibajas(v.name.trim());
        const companyName = v.name?.trim() ? formatAltibajas(v.name.trim()) : '';
        const roleCategory = v.category?.trim() || 'Proveedor';
        
        const formattedFull = v.contactPerson?.trim() && companyName && v.contactPerson.trim().toLowerCase() !== companyName.toLowerCase()
          ? `${contactName} (${companyName}) [${roleCategory}]`
          : (companyName ? `${companyName} [${roleCategory}]` : contactName);

        list.push({
          id: `sug-vendor-${v.id}`,
          name: contactName,
          role: `${roleCategory}${companyName && companyName !== contactName ? ` • ${companyName}` : ''}`,
          type: 'vendor',
          formatted: formattedFull,
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

  // Filter suggestions based on selected tab and search input
  const filteredSuggestions = useMemo(() => {
    const search = suggestionSearch.trim().toLowerCase();

    return allSuggestions.filter((item) => {
      // Filter by category tab
      if (selectedSuggestionTab === 'planner_novios' && item.type !== 'planner' && item.type !== 'novios') return false;
      if (selectedSuggestionTab === 'vendors' && item.type !== 'vendor') return false;
      if (selectedSuggestionTab === 'guests' && item.type !== 'guest') return false;

      // Filter by search text
      if (!search) return true;
      return (
        item.name.toLowerCase().includes(search) ||
        item.role.toLowerCase().includes(search) ||
        item.formatted.toLowerCase().includes(search) ||
        (item.roleFormatted && item.roleFormatted.toLowerCase().includes(search))
      );
    });
  }, [allSuggestions, selectedSuggestionTab, suggestionSearch]);

  // Split multiple participants by '&' or ',' outside brackets/parens
  const currentParticipants = useMemo(() => {
    return splitParticipants(formData.responsiblePerson || '');
  }, [formData.responsiblePerson]);

  const isParticipantAdded = (suggestion: SuggestionOption) => {
    const sName = suggestion.name.toLowerCase();
    const sFormatted = suggestion.formatted.toLowerCase();
    const sContact = (suggestion.contactNameOnly || '').toLowerCase();
    return currentParticipants.some((p) => {
      const pLower = p.toLowerCase();
      return pLower === sFormatted || pLower === sName || (sContact && pLower === sContact) || pLower.includes(sName);
    });
  };

  const handleSelectSuggestion = (suggestion: SuggestionOption, customText?: string) => {
    const textToInsert = customText || suggestion.formatted;
    const currentList = splitParticipants(formData.responsiblePerson || '');

    // Check if participant is already present
    const existingIndex = currentList.findIndex(
      (p) => p.toLowerCase() === textToInsert.toLowerCase() ||
             p.toLowerCase() === suggestion.name.toLowerCase() ||
             (suggestion.contactNameOnly && p.toLowerCase() === suggestion.contactNameOnly.toLowerCase())
    );

    if (existingIndex >= 0) {
      // Toggle off if already in list
      const updated = currentList.filter((_, idx) => idx !== existingIndex);
      setFormData((prev) => ({
        ...prev,
        responsiblePerson: updated.join(' & '),
      }));
    } else {
      // Add maintaining all previous ones
      const updated = [...currentList, textToInsert];
      setFormData((prev) => ({
        ...prev,
        responsiblePerson: updated.join(' & '),
      }));
    }
  };

  const handleRemoveParticipant = (indexToRemove: number) => {
    const updated = currentParticipants.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({
      ...prev,
      responsiblePerson: updated.join(' & '),
    }));
  };

  const handleClearAllParticipants = () => {
    setFormData((prev) => ({
      ...prev,
      responsiblePerson: '',
    }));
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
      <div className="bg-[#EBEBEB] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-transparent relative my-6 max-h-[94vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C827A] hover:text-[#2D2A26] p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] flex items-center justify-center shadow-xs">
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
                Hora (24 hrs) <span className="text-[#2D3748]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.time || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="Ej. 20:30"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] font-mono focus:border-transparent focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Título del Momento / Hito <span className="text-[#2D3748]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej. Brindis de Honor y Palabras"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-transparent focus:outline-none"
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
                  className="text-[11px] font-bold text-[#2D3748] hover:text-[#2D3748] flex items-center space-x-0.5 cursor-pointer"
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-transparent focus:outline-none"
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
                          ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent font-bold'
                          : 'bg-[#EBEBEB] border-transparent text-[#524B42] hover:bg-[#EFE7DE]'
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
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-transparent focus:outline-none"
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
                onFocus={() => {
                  setSelectedSuggestionTab('vendors');
                  setShowSuggestionsDropdown(true);
                }}
                onClick={() => {
                  setSelectedSuggestionTab('vendors');
                  setShowSuggestionsDropdown(true);
                }}
                onChange={(e) => {
                  setFormData({ ...formData, responsiblePerson: e.target.value });
                }}
                placeholder="Ej. Carlos Mendoza (Padrino), Lumière Studio (Fotografía), Wedding Planner..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-transparent focus:ring-1 focus:ring-[#d1d1d1] focus:outline-none pr-14 cursor-pointer"
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
                onClick={() => {
                  if (!showSuggestionsDropdown) {
                    setSelectedSuggestionTab('vendors');
                  }
                  setShowSuggestionsDropdown(!showSuggestionsDropdown);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8C8276] hover:text-[#2D3748] cursor-pointer"
                title="Ver proveedores y responsables"
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
                    className="text-[10px] px-2 py-0.5 rounded-md border bg-[#EBEBEB] border-transparent text-[#524B42] hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all cursor-pointer inline-flex items-center gap-1 group max-w-[260px]"
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
              <div className="absolute z-20 left-0 right-0 mt-1 bg-[#EBEBEB] rounded-xl shadow-xl border border-[#D9CEBF] p-3 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {/* Header with Done button */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0EAE1]">
                  <span className="text-[11px] font-semibold text-[#524B42]">
                    Selecciona para agregar uno o más responsables:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestionsDropdown(false)}
                    className="px-2.5 py-1 rounded-md bg-[#2D3748] text-white text-[11px] font-semibold hover:bg-[#1A202C] transition-colors cursor-pointer"
                  >
                    Listo (Cerrar)
                  </button>
                </div>

                {/* Category Filter Tabs - Default to Proveedores */}
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[#F0EAE1] overflow-x-auto text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestionTab('vendors')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                      selectedSuggestionTab === 'vendors'
                        ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] font-bold'
                        : 'bg-[#F4EFEA] text-[#524B42] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    <span>Proveedores ({vendors.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestionTab('planner_novios')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                      selectedSuggestionTab === 'planner_novios'
                        ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] font-bold'
                        : 'bg-[#F4EFEA] text-[#524B42] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Crown className="w-3 h-3" />
                    <span>Planner & Novios</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestionTab('guests')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                      selectedSuggestionTab === 'guests'
                        ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] font-bold'
                        : 'bg-[#F4EFEA] text-[#524B42] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Invitados ({guests.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestionTab('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 cursor-pointer ${
                      selectedSuggestionTab === 'all'
                        ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] font-bold'
                        : 'bg-[#F4EFEA] text-[#524B42] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    Todos ({allSuggestions.length})
                  </button>
                </div>

                {/* Search Bar inside popover */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-[#8C8276] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={suggestionSearch}
                    onChange={(e) => setSuggestionSearch(e.target.value)}
                    placeholder={
                      selectedSuggestionTab === 'vendors'
                        ? 'Filtrar proveedores por nombre o rubro (foto, video, dj)...'
                        : 'Buscar en la lista...'
                    }
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#d1d1d1]"
                  />
                  {suggestionSearch && (
                    <button
                      type="button"
                      onClick={() => setSuggestionSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Suggestions List */}
                <div className="space-y-1">
                  {filteredSuggestions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#8C8276] italic">
                      No se encontraron coincidencias. Puedes escribir el nombre manualmente en el casillero.
                    </div>
                  ) : (
                    filteredSuggestions.slice(0, 30).map((item) => {
                      const added = isParticipantAdded(item);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2 rounded-lg transition-colors group cursor-pointer ${
                            added ? 'bg-amber-50/80 border border-amber-300' : 'hover:bg-[#FAF8F5]'
                          }`}
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                            {item.type === 'planner' && (
                              <span className="w-6 h-6 rounded-md bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] flex items-center justify-center shrink-0">
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

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {added ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSuggestion(item);
                                }}
                                className="px-2 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-md text-[10px] font-semibold flex items-center gap-1 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-700 transition-colors"
                                title="Clic para quitar de la lista"
                              >
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>Agregado</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSuggestion(item);
                                }}
                                className="px-2 py-1 bg-[#FAF8F5] border border-[#D9CEBF] text-[#2D3748] hover:bg-[#2D3748] hover:text-white rounded-md text-[10px] font-semibold transition-colors flex items-center gap-0.5"
                                title="Añadir a la lista manteniendo los anteriores"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Agregar</span>
                              </button>
                            )}

                            {/* Solo Nombre option if has contactNameOnly */}
                            {item.contactNameOnly && item.formatted !== item.contactNameOnly && !added && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSuggestion(item, item.contactNameOnly);
                                }}
                                className="px-1.5 py-1 bg-[#EBEBEB] border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-md text-[9px] font-medium transition-colors"
                                title={`Añadir solo nombre: ${item.contactNameOnly}`}
                              >
                                Solo nombre
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
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
              className="w-full p-2.5 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-transparent focus:outline-none"
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
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-transparent focus:outline-none"
            />
          </div>

          <div className="p-3 bg-[#EBEBEB] rounded-xl border border-transparent flex items-center space-x-2.5">
            <input
              type="checkbox"
              id="check-is-protocol"
              checked={Boolean(formData.isProtocolCrucial)}
              onChange={(e) => setFormData({ ...formData, isProtocolCrucial: e.target.checked })}
              className="w-4 h-4 rounded-sm text-[#2D3748] accent-[#2D3748] cursor-pointer"
            />
            <label htmlFor="check-is-protocol" className="text-xs text-[#2D2A26] font-semibold cursor-pointer select-none flex items-center gap-1.5">
              <span>Hito de Protocolo</span>
              <span className="text-[11px] text-[#7A7268] font-normal">(Incluir en el subgrupo de protocolo)</span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-transparent">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#2D3748] bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] transition-colors cursor-pointer shadow-xs"
            >
              Guardar Hito
            </button>
          </div>
        </form>

        {/* Modal: + Agregar Lugar / Sede Rápida */}
        {showAddLocationModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#EBEBEB] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D9CEBF] relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] flex items-center justify-center">
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
                    Nombre del Lugar / Recinto <span className="text-[#2D3748]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="Ej. Hotel Casa Grande - Vallecito, Capilla San Francisco..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-transparent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#524B42] mb-1">
                    Tipo de Sede / Uso
                  </label>
                  <select
                    value={newLocationType}
                    onChange={(e) => setNewLocationType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] focus:border-transparent focus:outline-none"
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
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#EBEBEB] border border-transparent text-[#524B42] hover:bg-[#EAE2D8] transition-colors cursor-pointer"
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-transparent">
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
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#2D3748] bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] disabled:opacity-50 transition-colors cursor-pointer flex items-center space-x-1"
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

