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
  Tag,
  Users,
  UtensilsCrossed,
  Trash2,
  Plus
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
  const [formData, setFormData] = useState<Omit<VendorItem, 'id' | 'totalCost' | 'paidAmount' | 'attendingReception' | 'receptionAttendeesCount'>>({
    name: '',
    category: 'Locación & Banquete',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'en_proceso',
    notes: '',
  });

  const [attendingReception, setAttendingReception] = useState<boolean>(false);
  const [receptionAttendeesCount, setReceptionAttendeesCount] = useState<string>('1');
  const [totalCostInput, setTotalCostInput] = useState<string>('0');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('0');
  const [partialPayments, setPartialPayments] = useState<any[]>([]);
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
      setAttendingReception(Boolean(vendorToEdit.attendingReception));
      setReceptionAttendeesCount(
        vendorToEdit.receptionAttendeesCount !== undefined 
          ? String(vendorToEdit.receptionAttendeesCount) 
          : '1'
      );
      setTotalCostInput(vendorToEdit.totalCost !== undefined ? String(vendorToEdit.totalCost) : '0');
      setPaidAmountInput(vendorToEdit.paidAmount !== undefined ? String(vendorToEdit.paidAmount) : '0');
      setPartialPayments(vendorToEdit.partialPayments || []);
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
      setAttendingReception(false);
      setReceptionAttendeesCount('1');
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

    if (attendingReception) {
      const attendeesNum = parseInt(receptionAttendeesCount, 10);
      if (isNaN(attendeesNum) || attendeesNum < 1) {
        newErrors.receptionAttendeesCount = 'Ingresa una cantidad válida de personas (mínimo 1)';
      }
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

    const payloadData = {
      ...formData,
      status: finalStatus,
      totalCost: total,
      paidAmount: paid,
      attendingReception,
      receptionAttendeesCount: attendingReception ? Math.max(1, parseInt(receptionAttendeesCount, 10) || 1) : 0,
      partialPayments,
    };

    if (vendorToEdit) {
      onSave({
        ...vendorToEdit,
        ...payloadData,
      });
    } else {
      onSave(payloadData);
    }
    onClose();
  };

  const parsedTotal = parseFloat(totalCostInput) || 0;
  const parsedPaid = parseFloat(paidAmountInput) || 0;
  const pendingBalance = Math.max(0, parsedTotal - parsedPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-[#EBEBEB] rounded-2xl w-full max-w-xl shadow-2xl border border-transparent overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EAE1] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 flex items-center justify-center text-[#2D3748]">
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
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-2 text-xs">
          
          {/* Row 1: Nombre & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-0.5">
                Nombre del Proveedor / Empresa *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Lumière Visual Studio"
                  className={`w-full px-3 py-1.5 rounded-xl bg-[#FAF8F5] border ${
                    errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-[#D9CEBF] focus:border-transparent'
                  } text-xs text-[#2D2A26] focus:outline-none focus:ring-2`}
                  required
                />
              </div>
              {errors.name && <p className="text-[10px] text-rose-600 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-0.5">
                Categoría del Servicio *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-transparent cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Contacto & Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-0.5">
                Persona de Contacto / Asesor
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Ej: David Castro"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-0.5">
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: +51 987 123 456"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Email & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-0.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej: contacto@proveedor.pe"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-0.5">
                Estado de Contratación
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-transparent cursor-pointer"
              >
                <option value="en_proceso">En Cotización / Propuesta</option>
                <option value="contratado">Contratado / Anticipo dado</option>
                <option value="liquidado">Totalmente Liquidado (100%)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Finanzas en Soles (S/.) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-transparent space-y-3">
            <h4 className="font-bold text-[#2D2A26] text-xs flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#2D3748]" />
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#EBEBEB] border border-[#D9CEBF] text-xs font-bold text-[#2D2A26] focus:outline-none focus:border-transparent"
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#EBEBEB] border border-[#D9CEBF] text-xs font-bold text-emerald-800 focus:outline-none focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Live calculation balance */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EFE8DE] text-xs">
              <span className="text-[#7A7268]">Saldo Restante por Pagar:</span>
              <span className={`font-bold ${pendingBalance === 0 ? 'text-emerald-700' : 'text-[#2D3748]'}`}>
                {formatCurrency(pendingBalance)}
              </span>
            </div>

            {/* List of payments */}
            <div className="pt-3 border-t border-[#EFE8DE] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#524B42]">Pagos realizados:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPartialPayments([...partialPayments, { id: Date.now().toString(), amount: 0, date: new Date().toISOString().split('T')[0] }]);
                  }}
                  className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Pago</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {partialPayments.map((payment, index) => (
                  <div key={payment.id} className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={payment.amount}
                      onChange={(e) => {
                        const newPayments = [...partialPayments];
                        newPayments[index].amount = parseFloat(e.target.value) || 0;
                        setPartialPayments(newPayments);
                        setPaidAmountInput(String(newPayments.reduce((sum, p) => sum + p.amount, 0)));
                      }}
                      className="w-full px-2 py-1 rounded-lg bg-[#EBEBEB] border border-[#D9CEBF] text-[11px] text-[#2D2A26] focus:outline-none"
                      placeholder="Monto"
                    />
                    <input
                      type="date"
                      value={payment.date}
                      onChange={(e) => {
                        const newPayments = [...partialPayments];
                        newPayments[index].date = e.target.value;
                        setPartialPayments(newPayments);
                      }}
                      className="w-full px-2 py-1 rounded-lg bg-[#EBEBEB] border border-[#D9CEBF] text-[11px] text-[#2D2A26] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPayments = partialPayments.filter((_, i) => i !== index);
                        setPartialPayments(newPayments);
                        setPaidAmountInput(String(newPayments.reduce((sum, p) => sum + p.amount, 0)));
                      }}
                      className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 5: Notas & Entregables */}
          <div>
            <label className="block text-xs font-bold text-[#2D2A26] mb-1">
              Notas, Alcances del Contrato & Entregables
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ej: Incluye cobertura de 12 horas, 2 fotógrafos, dron, álbum encuadernado y entrega en USB 30 días posteriores al evento..."
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-none focus:border-transparent"
            />
          </div>

          {/* Row 6: Asistencia a la Recepción (SI / NO) y Cantidad de Personas (Compacto al final) */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-transparent space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-[#2D2A26]">
                  ¿Asistirá a la Recepción?
                </label>
                <p className="text-[10px] text-[#7A7268]">
                  Indica si el personal o equipo del proveedor asistirá al banquete / recepción.
                </p>
              </div>

              {/* Botones SI / NO */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setAttendingReception(true);
                    if (!receptionAttendeesCount || Number(receptionAttendeesCount) < 1) {
                      setReceptionAttendeesCount('1');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    attendingReception
                      ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-2xs'
                      : 'bg-[#EBEBEB] text-[#524B42] border border-[#D9CEBF] hover:bg-stone-50'
                  }`}
                >
                  <CheckCircle2 className={`w-3 h-3 ${attendingReception ? 'text-[#2D3748]' : 'text-stone-400'}`} />
                  <span>SÍ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendingReception(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    !attendingReception
                      ? 'bg-stone-700 text-[#2D3748] shadow-2xs'
                      : 'bg-[#EBEBEB] text-[#524B42] border border-[#D9CEBF] hover:bg-stone-50'
                  }`}
                >
                  <X className={`w-3 h-3 ${!attendingReception ? 'text-[#2D3748]' : 'text-stone-400'}`} />
                  <span>NO</span>
                </button>
              </div>
            </div>

            {/* Campo para ingresar manualmente la cantidad de personas si eligió SI */}
            {attendingReception && (
              <div className="pt-2 border-t border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] flex items-center justify-center shrink-0">
                    <Users className="w-3 h-3" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2D2A26]">
                      Cantidad de Personas *
                    </label>
                    <span className="text-[9px] text-[#7A7268]">Número de personas del proveedor que asistirán</span>
                  </div>
                </div>
                <div className="w-full sm:w-32">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={receptionAttendeesCount}
                    onChange={(e) => setReceptionAttendeesCount(e.target.value)}
                    placeholder="Ej: 2"
                    className={`w-full px-2.5 py-1 rounded-lg bg-[#EBEBEB] border ${
                      errors.receptionAttendeesCount ? 'border-rose-400 focus:ring-rose-200' : 'border-[#D9CEBF] focus:border-transparent'
                    } text-xs font-bold text-[#2D2A26] focus:outline-none text-center`}
                    required={attendingReception}
                  />
                  {errors.receptionAttendeesCount && (
                    <p className="text-[9px] text-rose-600 mt-0.5 text-right">{errors.receptionAttendeesCount}</p>
                  )}
                </div>
              </div>
            )}
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
              className="px-5 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold hover:bg-[#EBEBEB] transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5"
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
