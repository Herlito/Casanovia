import re

with open('src/components/private/SettingsModule.tsx', 'r') as f:
    code = f.read()

replacement = """        {/* 3. Gift Registry & Bank Details */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F0EAE1]">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              <span>Mesa de Regalos & Transferencias</span>
            </h3>

            {/* Checkbox Toggle para mostrar u ocultar la sección completa en la Web de Invitados */}
            <label className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] hover:bg-[#F3EFEA] cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                id="checkbox-show-gift-registry"
                checked={formData.showGiftRegistry !== false}
                onChange={(e) => setFormData({
                  ...formData,
                  showGiftRegistry: e.target.checked
                })}
                className="w-4 h-4 rounded text-[#8B3A4A] focus:ring-[#8B3A4A]/30 border-[#D9CEBF] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#2D2A26]">
                Mostrar sección en la Web de Invitados
              </span>
            </label>
          </div>

          <div className={`space-y-4 transition-opacity ${formData.showGiftRegistry === false ? 'opacity-60' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#524B42] mb-1 text-xs">Título de la Sección</label>
                <input
                  type="text"
                  value={formData.giftRegistryTitle || 'Mesa de Regalos & Transferencias'}
                  onChange={(e) => setFormData({
                    ...formData,
                    giftRegistryTitle: e.target.value
                  })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#524B42] mb-1 text-xs">Mensaje Descriptivo</label>
                <textarea
                  value={formData.giftRegistryMessage || 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle adicional con nosotros para nuestro nuevo hogar y luna de miel, ponemos a tu disposición nuestras opciones.'}
                  onChange={(e) => setFormData({
                    ...formData,
                    giftRegistryMessage: e.target.value
                  })}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pb-2 border-b border-[#F0EAE1]">
              <h4 className="font-semibold text-sm text-[#2D2A26]">Datos Bancarios para Transferencias</h4>
              <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.showBankDetails !== false}
                  onChange={(e) => setFormData({
                    ...formData,
                    showBankDetails: e.target.checked
                  })}
                  className="w-4 h-4 rounded text-[#8B3A4A] border-[#D9CEBF]"
                />
                <span className="text-xs text-[#524B42]">Mostrar Datos Bancarios</span>
              </label>
            </div>"""

regex = r"\{\/\* 3\. Bank Details \*\/}.*?<p className=\"text-xs text-\[\#7A7268\]\">\n\s*\{formData\.showBankDetails \!\=\= false \n\s*\? \'✓ Los datos bancarios y número de cuenta están visibles para los invitados en la sección de Mesa de Regalos\.\' \n\s*\: \'✕ Los datos bancarios están ocultos en la Web de Invitados \(solo se mostrarán las tiendas departamentales registradas\)\.\'\}\n\s*<\/p>"

import re
code = re.sub(regex, replacement, code, flags=re.DOTALL)

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(code)
print("Updated settings registry")
