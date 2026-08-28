import re

with open('src/components/public/HeroCountdown.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarte a celebrar la unión de nuestras vidas.",
    "{settings.romanticQuote || 'Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarte a celebrar la unión de nuestras vidas.'}"
)

with open('src/components/public/HeroCountdown.tsx', 'w') as f:
    f.write(code)

print("Patched HeroCountdown.tsx")
