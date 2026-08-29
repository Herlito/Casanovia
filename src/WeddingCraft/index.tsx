import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { WeddingCraftEditor } from './components/WeddingCraftEditor';
import { WeddingDesignDocument } from './types';

export * from './types';
export * from './adapter/EventDataAdapter';

let editorRoot: Root | null = null;

export interface MountWeddingCraftOptions {
  container: HTMLElement;
  externalAPI: any; // Adapter input
  initialDocument?: WeddingDesignDocument;
  onClose?: () => void;
}

/**
 * Mounts the WeddingCraft Editor in a sandboxed, isolated manner.
 * Safe to call from any legacy or modern parent application.
 */
export function mountWeddingCraft(options: MountWeddingCraftOptions) {
  const { container, externalAPI, initialDocument, onClose } = options;

  // 1. Check for canvas conflicts in the container
  if (container.querySelector('canvas')) {
    console.error('WeddingCraft Conflict: Another canvas is already active in the container.');
    return;
  }

  // 2. Initialize React Root cleanly
  if (editorRoot) {
    editorRoot.unmount();
  }
  
  editorRoot = createRoot(container);

  const handleClose = () => {
    unmountWeddingCraft();
    if (onClose) onClose();
  };

  editorRoot.render(
    <React.StrictMode>
      <WeddingCraftEditor 
        externalAPI={externalAPI} 
        initialDocument={initialDocument}
        onClose={handleClose} 
      />
    </React.StrictMode>
  );
}

/**
 * Unmounts the editor and cleans up all DOM events and memory.
 */
export function unmountWeddingCraft() {
  if (editorRoot) {
    editorRoot.unmount();
    editorRoot = null;
  }
}
