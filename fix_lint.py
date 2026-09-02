import re

with open('src/components/private/BudgetModule.tsx', 'r') as f:
    content = f.read()

old_vendor = """                            {item.vendorId && (
                              <Check className="w-3 h-3 ml-1 text-emerald-600" title="Sincronizado" />
                            )}"""

new_vendor = """                            {item.vendorId && (
                              <span title="Sincronizado" className="flex items-center">
                                <Check className="w-3 h-3 ml-1 text-emerald-600" />
                              </span>
                            )}"""

content = content.replace(old_vendor, new_vendor)

with open('src/components/private/BudgetModule.tsx', 'w') as f:
    f.write(content)
