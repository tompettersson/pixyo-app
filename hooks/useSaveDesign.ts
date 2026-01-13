'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type Konva from 'konva';

const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_QUALITY = 0.8;

interface UseSaveDesignOptions {
  stageRef?: React.RefObject<Konva.Stage | null>;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Hook für manuelles Speichern von Designs.
 * Kein Auto-Save - User entscheidet wann gespeichert wird.
 * Thumbnail wird nur beim manuellen Save generiert.
 */
export function useSaveDesign(options: UseSaveDesignOptions = {}) {
  const { stageRef, onSaveStart, onSaveSuccess, onSaveError } = options;

  const isSavingRef = useRef(false);

  // Get store state and actions
  const activeDesignId = useEditorStore((state) => state.design.activeDesignId);
  const isDirty = useEditorStore((state) => state.design.isDirty);
  const isSaving = useEditorStore((state) => state.design.isSaving);
  const getDesignState = useEditorStore((state) => state.getDesignState);
  const setIsSaving = useEditorStore((state) => state.setIsSaving);
  const markClean = useEditorStore((state) => state.markClean);
  const updateDesignInList = useEditorStore((state) => state.updateDesignInList);

  // Generate thumbnail from stage
  const generateThumbnail = useCallback(async (): Promise<Blob | null> => {
    if (!stageRef?.current) return null;

    try {
      const stage = stageRef.current;
      const stageWidth = stage.width();

      // Export stage to data URL
      const dataUrl = stage.toDataURL({
        pixelRatio: THUMBNAIL_WIDTH / stageWidth,
        mimeType: 'image/jpeg',
        quality: THUMBNAIL_QUALITY,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return null;
    }
  }, [stageRef]);

  // Upload thumbnail
  const uploadThumbnail = useCallback(async (designId: string, blob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('thumbnail', blob, 'thumbnail.jpg');

      const response = await fetch(`/api/designs/${designId}/thumbnail`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Thumbnail upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data.thumbnailUrl;
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
      return null;
    }
  }, []);

  // Manual save function
  const save = useCallback(async () => {
    if (!activeDesignId || isSavingRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);
    onSaveStart?.();

    try {
      const designState = getDesignState();

      // Save design state
      const response = await fetch(`/api/designs/${activeDesignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasState: designState.canvasState,
          layers: designState.layers,
          overlayOpacity: designState.overlayOpacity,
          content: designState.content,
          backgroundImage: designState.backgroundImage,
          overlay: designState.overlay,
          productImage: designState.productImage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const { design: updatedDesign } = await response.json();

      // Generate and upload thumbnail
      let thumbnailUrl = updatedDesign.thumbnailUrl;
      const thumbnailBlob = await generateThumbnail();
      if (thumbnailBlob) {
        const newThumbnailUrl = await uploadThumbnail(activeDesignId, thumbnailBlob);
        if (newThumbnailUrl) {
          thumbnailUrl = newThumbnailUrl;
        }
      }

      // Update design in list
      updateDesignInList(activeDesignId, {
        updatedAt: updatedDesign.updatedAt,
        thumbnailUrl,
        canvasState: designState.canvasState,
        layers: designState.layers,
        overlayOpacity: designState.overlayOpacity,
        content: designState.content,
        backgroundImage: designState.backgroundImage,
        overlay: designState.overlay,
      });

      markClean();
      onSaveSuccess?.();
    } catch (error) {
      console.error('Save error:', error);
      onSaveError?.(error instanceof Error ? error : new Error('Save failed'));
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [activeDesignId, getDesignState, setIsSaving, markClean, updateDesignInList, generateThumbnail, uploadThumbnail, onSaveStart, onSaveSuccess, onSaveError]);

  // Subscribe to store changes to track dirty state (no auto-save)
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe(
      (state, prevState) => {
        // Skip wenn Design gerade geladen wird
        if (state.design.isLoadingDesign) {
          return;
        }

        // Only mark dirty if content actually changed
        const canvasChanged = state.canvas !== prevState.canvas;
        const layersChanged = state.layers !== prevState.layers;
        const overlayChanged = state.overlayOpacity !== prevState.overlayOpacity;
        const contentChanged = state.content !== prevState.content;
        const backgroundImageChanged = state.backgroundImageState !== prevState.backgroundImageState;
        const designOverlayChanged = state.designOverlay !== prevState.designOverlay;

        if (canvasChanged || layersChanged || overlayChanged || contentChanged || backgroundImageChanged || designOverlayChanged) {
          // Mark as dirty if we have an active design (no auto-save trigger)
          if (state.design.activeDesignId && !state.design.isDirty) {
            useEditorStore.getState().markDirty();
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    save,
    isSaving,
    isDirty,
  };
}
