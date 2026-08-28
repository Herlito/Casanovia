import re

with open('src/components/public/GiftRegistrySection.tsx', 'r') as f:
    code = f.read()

# Add check to return null if showGiftRegistry is false
code = code.replace(
    "const copyText = (text: string, fieldName: string) => {",
    "if (settings.showGiftRegistry === false) return null;\n\n  const copyText = (text: string, fieldName: string) => {"
)

# Replace Title
code = code.replace(
    "Mesa de Regalos & Transferencias\n          </h2>",
    "{settings.giftRegistryTitle || 'Mesa de Regalos & Transferencias'}\n          </h2>"
)

# Replace Message
code = code.replace(
    "Tu presencia es nuestro mejor regalo. Si deseas tener un detalle adicional con nosotros para nuestro nuevo hogar y luna de miel, ponemos a tu disposición nuestras opciones.\n          </p>",
    "{settings.giftRegistryMessage || 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle adicional con nosotros para nuestro nuevo hogar y luna de miel, ponemos a tu disposición nuestras opciones.'}\n          </p>"
)

with open('src/components/public/GiftRegistrySection.tsx', 'w') as f:
    f.write(code)
print("Updated GiftRegistrySection")
