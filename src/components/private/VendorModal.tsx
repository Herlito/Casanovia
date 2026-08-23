import React, { useState, useEffect } from 'react';
import { VendorItem } from '../../types';
import { formatCurrency } from '../../lib/formatUtils';
import { 
  X, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Tag
} from 'lucide-react';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendorData: Omit<VendorItem, 'id'> | VendorItem) => void;
  vendorToEdit?: VendorItem | null;
}

const CATEGORY_OPTIONS = [
  'Locación & Banquete',
  'Fotografía & Video',
  'Música & Iluminación',
  'Orquesta & DJ',
  'Floristería & Decoración',
  'Decoración & Mobiliario',
  'Wedging Planner',
  'Iglesia',
  'Municipalidad',
  'Apdayc',
  'HoraLoca & Shows',
  'Vestuario & Belleza',
  'Papelería & Recuerdos',
  'Banquetería & Bebidas',
  'Transporte & Movilidad',
  'Maquillaje & Peinado',
  'Joyería & Alianzas',
  'Pastelería & Mesa de Dulces',
  'Coordinación & Protocolo',
  'Otros Servicios'
];

export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vendorToEdit,
}) => {
  const [formData, setFormData] = useState<Omit<VendorItem, 'id' | 'totalCost' | 'paidAmount'>>({
    name: '',
    category: 'Locación & Banquete',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'en_proceso',
    notes: '',
  });

  const [totalCostInput, setTotalCostInput] = useState<string>('0');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vendorToEdit) {
      setFormData({
        name: vendorToEdit.name || '',
        category: vendorToEdit.category || 'Locación & Banquete',
        contactPerson: vendorToEdit.contactPerson || '',
        phone: vendorToEdit.phone || '',
        email: vendorToEdit.email || '',
        status: vendorToEdit.status || 'en_proceso',
        notes: vendorToEdit.notes || '',
      });
      setTotalCostInput(vendorToEdit.totalCost !== undefined ? String(vendorToEdit.totalCost) : '0');
      setPaidAmountInput(vendorToEdit.paidAmount !== undefined ? String(vendorToEdit.paidAmount) : '0');
    } else {
      setFormData({
        name: '',
        category: 'Locación & Banquete',
        contactPerson: '',
        phone: '',
        email: '',
        status: 'en_proceso',
        notes: '',
      });
      setTotalCostInput('0');
      setPaidAmountInput('0');
    }
    setErrors({});
  }, [vendorToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proveedor o empresa es obligatorio';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Selecciona una categoría';
    }
    const total = parseFloat(totalCostInput) || 0;
    const paid = parseFloat(paidAmountInput) || 0;
    if (total < 0) {
      newErrors.totalCost = 'El monto total no puede ser negativo';
    }
    if (paid < 0) {
      newErrors.paidAmount = 'El monto pagado no puede ser negativo';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Determine auto-status if applicable
    let finalStatus = formData.status;
    const total = parseFloat(totalCostInput) || 0;
    const paid = parseFloat(paidAmountInput) || 0;
    
    if (paid >= total && total > 0) {
      finalStatus = 'liquidado';
    } else if (paid > 0 && finalStatus === 'en_proceso') {
      finalStatus = 'contratado';
    }

    if (vendorToEdit) {
      onSave({
        ...vendorToEdit,
        ...formData,
        status: finalStatus,
        totalCost: total,
        paidAmount: paid,
      });
    } else {
      onSave({
        ...formData,
        status: finalStatus,
        totalCost: total,
        paidAmount: paid,
      });
    }
    onClose();
  };

  const parsedTotal = parseFloat(totalCostInput) || 0;
  const parsedPaid = parseFloat(paidAmountInput) || 0;
  const pendingBalance = Math.max(0, parsedTotal - parsedPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-[#E8DCCF] overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EAE1] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8B3A4A]/10 flex items-center justify-center text-[#8B3A4A]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="vendor-modal-title" className="font-serif-display text-lg font-bold text-[#2D2A26]">
                {vendorToEdit ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
              </h3>
              <p className="text-[11px] text-[#7A7268]">
                {vendorToEdit 
                  ? 'Actualiza los datos de contacto, presupuestos y estado del servicio' 
                  : 'Agrega un nuevo prestador de servicios para el evento'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Row 1: Nombre & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                Nombre del Proveedor / Empresa *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Lumière Visual Studio"
                  className={`w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border ${
                    errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-[#D9CEBF] focus:border-[#8B3A4A]'
                  } text-xs text-[#2D2A26] focus:outline-none focus:ring-2`}
                  required
                />
              </div>
              {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                Categoría del Servicio *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-[#8B3A4A] cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Contacto & Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                Persona de Contacto / Asesor
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Ej: David Castro / Lic. Morales"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-[#8B3A4A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: +51 987 123 456"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-[#8B3A4A]"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Email & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej: contacto@proveedor.pe"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-[#8B3A4A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                Estado de Contratación
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-[#8B3A4A] cursor-pointer"
              >
                <option value="en_proceso">En Cotización / Propuesta</option>
                <option value="contratado">Contratado / Anticipo dado</option>
                <option value="liquidado">Totalmente Liquidado (100%)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Finanzas en Soles (S/.) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DCCF] space-y-3">
            <h4 className="font-bold text-[#2D2A26] text-xs flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#8B3A4A]" />
              <span>Presupuesto y Pagos del Proveedor (S/.)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#524B42] mb-1">
                  Costo Total Acordado (S/.)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">
                    S/.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={totalCostInput}
                    onChange={(e) => setTotalCostInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#D9CEBF] text-xs font-bold text-[#2D2A26] focus:outline-none focus:border-[#8B3A4A]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#524B42] mb-1">
                  Anticipo / Monto Pagado (S/.)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">
                    S/.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={paidAmountInput}
                    onChange={(e) => setPaidAmountInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#D9CEBF] text-xs font-bold text-emerald-800 focus:outline-none focus:border-[#8B3A4A]"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Live calculation balance */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EFE8DE] text-xs">
              <span className="text-[#7A7268]">Saldo Restante por Pagar:</span>
              <span className={`font-bold ${pendingBalance === 0 ? 'text-emerald-700' : 'text-[#8B3A4A]'}`}>
                {formatCurrency(pendingBalance)}
              </span>
            </div>
          </div>

          {/* Row 5: Notas & Entregables */}
          <div>
            <label className="block text-xs font-bold text-[#2D2A26] mb-1">
              Notas, Alcances del Contrato & Entregables
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ej: Incluye cobertura de 12 horas, 2 fotógrafos, dron, álbum encuadernado y entrega en USB 30 días posteriores al evento..."
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-[#8B3A4A]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#F0EAE1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#D9CEBF] text-xs font-semibold text-[#524B42] hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8B3A4A] text-white text-xs font-bold hover:bg-[#6E2937] transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{vendorToEdit ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
