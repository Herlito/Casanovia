import { useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when typing in inputs or textareas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const state = useEditorStore.getState();
      const selectedIds = state.selectedElementIds;

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        state.undo();
        return;
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z
      if (
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        state.redo();
        return;
      }

      // Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          state.deleteElements(selectedIds);
        }
        return;
      }

      // Arrow keys to move
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedIds.length > 0) {
          e.preventDefault();
          const moveAmount = e.shiftKey ? 10 : 1; // Shift to move faster
          
          state.commitHistory(); // Commit history once before moving

          selectedIds.forEach(id => {
            const el = state.document.pages[0].elements.find(e => e.id === id);
            if (el && !el.locked) {
              const newTransform = { ...el.transform };
              if (e.key === 'ArrowUp') newTransform.y -= moveAmount;
              if (e.key === 'ArrowDown') newTransform.y += moveAmount;
              if (e.key === 'ArrowLeft') newTransform.x -= moveAmount;
              if (e.key === 'ArrowRight') newTransform.x += moveAmount;
              
              state.updateElement(id, { transform: newTransform });
            }
          });
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
