import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { UploadedImageRecord } from '../../types';
import { 
  X, 
  Image as ImageIcon, 
  Search, 
  Trash2, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  User, 
  ShoppingBag, 
  Filter, 
  Sparkles,
  Eye,
  FileCheck,
  Globe
} from 'lucide-react';

interface AdminUploadedImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminUploadedImagesModal: React.FC<AdminUploadedImagesModalProps> = ({ isOpen, onClose }) => {
  const { uploadedImages, deleteUploadedImage, isLevel1Admin } = useWedding();
  const { appTheme } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'voucher' | 'gallery' | 'general'>('all');
  const [previewImage, setPreviewImage] = useState<UploadedImageRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter images based on search term and category
  const filteredImages = uploadedImages.filter(img => {
    const matchesCategory = categoryFilter === 'all' || img.category === categoryFilter;
    const query = searchTerm.toLowerCase().trim();
    if (!query) return matchesCategory;

    const nameMatch = (img.name || '').toLowerCase().includes(query);
    const uploaderMatch = (img.uploadedBy?.username || '').toLowerCase().includes(query);
    const orderMatch = (img.orderCode || '').toLowerCase().includes(query);
    const plansMatch = (img.selectedPlansSummary || '').toLowerCase().includes(query);

    return matchesCategory && (nameMatch || uploaderMatch || orderMatch || plansMatch);
  });

