with open('src/context/WeddingContext.tsx', 'r') as f:
    text = f.read()

text = text.replace("        activeWeddingId,\n        activeWedding,\n        selectWedding,", "        activeWeddingId,\n        activeWedding,\n        setActiveWeddingId,\n        selectWedding,")

with open('src/context/WeddingContext.tsx', 'w') as f:
    f.write(text)
