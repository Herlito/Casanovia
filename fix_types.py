import re

with open('src/WeddingCraft/types.ts', 'r') as f:
    content = f.read()

old_style = "  fill?: string;"
new_style = """  fill?: string;
  gradientEnabled?: boolean;
  gradientType?: 'linear' | 'radial';
  gradientColors?: string[];
  gradientStops?: number[];"""

if "gradientEnabled" not in content:
    content = content.replace(old_style, new_style)
    with open('src/WeddingCraft/types.ts', 'w') as f:
        f.write(content)
