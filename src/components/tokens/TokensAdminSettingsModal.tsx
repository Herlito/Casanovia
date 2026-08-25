import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { TokensPaymentConfig } from '../../types';
import { 
  QrCode, 
  Upload, 
  Trash2, 
  Save, 
  X, 
  Check, 
  Building2, 
  Smartphone, 
  FileText,
  AlertCircle,
  HelpCircle,
  Cloud,
  CloudCheck,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { uploadQrToCloudStorage } from '../../lib/storageUtils';

interface TokensAdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokensAdminSettingsModal: React.FC<TokensAdminSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { tokensPaymentConfig, updateTokensPaymentConfig } = useWedding();
  const [formData, setFormData] = useState<TokensPaymentConfig>({ ...tokensPaymentConfig });
  const [qrPreview, setQrPreview] = useState<string>(tokensPaymentConfig.qrImageUrl || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCloudStored, setIsCloudStored] = useState<boolean>(Boolean(tokensPaymentConfig.qrImageUrl));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or context updates
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...tokensPaymentConfig });
      setQrPreview(tokensPaymentConfig.qrImageUrl || '');
      setIsCloudStored(Boolean(tokensPaymentConfig.qrImageUrl));
      setUploadError(null);
    }
  }, [isOpen, tokensPaymentConfig]);

  if (!isOpen) return null;

  // Handler for uploading 1:1 QR image directly to Firebase Cloud Storage
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona una imagen válida (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('La imagen excede el límite de 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Optimizando imagen...');

    try {
      const result = await uploadQrToCloudStorage(file, (msg) => {
        setUploadStatus(msg);
      });

      setQrPreview(result.url);
      setFormData(prev => ({ ...prev, qrImageUrl: result.url }));
      setIsCloudStored(true);
    } catch (err: any) {
      console.error('Error subiendo QR a la nube:', err);
      setUploadError(err?.message || 'Error al procesar y subir la imagen.');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const handleRemoveQr = () => {
    setQrPreview('');
    setIsCloudStored(false);
    setFormData(prev => ({ ...prev, qrImageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setUploadError(null);
    try {
      await updateTokensPaymentConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error guardando configuración de pagos:', err);
      setUploadError('Ocurrió un error al guardar los cambios en la nube.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8DCCF] space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-[#8C8276] hover:text-[#2D2A26] p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAF3ED] text-[#8B3A4A] text-xs font-bold border border-[#E8DCCF]">
            <QrCode className="w-3.5 h-3.5" />
            <span>Configuración Administrador (Nivel 1)</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
            Datos de Pago & QR Oficial en la Nube
          </h2>
          <p className="text-xs text-[#7A7268]">
            Edita los datos bancarios, número de Yape y carga el código QR oficial en la nube (proporción 1:1) para que todos los usuarios (logueados y visitantes) puedan visualizarlo y escanearlo en la página de precios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Subir Archivo 1:1 de un QR a la Nube */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2D2A26] flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-[#8B3A4A]" />
                <span>Código QR Oficial de Pago (Almacenado en la Nube)</span>
              </label>
              
              {isCloudStored && qrPreview && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disponible en la Nube</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* QR Preview Square 1:1 */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 aspect-square rounded-2xl border-2 border-dashed border-[#D9CEBF] bg-[#FAF8F5] flex items-center justify-center overflow-hidden shrink-0 relative group shadow-inner">
                {isUploading ? (
                  <div className="text-center p-3 space-y-2">
                    <Loader2 className="w-8 h-8 text-[#8B3A4A] animate-spin mx-auto" />
                    <span className="text-[10px] text-[#8B3A4A] font-bold block">{uploadStatus || 'Subiendo...'}</span>
                  </div>
                ) : qrPreview ? (
                  <>
                    <img 
                      src={qrPreview} 
                      alt="Código QR de Pago 1:1" 
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleRemoveQr}
                        className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                        title="Eliminar QR"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3 space-y-1">
                    <QrCode className="w-8 h-8 text-[#8C8276] mx-auto opacity-50" />
                    <span className="text-[10px] text-[#8C8276] block font-medium">Sin imagen QR</span>
                    <span className="text-[9px] text-[#8B3A4A] font-bold">1:1 Cuadrado</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleQrUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="admin-qr-file-input"
                />

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E2B3E] hover:bg-[#15202E] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo a la nube...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{qrPreview ? 'Cambiar Imagen QR en la Nube (1:1)' : 'Cargar QR a la Nube (1:1)'}</span>
                      </>
                    )}
                  </button>

                  {qrPreview && !isUploading && (
                    <button
                      type="button"
                      onClick={handleRemoveQr}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar QR</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#7A7268] leading-relaxed">
                  Al subir tu código QR, se almacena en la nube de forma segura y se sincroniza en tiempo real para que visitantes y usuarios registrados puedan escanearlo.
                </p>

                {uploadError && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Datos de Yape */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2A26] flex items-center space-x-2 border-b border-[#F0EAE1] pb-2">
              <Smartphone className="w-4 h-4 text-[#7A1FA2]" />
              <span>Datos de Yape</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#524B42]">
                  Número de Celular (Solo Yape) *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.yapePhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, yapePhone: e.target.value }))}
                  placeholder="Ej. 952 341 165"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#524B42]">
                  Titular de la cuenta Yape *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.yapeHolder}
                  onChange={(e) => setFormData(prev => ({ ...prev, yapeHolder: e.target.value }))}
                  placeholder="Ej. Herly Lizarazo (Casanovia)"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Datos de Transferencia Bancaria */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2A26] flex items-center space-x-2 border-b border-[#F0EAE1] pb-2">
              <Building2 className="w-4 h-4 text-[#8B3A4A]" />
              <span>Datos de Transferencia Bancaria</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#524B42]">
                  Banco *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="Ej. BCP - Banco de Crédito del Perú"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#524B42]">
                  Titular de la Cuenta *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                  placeholder="Ej. Casanovia Bodas & Eventos S.A.C."
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#524B42]">
                  Número de Cuenta Corriente / Ahorros *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Ej. 191-98765432-0-45"
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#524B42]">
                  Código Interbancario (CCI) *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.cci}
                  onChange={(e) => setFormData(prev => ({ ...prev, cci: e.target.value }))}
                  placeholder="Ej. 002-191-009876543204-58"
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A]"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-[#524B42]">
                Instrucciones adicionales para el comprobante
              </label>
              <textarea 
                rows={2}
                value={formData.extraNotes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, extraNotes: e.target.value }))}
                placeholder="Ej. Por favor incluye tu código de pedido o apellido en la descripción..."
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A] resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isUploading}
              className="px-5 py-2.5 rounded-xl border border-[#D9CEBF] bg-white hover:bg-[#FAF3ED] text-[#2D2A26] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#8B3A4A] hover:bg-[#6E2937] text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Guardado en la Nube!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando en la nube...' : 'Guardar Configuración'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