  const handleCopyUrl = (img: UploadedImageRecord) => {
    navigator.clipboard.writeText(img.url);
    setCopiedId(img.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar este registro de imagen?')) {
      setDeletingId(id);
      try {
        await deleteUploadedImage(id);
        if (previewImage?.id === id) {
          setPreviewImage(null);
        }
      } catch (err) {
        console.error('Error eliminando imagen:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-[#EBEBEB] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-xl border border-transparent overflow-hidden">
          
          {/* Header */}
          <div className="p-3 bg-[#EBEBEB] border-b border-gray-300/40 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-[#2D3748] flex items-center justify-center shadow-xs shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26]">
                    Imágenes & Comprobantes Subidos
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF3ED] text-[#2D3748] border border-transparent">
                    {uploadedImages.length}
                  </span>
                </div>
                <p className="text-xs text-[#7A7268]">
                  Visualiza los comprobantes de pago e imágenes enviadas por visitantes o usuarios en tiempo real.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-close-uploaded-images-modal"
              onClick={onClose}
              className="text-[#8C8276] hover:text-[#2D2A26] p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Search & Filter */}
          <div className="p-4 bg-[#FAF8F5] border-b border-transparent flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
            {/* Search input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8276]" />
              <input
                type="text"
                placeholder="Buscar por código, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#EBEBEB] rounded-xl border border-[#D9CEBF] text-xs text-[#2D2A26] focus:outline-hidden focus:border-transparent focus:ring-1 focus:ring-[#d1d1d1]/20"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8276] hover:text-[#2D2A26]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  categoryFilter === 'all'
                    ? 'bg-[#2D2A26] text-[#2D3748] shadow-xs'
                    : 'bg-[#EBEBEB] text-[#6B6358] border border-[#D9CEBF] hover:bg-[#F0EAE1]'
                }`}
              >
                Todos ({uploadedImages.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('voucher')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center space-x-1 ${
                  categoryFilter === 'voucher'
                    ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs'
                    : 'bg-[#EBEBEB] text-[#6B6358] border border-[#D9CEBF] hover:bg-[#F0EAE1]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Comprobantes ({uploadedImages.filter(i => i.category === 'voucher').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('gallery')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center space-x-1 ${
                  categoryFilter === 'gallery'
                    ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs'
                    : 'bg-[#EBEBEB] text-[#6B6358] border border-[#D9CEBF] hover:bg-[#F0EAE1]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Galería ({uploadedImages.filter(i => i.category === 'gallery').length})</span>
              </button>
            </div>
          </div>

          {/* Images Grid Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {filteredImages.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3 bg-[#EBEBEB] rounded-2xl border border-dashed border-[#D9CEBF]">
                <div className="w-14 h-14 rounded-full bg-[#FAF3ED] text-[#2D3748] flex items-center justify-center mx-auto">
                  <ImageIcon className="w-7 h-7 opacity-70" />
                </div>
                <h3 className="text-base font-bold text-[#2D2A26]">
                  {uploadedImages.length === 0 ? 'Aún no se han subido imágenes' : 'No se encontraron resultados'}
                </h3>
                <p className="text-xs text-[#7A7268] max-w-sm mx-auto">
                  {uploadedImages.length === 0
                    ? 'Cuando los visitantes o usuarios suban comprobantes de pago o fotos, aparecerán listadas aquí en tiempo real.'
                    : 'Prueba cambiando el término de búsqueda o el filtro de categoría.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="bg-[#EBEBEB] rounded-2xl border border-transparent overflow-hidden shadow-2xs hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] transition-all duration-200 flex flex-col group"
                  >
                    {/* Image Preview Container */}
                    <div 
                      onClick={() => setPreviewImage(image)}
                      className="h-48 sm:h-52 bg-[#FAF8F5] relative overflow-hidden cursor-pointer flex items-center justify-center border-b border-[#F0EAE1]"
                    >
                      <img
                        src={image.url}
                        alt={image.name || 'Imagen subida'}
                        className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#EBEBEB]/90 text-[#2D2A26] text-xs font-bold shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]">
                          <Eye className="w-4 h-4 text-[#2D3748]" />
                          <span>Ver Detalle</span>
                        </span>
                      </div>

                      {/* Category Badge */}
                      <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs border ${
                        image.category === 'voucher'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-stone-100 text-stone-700 border-stone-300'
                      }`}>
                        {image.category === 'voucher' ? 'Comprobante' : 'Imagen'}
                      </span>

                      {/* Order Code Tag if present */}
                      {image.orderCode && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#2A1810] text-[#E5B869] shadow-xs">
                          {image.orderCode}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-xs text-[#2D2A26] truncate" title={image.name}>
                          {image.name || 'Archivo de imagen'}
                        </h4>

                        {/* Uploader info */}
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#524B42]">
                          {image.uploadedBy?.isVisitor ? (
                            <span className="inline-flex items-center text-amber-700 font-semibold">
                              <Globe className="w-3.5 h-3.5 mr-1" />
                              Visitante Público
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[#2D3748] font-semibold">
                              <User className="w-3.5 h-3.5 mr-1" />
                              {image.uploadedBy?.username || 'Usuario'}
                            </span>
                          )}
                        </div>

                        {/* Order Total / Summary */}
                        {image.orderTotal !== undefined && image.orderTotal > 0 && (
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0EAE1]">
                            <span className="text-[#7A7268]">Total Pedido:</span>
                            <span className="font-mono font-bold text-[#2A1810]">
                              S/ {image.orderTotal.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {image.selectedPlansSummary && (
                          <p className="text-[10px] text-[#7A7268] line-clamp-2 leading-tight">
                            {image.selectedPlansSummary}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Timestamp & Actions */}
                      <div className="pt-2.5 border-t border-[#F0EAE1] flex items-center justify-between text-[10px] text-[#8C8276]">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#8C8276]" />
                          <span>{formatDate(image.uploadedAt)}</span>
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(image)}
                            title="Copiar enlace de imagen"
                            className="p-1.5 rounded-lg hover:bg-[#FAF3ED] text-[#6B6358] hover:text-[#2D3748] transition-colors cursor-pointer"
                          >
                            {copiedId === image.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={image.url}
                            download={image.name || 'comprobante.png'}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir / Descargar"
                            className="p-1.5 rounded-lg hover:bg-[#FAF3ED] text-[#6B6358] hover:text-[#2D3748] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {isLevel1Admin && (
                            <button
                              type="button"
                              onClick={(e) => handleDelete(image.id, e)}
                              disabled={deletingId === image.id}
                              title="Eliminar comprobante"
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-[#6B6358] hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-[#EBEBEB] border-t border-transparent flex items-center justify-between shrink-0">
            <div className="text-xs text-[#7A7268]">
              Mostrando <strong>{filteredImages.length}</strong> de <strong>{uploadedImages.length}</strong> archivos en total
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#2D2A26] hover:bg-[#1A0E0A] text-[#2D3748] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>

      {/* Fullscreen Lightbox Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-[#EBEBEB] rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#2A1810] text-[#2D3748] flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <FileCheck className="w-4 h-4 text-[#E5B869]" />
                <span className="font-bold text-sm truncate">{previewImage.name}</span>
                {previewImage.orderCode && (
                  <span className="font-mono text-xs px-2 py-0.5 bg-[#EBEBEB]/10 rounded-md text-[#E5B869]">
                    {previewImage.orderCode}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-[#2D3748]/70 hover:text-[#2D3748] p-1.5 rounded-full hover:bg-[#EBEBEB]/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#111] flex items-center justify-center overflow-auto max-h-[65vh]">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff]"
              />
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-transparent flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-[#524B42]">
                  <strong>Subido por:</strong> {previewImage.uploadedBy?.username || (previewImage.uploadedBy?.isVisitor ? 'Visitante Público' : 'Usuario')}
                </p>
                <p className="text-[#7A7268]">
                  <strong>Fecha:</strong> {formatDate(previewImage.uploadedAt)}
                  {previewImage.orderTotal ? ` • Total: S/ ${previewImage.orderTotal.toFixed(2)}` : ''}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewImage)}
                  className="px-3 py-1.5 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] hover:bg-[#F3EFEA] text-[#2D2A26] text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  {copiedId === previewImage.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === previewImage.id ? 'Copiado' : 'Copiar URL'}</span>
                </button>

                <a
                  href={previewImage.url}
                  download={previewImage.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-[#2D3748] text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
