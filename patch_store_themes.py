import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    text = f.read()

actions = """  setTheme: (theme: ThemePreset) => void;
  applyThemeToExistingElements: (theme: ThemePreset) => void;
  addCustomTheme: (theme: ThemePreset) => void;
  updateCustomTheme: (id: string, theme: ThemePreset) => void;
  deleteCustomTheme: (id: string) => void;"""

text = text.replace('  setTheme: (theme: ThemePreset) => void;\n  applyThemeToExistingElements: (theme: ThemePreset) => void;', actions)

impls = """  setTheme: (theme) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      state.document.theme = theme;
      state.document.canvas.backgroundColor = theme.palette.background;
    }));
    document.documentElement.style.setProperty('--wc-primary', theme.palette.primary);
    document.documentElement.style.setProperty('--wc-secondary', theme.palette.secondary);
    document.documentElement.style.setProperty('--wc-bg', theme.palette.background);
    document.documentElement.style.setProperty('--wc-text', theme.palette.text);
  },
  addCustomTheme: (theme) => set(produce((state: EditorState) => {
    if (!state.document.customThemes) state.document.customThemes = [];
    state.document.customThemes.push(theme);
  })),
  updateCustomTheme: (id, theme) => set(produce((state: EditorState) => {
    if (!state.document.customThemes) return;
    const index = state.document.customThemes.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      state.document.customThemes[index] = theme;
      if (state.document.theme.id === id) {
        state.document.theme = theme;
        state.document.canvas.backgroundColor = theme.palette.background;
      }
    }
  })),
  deleteCustomTheme: (id) => set(produce((state: EditorState) => {
    if (!state.document.customThemes) return;
    state.document.customThemes = state.document.customThemes.filter((t: any) => t.id !== id);
    if (state.document.theme.id === id) {
      state.document.theme = predefinedThemes[0];
      state.document.canvas.backgroundColor = predefinedThemes[0].palette.background;
    }
  })),"""

text = text.replace("""  setTheme: (theme) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      state.document.theme = theme;
      state.document.canvas.backgroundColor = theme.palette.background;
    }));
    document.documentElement.style.setProperty('--wc-primary', theme.palette.primary);
    document.documentElement.style.setProperty('--wc-secondary', theme.palette.secondary);
    document.documentElement.style.setProperty('--wc-bg', theme.palette.background);
    document.documentElement.style.setProperty('--wc-text', theme.palette.text);
  },""", impls)

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(text)
