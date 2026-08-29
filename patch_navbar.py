import re

with open('src/components/Navbar.tsx', 'r') as f:
    text = f.read()

# Add to hook destructuring
text = text.replace("setShowFloorPlanModal,", "setShowFloorPlanModal,\n    setShowWeddingCraftModal,")

# Add WeddingCraft icon to import if needed (we can use LayoutTemplate or Paintbrush)
if "LayoutTemplate" not in text:
    text = text.replace("} from 'lucide-react';", "  LayoutTemplate,\n} from 'lucide-react';")

# Add the button into the sandwich menu in Group 1
new_btn = """                            {/* 6. WeddingCraft Studio */}
                            {(isLevel1Admin || isLevel3Planner) && (
                              <button
                                type="button"
                                id="sandwich-btn-weddingcraft"
                                onClick={() => {
                                  setSandwichMenuOpen(false);
                                  setShowWeddingCraftModal(true);
                                }}
                                className="w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors group cursor-pointer border border-[#E8DCCF]/80 hover:border-[#8B3A4A] shadow-2xs"
                              >
                                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-pink-200 shadow-2xs">
                                  <LayoutTemplate className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold flex items-center justify-between text-pink-600">
                                    <span>WeddingCraft Studio</span>
                                  </div>
                                  <p className="text-[10px] text-[#8C8276] truncate font-normal">
                                    Editor visual avanzado
                                  </p>
                                </div>
                              </button>
                            )}"""

text = text.replace("{/* Group 2: Herramientas de Datos */}", new_btn + "\n                          {/* Group 2: Herramientas de Datos */}")

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(text)

print("Navbar patched!")
