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
    vendors, 
    addVendor, 
    updateVendor, 
    deleteVendor, 
    canEditActiveWedding, 
    isLevel1Admin,
    isLevel3Planner,
    isPlannerOrAdmin,
    currentUser
  } = useWedding();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<VendorItem | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<VendorItem | null>(null);

  // Enabled for Super Admin, Wedding Planner, and authorized active hosts
  const canManageVendors = Boolean(
    currentUser.isAuthenticated && (canEditActiveWedding || isLevel1Admin || isLevel3Planner || isPlannerOrAdmin)
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8B3A4A]/10 text-[#8B3A4A] border border-[#8B3A4A]/20">
              Directorio de Servicios & Contratos
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26] mt-1">
            Gestión de Proveedores & Servicios
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7268]">
            Directorio de contactos, estado de contratación y pagos de los servicios nupciales en Soles (S/.).
          </p>
        </div>

        {canManageVendors && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-[#8B3A4A] text-white rounded-xl text-xs font-bold hover:bg-[#6E2937] transition-all flex items-center space-x-2 shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Proveedor</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E8DCCF] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#7A7268] uppercase tracking-wider">Proveedores</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#D4AF37] flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26]">
            {totalVendorsCount}
          </div>
          <div className="text-[10px] text-[#7A7268] mt-0.5">
            {vendors.filter(v => v.status === 'liquidado').length} liquidados • {vendors.filter(v => v.status === 'contratado').length} activos
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8DCCF] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#7A7268] uppercase tracking-wider">Total Contratado</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26]">
            {formatCurrency(totalContractedAmount)}
          </div>
          <div className="text-[10px] text-[#7A7268] mt-0.5">
            Suma de contratos vigentes
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8DCCF] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#7A7268] uppercase tracking-wider">Pagado / Anticipos</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif-display text-xl sm:text-2xl font-bold text-emerald-700">
            {formatCurrency(totalPaidAmount)}
          </div>
          <div className="text-[10px] text-[#7A7268] mt-0.5">
            {totalPaidPercentage}% abonado a proveedores
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8DCCF] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#7A7268] uppercase tracking-wider">Saldo por Liquidar</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#8B3A4A] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif-display text-xl sm:text-2xl font-bold text-[#8B3A4A]">
            {formatCurrency(totalPendingBalance)}
          </div>
          <div className="text-[10px] text-[#7A7268] mt-0.5">
            Pendiente de pago
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DCCF] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por proveedor, contacto o servicio..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8DCCF] text-xs text-[#2D2A26] placeholder-[#8C8276] focus:outline-none focus:border-[#8B3A4A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#8B3A4A] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#524B42] hover:bg-[#EFEAE2] border border-[#E8DCCF]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#E8DCCF] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8DCCF] text-stone-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display text-base font-bold text-[#2D2A26]">
            No se encontraron proveedores
          </h3>
          <p className="text-xs text-[#7A7268] max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'all'
              ? 'Intenta ajustar los términos de búsqueda o filtros seleccionados.'
              : 'Aún no hay proveedores registrados en esta boda.'}
          </p>
          {canManageVendors && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 bg-[#8B3A4A] text-white rounded-xl text-xs font-bold hover:bg-[#6E2937] transition-all inline-flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Primer Proveedor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => {
            const pendingBalance = Math.max(0, (vendor.totalCost || 0) - (vendor.paidAmount || 0));
            const paidPercentage = (vendor.totalCost || 0) > 0 
              ? Math.min(100, Math.round(((vendor.paidAmount || 0) / vendor.totalCost) * 100)) 
              : 0;

            return (
              <div
                key={vendor.id}
                className="bg-[#FFFDFB] rounded-2xl p-5 border border-[#E8DCCF] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D4AF37] transition-all"
              >
                <div className="space-y-2.5">
                  {/* Top info and status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#8B3A4A]/10 text-[#8B3A4A] border border-[#8B3A4A]/20">
                        {vendor.category}
                      </span>
                      <h3 className="font-serif-display text-base font-bold text-[#2D2A26] mt-1 truncate" title={vendor.name}>
                        {vendor.name}
                      </h3>
                      {vendor.contactPerson && (
                        <p className="text-xs text-[#7A7268] flex items-center gap-1 mt-0.5 truncate">
                          <span className="font-medium text-[#2D2A26]">{vendor.contactPerson}</span>
                        </p>
                      )}

                      {/* Asistencia a Recepción */}
                      <div className="mt-1.5">
                        {vendor.attendingReception ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-[#8B3A4A] border border-rose-200">
                            <Users className="w-3 h-3 text-[#8B3A4A] shrink-0" />
                            <span>Asiste a recepción: <strong>{vendor.receptionAttendeesCount || 1} {(vendor.receptionAttendeesCount === 1) ? 'persona' : 'personas'}</strong></span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-stone-500 bg-[#FAF8F5] border border-[#E8DCCF]">
                            <span>No asiste a recepción</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        vendor.status === 'liquidado'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : vendor.status === 'contratado'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {vendor.status === 'liquidado' ? 'Liquidado' : vendor.status === 'contratado' ? 'Contratado' : 'Cotización'}
                      </span>

                      {canManageVendors && (
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(vendor)}
                            className="p-1 text-stone-500 hover:text-[#8B3A4A] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                            title="Editar Proveedor"
                            aria-label={`Editar ${vendor.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setVendorToDelete(vendor)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                    <p className="text-xs text-[#7A7268] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F0EAE1] leading-relaxed line-clamp-3">
                      {vendor.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-stone-400 italic bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F0EAE1]">
                      Sin notas adicionales registradas.
                    </p>
                  )}

                  {/* Financial overview */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7A7268]">Total Contratado:</span>
                      <span className="font-bold text-[#2D2A26]">{formatCurrency(vendor.totalCost || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7A7268]">Pagado ({paidPercentage}%):</span>
                      <span className="font-semibold text-emerald-700">{formatCurrency(vendor.paidAmount || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7A7268]">Saldo Pendiente:</span>
                      <span className={`font-bold ${pendingBalance > 0 ? 'text-[#8B3A4A]' : 'text-emerald-700'}`}>
                        {formatCurrency(pendingBalance)}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#F0EAE1] rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-linear-to-r from-[#D4AF37] to-[#8B3A4A] rounded-full transition-all duration-300"
                        style={{ width: `${paidPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-3 border-t border-[#F0EAE1]">
                  <div className="flex items-center gap-1.5">
                    {vendor.phone && (
                      <a
                        href={`https://wa.me/${vendor.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-emerald-200"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">WhatsApp</span>
                      </a>
                    )}

                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="p-1.5 bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#524B42] rounded-xl border border-[#E8DCCF] transition-colors shrink-0"
                        title={`Llamar a ${vendor.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="p-1.5 bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#524B42] rounded-xl border border-[#E8DCCF] transition-colors shrink-0"
                        title={`Enviar correo a ${vendor.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {canManageVendors && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(vendor)}
                        className="py-1.5 px-3 bg-[#FAF8F5] hover:bg-[#8B3A4A] hover:text-white text-[#524B42] rounded-xl text-xs font-semibold border border-[#E8DCCF] transition-all flex items-center gap-1 cursor-pointer"
                        title="Editar proveedor"
                      >
                        <Edit2 className="w-3 h-3" />
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E8DCCF] shadow-2xl space-y-4">
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
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
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

