import re

with open('src/components/modals/AuthModal.tsx', 'r') as f:
    text = f.read()

# 1. Remove "Control de Acceso & Permisos"
text = re.sub(
    r'<span className="text-\[10px\] font-bold tracking-widest text-\[#E8DCCF\] uppercase block">\s*Control de Acceso & Permisos\s*</span>',
    '',
    text
)

# 2. Remove "Inicia sesión según tu rol..."
text = re.sub(
    r'<p className="text-xs text-stone-300 font-light mt-1">\s*Inicia sesión según tu rol para editar cronogramas y asignar permisos de anfitriones.\s*</p>',
    '',
    text
)

# 3. Remove the entire quick demo access buttons section
# It starts at `<div className="pt-2 border-t border-[#EFEAE2] space-y-2">` and ends before `</form>`
text = re.sub(
    r'<div className="pt-2 border-t border-\[#EFEAE2\] space-y-2">.*?</button>\s*</div>\s*</div>\s*</div>',
    '',
    text,
    flags=re.DOTALL
)

with open('src/components/modals/AuthModal.tsx', 'w') as f:
    f.write(text)
