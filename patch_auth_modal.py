import re

with open('src/components/modals/AuthModal.tsx', 'r') as f:
    text = f.read()

# Change header icon
text = text.replace(
    '<ShieldCheck className="w-5 h-5 text-white" />',
    '<User className="w-5 h-5 text-white" />'
)

# Change header title
text = text.replace(
    '''<h3 className="font-serif-display text-xl font-bold text-white">
                Acceso al Sistema
              </h3>''',
    '''<h3 className="font-serif-display text-xl font-bold text-white">
                Acceso
              </h3>'''
)

# Change header description
text = text.replace(
    'Inicia sesión según tu rol para gestionar bodas, editar cronogramas y asignar permisos de anfitriones.',
    'Inicia sesión según tu rol para editar cronogramas y asignar permisos de anfitriones.'
)

# Change submit button
text = text.replace(
    '<span>Ingresar al Sistema</span>',
    '<span>Ingresar</span>'
)

# Remove "Accesos rápidos de demostración:" label
text = text.replace(
    '<span className="text-[11px] text-[#7A7268] block text-center font-medium">\n                  Accesos rápidos de demostración:\n                </span>',
    ''
)

# Remove the Guest Planner button
middle_button = '''                  <button
                    type="button"
                    onClick={() => handleSelectQuickUser('Guest Planner')}
                    className="flex items-center space-x-1.5 p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer text-left"
                    title="Cargar usuario Guest Planner"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <div className="text-left truncate">
                      <span className="block truncate font-bold text-[11px]">Guest Planner</span>
                      <span className="text-[9px] text-teal-700 block">Nv 3 (Wedding Planner)</span>
                    </div>
                  </button>'''
text = text.replace(middle_button, '')

# Change grid-cols-3 to grid-cols-2
text = text.replace('className="grid grid-cols-1 sm:grid-cols-3 gap-2"', 'className="grid grid-cols-1 sm:grid-cols-2 gap-2"')

# Remove the roles block
roles_block = '''          <div className="bg-[#FAF8F5] rounded-xl p-3 text-[11px] text-[#7A7268] space-y-1.5 border border-[#E8DCCF]">
            <p className="font-semibold text-[#524B42]">Niveles de Privilegio & Roles:</p>
            <p>• <strong className="text-emerald-800">Nivel 1 (Super Admin):</strong> Acceso total a todas las bodas, creación de bodas y administración completa de usuarios.</p>
            <p>• <strong className="text-teal-800">Nivel 3 (Wedding Planner):</strong> Gestión y edición de bodas creadas por ella y potestad para asignar usuarios con rol de <strong>"Novio/a"</strong>.</p>
            <p>• <strong className="text-purple-800">Nivel 2 (Novios):</strong> Parejas y novios con permisos de edición <em>únicamente</em> en sus bodas asignadas.</p>
          </div>'''
text = text.replace(roles_block, '')

with open('src/components/modals/AuthModal.tsx', 'w') as f:
    f.write(text)
