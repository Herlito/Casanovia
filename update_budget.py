import re

with open('src/components/private/BudgetModule.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import { formatCurrency } from '../../lib/formatUtils';", "import { formatCurrency, formatCurrencyInteger } from '../../lib/formatUtils';")

# 2. Replace formatCurrency with formatCurrencyInteger
content = content.replace("formatCurrency(", "formatCurrencyInteger(")

# 3. Remove "Categoría" and "Estimado" columns from header
old_headers = """                <th className="px-4 py-3 text-left">Concepto & Proveedor</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-right">Estimado</th>
                <th className="px-4 py-3 text-right">Costo<br/>Real</th>"""

new_headers = """                <th className="px-4 py-3 text-left">Concepto & Proveedor</th>
                <th className="px-4 py-3 text-right">Costo<br/>Real</th>"""

content = content.replace(old_headers, new_headers)

# 4. Remove "Categoría" and "Estimado" columns from rows
old_row_data = """                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#EBEBEB] text-[#524B42] border border-transparent">
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-[#7A7268]">
                      {formatCurrencyInteger(item.estimatedCost)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold text-[#2D2A26]">"""

new_row_data = """                    <td className="px-4 py-3.5 text-right font-mono font-bold text-[#2D2A26]">"""

content = content.replace(old_row_data, new_row_data)

# 5. Remove "Sincronizado" tag and replace with check
old_vendor = """                      {item.vendor && (
                        <div className="mt-1 flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
                            <Building2 className="w-3 h-3 mr-1 text-amber-700" />
                            {item.vendor}
                          </span>
                          {item.vendorId && (
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-sm font-medium">
                              Sincronizado
                            </span>
                          )}
                        </div>
                      )}"""

new_vendor = """                      {item.vendor && (
                        <div className="mt-1 flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
                            <Building2 className="w-3 h-3 mr-1 text-amber-700" />
                            {item.vendor}
                            {item.vendorId && (
                              <Check className="w-3 h-3 ml-1 text-emerald-600" title="Sincronizado" />
                            )}
                          </span>
                        </div>
                      )}"""

content = content.replace(old_vendor, new_vendor)

with open('src/components/private/BudgetModule.tsx', 'w') as f:
    f.write(content)
