import re

with open('src/components/public/HeroCountdown.tsx', 'r') as f:
    code = f.read()

replacement = """  const isWedding = !settings.eventType || settings.eventType === 'Boda';
  const brideFirstName = (settings.brideName ? settings.brideName.split(' ')[0] : settings.coupleNames?.split('&')[0]?.trim()) || 'Novia';
  const groomFirstName = (settings.groomName ? settings.groomName.split(' ')[0] : settings.coupleNames?.split('&')[1]?.trim()) || 'Novio';

  const displayTitle = isWedding ? (
    <>
      {brideFirstName}{' '}
      <span className="font-editorial italic font-normal text-[#8B3A4A] theme-primary-text text-4xl sm:text-6xl md:text-7xl inline-block mx-0.5 align-middle">
        &
      </span>{' '}
      {groomFirstName}
    </>
  ) : (
    <>{settings.coupleNames}</>
  );"""

code = code.replace(
    "const brideFirstName = (settings.brideName ? settings.brideName.split(' ')[0] : settings.coupleNames?.split('&')[0]?.trim()) || 'Novia';\n  const groomFirstName = (settings.groomName ? settings.groomName.split(' ')[0] : settings.coupleNames?.split('&')[1]?.trim()) || 'Novio';",
    replacement
)

code = code.replace(
"""        <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#2D2A26] tracking-tight leading-none mb-2">
          {brideFirstName}{' '}
          <span className="font-editorial italic font-normal text-[#8B3A4A] theme-primary-text text-4xl sm:text-6xl md:text-7xl inline-block mx-0.5 align-middle">
            &
          </span>{' '}
          {groomFirstName}
        </h1>""",
"""        <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#2D2A26] tracking-tight leading-none mb-2">
          {displayTitle}
        </h1>"""
)

with open('src/components/public/HeroCountdown.tsx', 'w') as f:
    f.write(code)
print("Updated HeroCountdown")
