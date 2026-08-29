import re

with open('src/context/WeddingContext.tsx', 'r') as f:
    text = f.read()

text = text.replace("setActiveWeddingId: (id: string) => void;\n  selectWedding: (id: string) => void;", "setActiveWeddingId: (id: string) => void;")

with open('src/context/WeddingContext.tsx', 'w') as f:
    f.write(text)
