'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useBannerConfigStore, extractBannerConfig } from '@/store/useBannerConfigStore';

const AUTO_SAVE_DELAY_MS = 5000;

export function useSaveBannerPreset() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isSavingRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quiet save (auto-save): config only, no thumbnail
  const saveQuiet = useCallback(async () => {
    const state = useBannerConfigStore.getState();
    if (!state.activePresetId || !state.isDirty || isSavingRef.current || state.isLoadingPreset) return;

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const config = extractBannerConfig(state);
      const response = await fetch(`/api/banner-presets/${state.activePresetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (response.ok) {
        const { preset } = await response.json();
        useBannerConfigStore.getState().markClean();
        useBannerConfigStore.getState().updatePresetInList(preset.id, {
          updatedAt: preset.updatedAt,
        });
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save banner preset error:', error);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  // Manual save with thumbnail
  const save = useCallback(async (thumbnailBlob?: Blob | null) => {
    const state = useBannerConfigStore.getState();
    if (!state.activePresetId || isSavingRef.current) return;

    // Cancel pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const config = extractBannerConfig(state);

      if (thumbnailBlob) {
        const formData = new FormData();
        formData.append('config', JSON.stringify(config));
        formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg');

        const response = await fetch(`/api/banner-presets/${state.activePresetId}`, {
          method: 'PUT',
          body: formData,
        });

        if (response.ok) {
          const { preset } = await response.json();
          useBannerConfigStore.getState().markClean();
          useBannerConfigStore.getState().updatePresetInList(preset.id, {
            updatedAt: preset.updatedAt,
            thumbnailUrl: preset.thumbnailUrl,
          });
          setLastSaved(new Date());
        }
      } else {
        const response = await fetch(`/api/banner-presets/${state.activePresetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config }),
        });

        if (response.ok) {
          const { preset } = await response.json();
          useBannerConfigStore.getState().markClean();
          useBannerConfigStore.getState().updatePresetInList(preset.id, {
            updatedAt: preset.updatedAt,
          });
          setLastSaved(new Date());
        }
      }
    } catch (error) {
      console.error('Save banner preset error:', error);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  // Subscribe to store changes for auto-save
  useEffect(() => {
    const unsubscribe = useBannerConfigStore.subscribe(
      (state, prevState) => {
        // Skip if loading preset or no active preset
        if (state.isLoadingPreset || !state.activePresetId) return;

        // Check if any BannerConfig field changed
        if (state.isDirty && !prevState.isDirty) {
          // Debounced auto-save
          if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
          }
          autoSaveTimerRef.current = setTimeout(() => {
            saveQuiet();
          }, AUTO_SAVE_DELAY_MS);
        }

        // Also reset timer if isDirty was already true but config changed again
        if (state.isDirty && prevState.isDirty) {
          const configChanged = (
            state.activePattern !== prevState.activePattern ||
            state.colorFrom !== prevState.colorFrom ||
            state.headline !== prevState.headline ||
            state.bgImageUrl !== prevState.bgImageUrl
            // Simplified check — the full equality is in Zundo
          );
          if (configChanged) {
            if (autoSaveTimerRef.current) {
              clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = setTimeout(() => {
              saveQuiet();
            }, AUTO_SAVE_DELAY_MS);
          }
        }
      }
    );

    return () => {
      unsubscribe();
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [saveQuiet]);

  return { isSaving, lastSaved, save, saveQuiet };
}
