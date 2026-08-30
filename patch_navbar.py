import re

with open('src/components/Navbar.tsx', 'r') as f:
    text = f.read()

# Replace in center menu
text = text.replace(
    'id="btn-sandwich-menu-center"\n                    onClick={() => setSandwichMenuOpen(!sandwichMenuOpen)}',
    '''id="btn-sandwich-menu-center"
                    onClick={() => {
                      if (!currentUser.isAuthenticated) {
                        setShowAuthModal(true);
                      } else {
                        setSandwichMenuOpen(!sandwichMenuOpen);
                      }
                    }}'''
)

# Replace in right menu
text = text.replace(
    'id="btn-sandwich-menu"\n                    onClick={() => setSandwichMenuOpen(!sandwichMenuOpen)}',
    '''id="btn-sandwich-menu"
                    onClick={() => {
                      if (!currentUser.isAuthenticated) {
                        setShowAuthModal(true);
                      } else {
                        setSandwichMenuOpen(!sandwichMenuOpen);
                      }
                    }}'''
)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(text)
