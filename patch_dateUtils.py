with open('src/lib/dateUtils.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific block
content = content.replace(
"""  // If hours < 6 (e.g. 00:30, 01:30, 02:00, 03:00, 04:00, 05:00)
  // this is past-midnight party/celebration in the wedding day sequence
  if (hours < 6) {
    hours += 24;
  }""",
"  // Removed +24h logic for early hours as requested by user to sort strictly chronologically")

with open('src/lib/dateUtils.ts', 'w', encoding='utf-8') as f:
    f.write(content)

