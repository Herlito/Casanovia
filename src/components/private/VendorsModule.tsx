import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { formatCurrencyInteger } from '../../lib/formatUtils';
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
    <div className="space-y-2 sm:space-y-4 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 px-1 sm:px-0">
        <div>
          <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26]">
            Proveedores
          </h1>
        </div>

        {canManageVendors && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-gray-900 rounded-2xl text-xs font-bold border border-gray-300/60 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-900" />
              <span>Nuevo Proveedor</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/60 p-2 sm:p-5 flex items-center justify-between">
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-gray-900">
            {totalVendorsCount}
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-amber-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/60 p-2 sm:p-5 flex items-center justify-between">
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-gray-900">
            {formatCurrencyInteger(totalContractedAmount)}
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-blue-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/60 p-2 sm:p-5 flex items-center justify-between">
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-emerald-700">
            {formatCurrencyInteger(totalPaidAmount)}
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/60 p-2 sm:p-5 flex items-center justify-between">
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-rose-600">
            {formatCurrencyInteger(totalPendingBalance)}
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-rose-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/60 p-2 sm:p-5 flex items-center">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por proveedor, contacto o servicio..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-gray-300/60 text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/60 p-10 text-center space-y-3">
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
              className="mt-2 px-5 py-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 rounded-xl text-xs font-bold border border-gray-300/60 transition-all inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-900" />
              <span>Registrar Primer Proveedor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-5">
          {filteredVendors.map((vendor) => {
            const pendingBalance = Math.max(0, (vendor.totalCost || 0) - (vendor.paidAmount || 0));
            const paidPercentage = (vendor.totalCost || 0) > 0 
              ? Math.min(100, Math.round(((vendor.paidAmount || 0) / vendor.totalCost) * 100)) 
              : 0;

            return (
              <div
                key={vendor.id}
                className="bg-[#EBEBEB] rounded-2xl sm:rounded-3xl shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] sm:shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-gray-300/60 p-2.5 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-4 transition-all"
              >
                <div className="space-y-1.5 sm:space-y-3">
                  {/* Top info and status */}
                  <div className="flex items-start justify-between gap-1 sm:gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="px-1.5 sm:px-2.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] text-gray-800 truncate max-w-full">
                          {vendor.category}
                        </span>
                        <span className={`sm:hidden px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                          vendor.status === 'liquidado'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : vendor.status === 'contratado'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {vendor.status === 'liquidado' ? 'Liquidado' : vendor.status === 'contratado' ? 'Contratado' : 'Cotiz.'}
                        </span>
                      </div>
                      <h3 className="font-serif-display text-xs sm:text-base font-bold text-gray-900 mt-1 truncate" title={vendor.name}>
                        {vendor.name}
                      </h3>
                      {vendor.contactPerson && (
                        <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 mt-0.5 truncate">
                          <span className="font-bold text-gray-800 truncate">{vendor.contactPerson}</span>
                        </p>
                      )}

                      {/* Asistencia a Recepción */}
                      <div className="mt-1 sm:mt-2">
                        {vendor.attendingReception ? (
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-700 shrink-0" />
                            <span className="truncate">Recepción: <strong>{vendor.receptionAttendeesCount || 1}</strong></span>
                          </span>
                        ) : (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-600">
                            <span>No asiste a recepción</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
                      <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        vendor.status === 'liquidado'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : vendor.status === 'contratado'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {vendor.status === 'liquidado' ? 'Liquidado' : vendor.status === 'contratado' ? 'Contratado' : 'Cotización'}
                      </span>

                      {canManageVendors && (
                        <div className="flex items-center space-x-1 sm:space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(vendor)}
                            className="p-1 sm:p-1.5 text-gray-700 hover:text-gray-900 bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border border-gray-300/60 rounded-lg transition-all cursor-pointer"
                            title="Editar Proveedor"
                            aria-label={`Editar ${vendor.name}`}
                          >
                            <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setVendorToDelete(vendor)}
                            className="p-1 sm:p-1.5 text-rose-600 hover:text-rose-700 bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border border-gray-300/60 rounded-lg transition-all cursor-pointer"
                            title="Eliminar Proveedor"
                            aria-label={`Eliminar ${vendor.name}`}
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes / Description */}
                  {vendor.notes && (
                    <p className="text-[10px] sm:text-xs text-gray-700 bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] p-1.5 sm:p-3 rounded-xl sm:rounded-2xl leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {vendor.notes}
                    </p>
                  )}

                  {/* Financial overview */}
                  <div className="space-y-1 sm:space-y-1.5 bg-[#EBEBEB] shadow-[inset_1.5px_1.5px_3px_#d1d1d1,inset_-1.5px_-1.5px_3px_#ffffff] p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-gray-600 font-medium">Total:</span>
                      <span className="font-bold text-gray-900">{formatCurrencyInteger(vendor.totalCost || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-gray-600 font-medium">Pagado:</span>
                      <span className="font-bold text-emerald-700">{formatCurrencyInteger(vendor.paidAmount || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-gray-600 font-medium">Saldo:</span>
                      <span className={`font-bold ${pendingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatCurrencyInteger(pendingBalance)}
                      </span>
                    </div>

                    <div className="w-full h-1.5 sm:h-2 bg-gray-300 rounded-full overflow-hidden mt-1 sm:mt-1.5">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${paidPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-1.5 sm:pt-2 border-t border-gray-300/50">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {vendor.phone && (
                      <a
                        href={`https://wa.me/${vendor.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 sm:py-2 px-1.5 sm:px-3 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border border-gray-300/60 text-emerald-800 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 min-w-0"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="p-1.5 sm:p-2 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border border-gray-300/60 text-gray-800 rounded-lg sm:rounded-xl transition-all shrink-0"
                        title={`Llamar a ${vendor.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-gray-700" />
                      </a>
                    )}

                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="p-1.5 sm:p-2 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border border-gray-300/60 text-gray-800 rounded-lg sm:rounded-xl transition-all shrink-0"
                        title={`Enviar correo a ${vendor.email}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-gray-700" />
                      </a>
                    )}

                    {canManageVendors && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(vendor)}
                        className="py-1.5 sm:py-2 px-2 sm:px-3.5 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border border-gray-300/60 text-gray-900 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        title="Editar proveedor"
                      >
                        <Edit2 className="w-3 h-3 text-gray-700" />
                        <span className="hidden sm:inline">Editar</span>
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

