import re

with open('src/context/WeddingContext.tsx', 'r') as f:
    text = f.read()

text = text.replace("export const WeddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {", "export const WeddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {\n  console.log('Firebase db instance in WeddingContext:', db);")

with open('src/context/WeddingContext.tsx', 'w') as f:
    f.write(text)

print("Context patched for logging!")
