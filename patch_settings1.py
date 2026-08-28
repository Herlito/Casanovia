import re

with open('src/components/private/SettingsModule.tsx', 'r') as f:
    code = f.read()

# Replace the text:
code = code.replace(
    "Edita los datos de la boda activa, sedes de ceremonia/recepción, código de vestimenta, paleta visual y finanzas.",
    "Edita los datos del evento, sedes de ceremonia/recepción, código de vestimenta, paleta visual y finanzas."
)

# Insert eventType and romanticQuote fields:
replacement = """          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-4">
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Tipo de Evento
              </label>
              <select
                value={formData.eventType || 'Boda'}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              >
                <option value="Boda">Boda</option>
                <option value="Quinceañero">Quinceañero</option>
                <option value="Fiesta de Promoción">Fiesta de Promoción</option>
                <option value="Aniversario">Aniversario</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Baby Shower">Baby Shower</option>
                <option value="Graduación">Graduación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div className="lg:col-span-3">
              <label className="block font-semibold text-[#524B42] mb-1">
                Frase de Invitación / Subtítulo
              </label>
              <input
                type="text"
                value={formData.romanticQuote || ''}
                onChange={(e) => setFormData({ ...formData, romanticQuote: e.target.value })}
                placeholder="Ej. Con la bendición de Dios y de nuestros padres..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">"""

code = code.replace(
    "<div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs\">\n            <div>\n              <label className=\"block font-semibold text-[#524B42] mb-1\">\n                Nombre del Evento",
    replacement + "\n            <div>\n              <label className=\"block font-semibold text-[#524B42] mb-1\">\n                Nombre del Evento"
)

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(code)

print("Patched SettingsModule.tsx")
