import re

with open('src/types.ts', 'r') as f:
    code = f.read()

code = code.replace("  showBankDetails?: boolean; // Toggle si se muestra o no la información bancaria en la Web de Invitados",
                    "  showGiftRegistry?: boolean;\n  giftRegistryTitle?: string;\n  giftRegistryMessage?: string;\n  showBankDetails?: boolean; // Toggle si se muestra o no la información bancaria en la Web de Invitados")

with open('src/types.ts', 'w') as f:
    f.write(code)
print("Updated types")
