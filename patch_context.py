import re

with open('src/context/WeddingContext.tsx', 'r') as f:
    text = f.read()

# Add setActiveWeddingId, selectWedding to WeddingContextType
type_str = """  isPlannerOrAdmin: boolean;
  canCreateWedding: boolean;
  canManageUsers: boolean;
  canEditActiveWedding: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showNewWeddingModal: boolean;
  setShowNewWeddingModal: (show: boolean) => void;
"""
type_str_new = type_str + """  setActiveWeddingId: (id: string) => void;
  selectWedding: (id: string) => void;
"""

text = text.replace(type_str, type_str_new)

with open('src/context/WeddingContext.tsx', 'w') as f:
    f.write(text)
