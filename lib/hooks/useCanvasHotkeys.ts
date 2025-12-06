'use client';

import { useEffect } from 'react';
import { useEditorStore, useTemporalStore } from '@/store/useEditorStore';

export function useCanvasHotkeys() {
  const { selectedLayerId, removeLayer, duplicateLayer, selectLayer, layers } = useEditorStore();
  const { undo, redo } = useTemporalStore((state) => ({
    undo: state.undo,
    redo: state.redo,
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Delete selected layer
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
        e.preventDefault();
        const layer = layers.find((l) => l.id === selectedLayerId);
        // Don't delete background
        if (layer && layer.type !== 'background') {
          removeLayer(selectedLayerId);
        }
      }

      // Undo: Ctrl/Cmd + Z
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((cmdOrCtrl && e.key === 'z' && e.shiftKey) || (cmdOrCtrl && e.key === 'y')) {
        e.preventDefault();
        redo();
      }

      // Duplicate: Ctrl/Cmd + D
      if (cmdOrCtrl && e.key === 'd' && selectedLayerId) {
        e.preventDefault();
        const layer = layers.find((l) => l.id === selectedLayerId);
        if (layer && layer.type !== 'background') {
          duplicateLayer(selectedLayerId);
        }
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        selectLayer(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, removeLayer, duplicateLayer, selectLayer, layers, undo, redo]);
}




