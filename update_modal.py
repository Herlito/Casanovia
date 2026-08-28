import re

with open('src/components/modals/NewWeddingModal.tsx', 'r') as f:
    code = f.read()

# Add eventType state
code = code.replace(
    "const [coupleNames, setCoupleNames] = useState('');",
    "const [eventType, setEventType] = useState('Boda');\n  const [coupleNames, setCoupleNames] = useState('');"
)

# Update createNewWedding call
code = code.replace(
    "const newWeddingId = await createNewWedding({",
    "const newWeddingId = await createNewWedding({\n        eventType,"
)

# Update texts
code = code.replace("Crear Nueva Boda", "Crear Nuevo Evento")
code = code.replace("Nombres de los Novios", "Nombre del Evento")
code = code.replace("Nombre de la Novia", "Novia/Anfitrión")
code = code.replace("Nombre del Novio", "Novio/Anfitrión")
code = code.replace("Creando Boda en Firestore...", "Creando Evento en Firestore...")
code = code.replace("Crear Boda y Abrir Panel", "Crear Evento y Abrir Panel")
code = code.replace("Se creará un nuevo paquete de boda", "Se creará un nuevo paquete de evento")

# Add eventType select field
eventTypeField = """
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1">
              Tipo de Evento <span className="text-rose-500">*</span>
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white"
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
"""

code = code.replace(
    "<div>\n            <label className=\"block text-xs font-semibold text-[#524B42] mb-1\">\n              Nombre del Evento",
    eventTypeField + "\n          <div>\n            <label className=\"block text-xs font-semibold text-[#524B42] mb-1\">\n              Nombre del Evento"
)

with open('src/components/modals/NewWeddingModal.tsx', 'w') as f:
    f.write(code)
print("Updated modal")
