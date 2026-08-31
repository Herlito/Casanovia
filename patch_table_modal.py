import re

with open('src/components/private/TableModal.tsx', 'r') as f:
    content = f.read()

# Add state for isConfirmingDelete
content = content.replace(
    'const [capacity, setCapacity] = useState(10);',
    'const [capacity, setCapacity] = useState(10);\n  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);'
)

# Replace the button block
regex = re.compile(
    r'\{tableToEdit && onDelete \? \(\s*<button.*?onClick=\{onDelete\}.*?>.*?<span>Eliminar</span>\s*</button>\s*\)\s*:\s*\(\s*<div />\s*\)\}',
    re.DOTALL
)

replacement = """{tableToEdit && onDelete ? (
              isConfirmingDelete ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-rose-700 font-semibold hidden sm:inline">¿Seguro?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-2.5 py-1.5 rounded-lg text-white bg-rose-600 hover:bg-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Sí, Eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1.5 rounded-lg text-[#524B42] bg-[#FAF8F5] hover:bg-[#EBEBEB] border border-[#D9CEBF] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3.5 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
              )
            ) : (
              <div />
            )}"""

content = regex.sub(replacement, content)

# Reset isConfirmingDelete on close/open
content = content.replace(
    'if (isOpen && tableToEdit) {',
    'setIsConfirmingDelete(false);\n    if (isOpen && tableToEdit) {'
)

with open('src/components/private/TableModal.tsx', 'w') as f:
    f.write(content)
