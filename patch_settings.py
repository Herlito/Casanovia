import re

with open('src/components/private/SettingsModule.tsx', 'r') as f:
    text = f.read()

new_block = """
        {/* Mensajes & Bendiciones de los Invitados */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F0EAE1]">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-[#8B3A4A]" />
              <span>Mensajes & Bendiciones de los Invitados</span>
            </h3>

            {/* Checkbox Toggle para mostrar u ocultar la sección en la Web de Invitados */}
            <label className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] hover:bg-[#F3EFEA] cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                id="checkbox-show-wishes-wall"
                checked={formData.showWishesWall !== false}
                onChange={(e) => setFormData({
                  ...formData,
                  showWishesWall: e.target.checked
                })}
                className="w-4 h-4 rounded text-[#8B3A4A] focus:ring-[#8B3A4A]/30 border-[#D9CEBF] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#2D2A26]">
                Mostrar sección en la Web de Invitados
              </span>
            </label>
          </div>
          <p className="text-xs text-[#7A7268]">
            Habilita o deshabilita el muro de mensajes y buenos deseos donde los invitados confirmados pueden dejar sus dedicatorias para la pareja.
          </p>
        </div>
"""

# Find where to insert it. We can insert it before {/* 4. Dress Code & Suggested Color Palette */}
text = text.replace("{/* 4. Dress Code & Suggested Color Palette */}", new_block + "\n        {/* 4. Dress Code & Suggested Color Palette */}")

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(text)

print("Settings patched!")
