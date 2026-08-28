import re

with open('src/data/initialData.ts', 'r') as f:
    code = f.read()

code = code.replace("  showBankDetails: true,",
                    "  showGiftRegistry: true,\n  giftRegistryTitle: 'Mesa de Regalos & Transferencias',\n  giftRegistryMessage: 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle adicional con nosotros para nuestro nuevo hogar y luna de miel, ponemos a tu disposición nuestras opciones.',\n  showBankDetails: true,")

with open('src/data/initialData.ts', 'w') as f:
    f.write(code)
print("Updated initialData")
