import re

with open('src/components/private/BudgetModule.tsx', 'r') as f:
    content = f.read()

# 1. Reduce space-y-6 to space-y-2
content = content.replace('<div className="space-y-6">', '<div className="space-y-2">')

# 2. Remove ESTADO and ACCIONES headers
content = content.replace('<th className="px-4 py-3 text-center">Estado</th>\n                <th className="px-4 py-3 text-right">Acciones</th>', '')

# 3. Remove vendor block
vendor_block = """                      {item.vendor && (
                        <div className="mt-1 flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
                            <Building2 className="w-3 h-3 mr-1 text-amber-700" />
                            {item.vendor}
                            {item.vendorId && (
                              <span title="Sincronizado" className="flex items-center">
                                <Check className="w-3 h-3 ml-1 text-emerald-600" />
                              </span>
                            )}
                          </span>
                        </div>
                      )}"""
content = content.replace(vendor_block, '')

# 4. Reduce padding in table headers and cells
content = content.replace('px-4 py-3', 'px-4 py-1.5')
content = content.replace('px-4 py-3.5', 'px-4 py-1.5')

with open('src/components/private/BudgetModule.tsx', 'w') as f:
    f.write(content)
