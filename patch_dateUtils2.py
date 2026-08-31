with open('src/lib/dateUtils.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("if (h < 6) h += 24;", "// if (h < 6) h += 24; removed to sort strictly")

with open('src/lib/dateUtils.ts', 'w', encoding='utf-8') as f:
    f.write(content)

