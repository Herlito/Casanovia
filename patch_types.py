import re

with open('src/WeddingCraft/types.ts', 'r') as f:
    text = f.read()

# Add new properties to ElementStyle
old_style = "export interface ElementStyle {"
new_style = """export interface ElementStyle {
  variant?: string;
  numberColor?: string;
  labelColor?: string;
  titleColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  gap?: number;
  borderRadius?: number;
  paddingX?: number;
  paddingY?: number;
  numberSize?: number;
  labelSize?: number;
  numberFont?: string;
  labelFont?: string;"""

text = text.replace(old_style, new_style)

with open('src/WeddingCraft/types.ts', 'w') as f:
    f.write(text)
