import re

# PATCH 1: Navbar.tsx
with open('src/components/Navbar.tsx', 'r') as f:
    text = f.read()

search_str = """                  id="btn-nav-logo-home"
                  onClick={() => {
                    if (currentUser.isAuthenticated) {
                      setActiveView('public');
                    } else if (activeView === 'tokens') {
                      setActiveView('tokens');
                    } else {
                      setActiveView('public');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer bg-transparent border-0 p-0 m-0 flex items-center justify-center hover:opacity-80 active:scale-98 transition-all focus:outline-hidden group\""""

insert_str = """                  id="btn-nav-logo-home"
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  className="cursor-pointer bg-transparent border-0 p-0 m-0 flex items-center justify-center hover:opacity-80 active:scale-98 transition-all focus:outline-hidden group\""""

if search_str in text:
    text = text.replace(search_str, insert_str)
else:
    print("search_str NOT FOUND in Navbar.tsx")

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(text)

# PATCH 2: WeddingContext.tsx
with open('src/context/WeddingContext.tsx', 'r') as f:
    text2 = f.read()

search_str2 = """  const logout = () => {
    setCurrentUser(DEFAULT_ANONYMOUS_USER);
    try {
      sessionStorage.removeItem('wedding_hub_auth');
    } catch {
      // ignore
    }
    setViewModeState('public');
  };"""

insert_str2 = """  const logout = () => {
    setCurrentUser(DEFAULT_ANONYMOUS_USER);
    try {
      sessionStorage.removeItem('wedding_hub_auth');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };"""

if search_str2 in text2:
    text2 = text2.replace(search_str2, insert_str2)
else:
    print("search_str2 NOT FOUND in WeddingContext.tsx")

with open('src/context/WeddingContext.tsx', 'w') as f:
    f.write(text2)

