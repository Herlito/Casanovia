import React, { useState, useEffect } from 'react';
import { BudgetItem, VENDOR_SERVICE_CATEGORIES } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { mapVendorCategoryToBudgetCategory } from '../../lib/budgetSyncUtils';
import { X, DollarSign, Tag, Building2, Link as LinkIcon } from 'lucide-react';

interface BudgetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: any) => void;
  itemToEdit?: BudgetItem | null;
}

export const BudgetItemModal: React.FC<BudgetItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const { vendors } = useWedding();
  const [formData, setFormData] = useState<Partial<BudgetItem>>({
    category: 'Locación & Banquete',
    concept: '',
    vendor: '',
    vendorId: '',
    status: 'pending',
    notes: '',
  });

  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [estimatedCostInput, setEstimatedCostInput] = useState<string>('10000');
  const [actualCostInput, setActualCostInput] = useState<string>('10000');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('0');

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
      setSelectedVendorId(itemToEdit.vendorId || '');
      setEstimatedCostInput(itemToEdit.estimatedCost !== undefined ? String(itemToEdit.estimatedCost) : '0');
      setActualCostInput(itemToEdit.actualCost !== undefined ? String(itemToEdit.actualCost) : '0');
      setPaidAmountInput(itemToEdit.paidAmount !== undefined ? String(itemToEdit.paidAmount) : '0');
    } else {
      setFormData({
        category: 'Locación & Banquete',
        concept: '',
        vendor: '',
        vendorId: '',
        status: 'partial',
        notes: '',
      });
      setSelectedVendorId('');
      setEstimatedCostInput('15000');
      setActualCostInput('15000');
      setPaidAmountInput('5000');
    }
  }, [itemToEdit, isOpen]);

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    if (!vendorId) {
      setFormData((prev) => ({ ...prev, vendorId: '' }));
      return;
    }
    const foundVendor = vendors.find((v) => v.id === vendorId);
    if (foundVendor) {
      const budgetCategory = foundVendor.category || 'Otros Servicios';
      setFormData((prev) => ({
        ...prev,
        vendorId: foundVendor.id,
        vendor: foundVendor.name,
        category: budgetCategory,
        concept: prev.concept?.trim() ? prev.concept : `${foundVendor.name} (${foundVendor.category})`,
        notes: prev.notes || foundVendor.notes || `Contacto: ${foundVendor.contactPerson} (${foundVendor.phone || foundVendor.email})`,
      }));
      setEstimatedCostInput(String(foundVendor.totalCost || 0));
      setActualCostInput(String(foundVendor.totalCost || 0));
      setPaidAmountInput(String(foundVendor.paidAmount || 0));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concept?.trim()) return;

    const estimated = parseFloat(estimatedCostInput) || 0;
    const actual = parseFloat(actualCostInput) || 0;
    const paid = parseFloat(paidAmountInput) || 0;
    let status: 'pending' | 'partial' | 'paid' = 'pending';

    if (paid >= actual && actual > 0) {
      status = 'paid';
    } else if (paid > 0) {
      status = 'partial';
    }

    onSave({
      ...formData,
      vendorId: selectedVendorId || formData.vendorId,
      estimatedCost: estimated,
      actualCost: actual,
      paidAmount: paid,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8DCCF] relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C827A] hover:text-[#2D2A26] p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#8A9A86] text-white flex items-center justify-center shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#2D2A26]">
              {itemToEdit ? 'Editar Gasto / Presupuesto' : 'Nuevo Concepto de Presupuesto'}
            </h3>
            <p className="text-xs text-[#7A7268]">
              Registra montos pactados, anticipos y vincúlalo con tus proveedores registrados
            </p>
          </div>
        </div>

        {/* Optional Vendor Fast Pick */}
        {vendors && vendors.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <label className="flex items-center text-xs font-bold text-amber-900 mb-1.5">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
              Vincular con Proveedor Registrado (Opcional):
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => handleVendorSelect(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white font-medium text-stone-800"
            >
              <option value="">-- Ingreso manual independiente --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.category}) — S/. {Number(v.totalCost || 0).toLocaleString('es-PE')}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1">
              Concepto / Servicio <span className="text-[#8B3A4A]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.concept || ''}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              placeholder="Ej. Centros de Mesa & Boutonnieres"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Categoría
              </label>
              <select
                value={formData.category || 'Locación & Banquete'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5]"
              >
                {VENDOR_SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Proveedor / Empresa
              </label>
              <input
                type="text"
                value={formData.vendor || ''}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Ej. Hacienda Colonial o Magnolia Couture"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Costo Estimado (S/.)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={estimatedCostInput}
                onChange={(e) => setEstimatedCostInput(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Costo Real (S/.)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={actualCostInput}
                onChange={(e) => setActualCostInput(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Anticipo / Pagado (S/.)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={paidAmountInput}
                onChange={(e) => setPaidAmountInput(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1">
              Notas / Fechas de Pago
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ej. Saldo restante contra entrega el día del evento"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D9CEBF] bg-[#FAF8F5]"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E8DCCF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#8B3A4A] hover:bg-[#6E2937] transition-colors"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
