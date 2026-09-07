import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { formatCurrency, formatCurrencyInteger } from '../../lib/formatUtils';
import { VendorItem } from '../../types';
import { VendorModal } from './VendorModal';
import { 
  Building2, 
  Phone, 
  Mail, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  MessageCircle, 
  Sparkles,
  Search,
  Filter,
  Tag,
  Edit2,
  Trash2,
  Layers,
  AlertCircle,
  Users
} from 'lucide-react';

export const VendorsModule: React.FC = () => {
  const {
    appTheme, 
    vendors, 
    addVendor, 
    updateVendor, 
    deleteVendor, 
    canEditActiveWedding, 
    isLevel1Admin,
    isLevel3Planner,
    isPlannerOrAdmin,
    isLevel5Observer,
    currentUser
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<VendorItem | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<VendorItem | null>(null);

  // Enabled for Super Admin, Wedding Planner, and authorized active hosts (never for Level 5 Observer)
  const canManageVendors = Boolean(
    currentUser.isAuthenticated && !isLevel5Observer && canEditActiveWedding
  );

  // Filter vendors
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.notes && v.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = 
      categoryFilter === 'all' || 
      v.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalVendorsCount = vendors.length;
  const totalContractedAmount = vendors.reduce((acc, v) => acc + (v.totalCost || 0), 0);
  const totalPaidAmount = vendors.reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const totalPendingBalance = Math.max(0, totalContractedAmount - totalPaidAmount);
  const totalPaidPercentage = totalContractedAmount > 0 
    ? Math.round((totalPaidAmount / totalContractedAmount) * 100) 
    : 0;

  const handleOpenAddModal = () => {
    setVendorToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vendor: VendorItem) => {
    setVendorToEdit(vendor);
    setIsModalOpen(true);
  };

  const handleSaveVendor = async (vendorData: Omit<VendorItem, 'id'> | VendorItem) => {
    if ('id' in vendorData && vendorData.id) {
      await updateVendor(vendorData.id, vendorData);
    } else {
      await addVendor(vendorData);
    }
  };

  const handleConfirmDelete = async () => {
    if (vendorToDelete) {
      await deleteVendor(vendorToDelete.id);
      setVendorToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800">
              Directorio de Servicios & Contratos
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-gray-900 mt-1.5">
            Gestión de Proveedores & Servicios
          </h2>
        </div>

        {canManageVendors && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-gray-900 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-900" />
              <span className="hidden sm:inline">Nuevo Proveedor</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Proveedores</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-gray-900">
            {totalVendorsCount}
          </div>
          <div className="text-[11px] font-semibold text-gray-600 mt-1">
            {vendors.filter(v => v.status === 'liquidado').length} liquidados • {vendors.filter(v => v.status === 'contratado').length} activos
          </div>
        </div>

        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Total Contratado</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-gray-900">
            {formatCurrency(totalContractedAmount)}
          </div>
          <div className="text-[11px] font-semibold text-gray-600 mt-1">
            Suma de contratos vigentes
          </div>
        </div>

        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Pagado / Anticipos</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-emerald-700">
            {formatCurrency(totalPaidAmount)}
          </div>
          <div className="text-[11px] font-semibold text-gray-600 mt-1">
            {totalPaidPercentage}% abonado a proveedores
          </div>
        </div>

        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Saldo por Liquidar</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-rose-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-rose-600">
            {formatCurrency(totalPendingBalance)}
          </div>
          <div className="text-[11px] font-semibold text-gray-600 mt-1">
            Pendiente de liquidación
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por proveedor, contacto o servicio..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'Locación', label: 'Locación/Banquete' },
            { id: 'Foto', label: 'Foto/Video' },
            { id: 'Música', label: 'Música' },
            { id: 'Flor', label: 'Flores' },
            { id: 'Vestuario', label: 'Vestuario' },
            { id: 'Papelería', label: 'Papelería' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900'
                  : 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-500 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="font-serif-display text-base font-bold text-gray-900">
            No se encontraron proveedores
          </h3>
          <p className="text-xs text-gray-600 font-medium max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'all'
              ? 'Intenta ajustar los términos de búsqueda o filtros seleccionados.'
              : 'Aún no hay proveedores registrados en esta boda.'}
          </p>
          {canManageVendors && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-2 px-5 py-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-900" />
              <span>Registrar Primer Proveedor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => {
            const pendingBalance = Math.max(0, (vendor.totalCost || 0) - (vendor.paidAmount || 0));
            const paidPercentage = (vendor.totalCost || 0) > 0 
              ? Math.min(100, Math.round(((vendor.paidAmount || 0) / vendor.totalCost) * 100)) 
              : 0;

            return (
              <div
                key={vendor.id}
                className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  {/* Top info and status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800">
                        {vendor.category}
                      </span>
                      <h3 className="font-serif-display text-base font-bold text-gray-900 mt-1.5 truncate" title={vendor.name}>
                        {vendor.name}
                      </h3>
                      {vendor.contactPerson && (
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5 truncate">
                          <span className="font-bold text-gray-800">{vendor.contactPerson}</span>
                        </p>
                      )}

                      {/* Asistencia a Recepción */}
                      <div className="mt-2">
                        {vendor.attendingReception ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                            <Users className="w-3 h-3 text-rose-700 shrink-0" />
                            <span>Asiste a recepción: <strong>{vendor.receptionAttendeesCount || 1} {(vendor.receptionAttendeesCount === 1) ? 'persona' : 'personas'}</strong></span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-600">
                            <span>No asiste a recepción</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        vendor.status === 'liquidado'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : vendor.status === 'contratado'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {vendor.status === 'liquidado' ? 'Liquidado' : vendor.status === 'contratado' ? 'Contratado' : 'Cotización'}
                      </span>

                      {canManageVendors && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(vendor)}
                            className="p-1.5 text-gray-700 hover:text-gray-900 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-lg transition-all cursor-pointer"
                            title="Editar Proveedor"
                            aria-label={`Editar ${vendor.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setVendorToDelete(vendor)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-lg transition-all cursor-pointer"
                            title="Eliminar Proveedor"
                            aria-label={`Eliminar ${vendor.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes / Description */}
                  {vendor.notes ? (
                    <p className="text-xs text-gray-700 bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] p-3 rounded-2xl leading-relaxed line-clamp-3">
                      {vendor.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 italic bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] p-3 rounded-2xl">
                      Sin notas adicionales registradas.
                    </p>
                  )}

                  {/* Financial overview */}
                  <div className="space-y-1.5 pt-1 bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] p-3 rounded-2xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Total Contratado:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(vendor.totalCost || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Pagado ({paidPercentage}%):</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(vendor.paidAmount || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Saldo Pendiente:</span>
                      <span className={`font-bold ${pendingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatCurrency(pendingBalance)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${paidPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-gray-300/50">
                  <div className="flex items-center gap-2">
                    {vendor.phone && (
                      <a
                        href={`https://wa.me/${vendor.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">WhatsApp</span>
                      </a>
                    )}

                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="p-2 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800 rounded-xl transition-all shrink-0"
                        title={`Llamar a ${vendor.phone}`}
                      >
                        <Phone className="w-4 h-4 text-gray-700" />
                      </a>
                    )}

                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="p-2 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800 rounded-xl transition-all shrink-0"
                        title={`Enviar correo a ${vendor.email}`}
                      >
                        <Mail className="w-4 h-4 text-gray-700" />
                      </a>
                    )}

                    {canManageVendors && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(vendor)}
                        className="py-2 px-3.5 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Editar proveedor"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-700" />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vendor Form Modal (Create & Edit) */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVendor}
        vendorToEdit={vendorToEdit}
      />

      {/* Delete Confirmation Modal */}
      {vendorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] max-w-sm w-full p-6 border border-transparent shadow-2xl space-y-4" : "bg-[#EBEBEB] rounded-2xl max-w-sm w-full p-6 border border-transparent shadow-2xl space-y-4"}>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-base font-bold text-[#2D2A26]">
                ¿Eliminar este proveedor?
              </h3>
              <p className="text-xs text-[#7A7268] mt-1">
                ¿Estás seguro de eliminar a <strong className="text-[#2D2A26]">"{vendorToDelete.name}"</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#F0EAE1]">
              <button
                type="button"
                onClick={() => setVendorToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#D9CEBF] text-xs font-semibold text-[#524B42] hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-[#2D3748] text-xs font-bold transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

