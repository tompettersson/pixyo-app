'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  useBannerConfigStore,
  extractBannerConfig,
  type BannerPresetMeta,
  type BannerPresetFull,
} from '@/store/useBannerConfigStore';
import { useSaveBannerPreset } from '@/hooks/useSaveBannerPreset';

export default function BannerPresetBar() {
  const profileId = useBannerConfigStore((s) => s.profileId);
  const activePresetId = useBannerConfigStore((s) => s.activePresetId);
  const presets = useBannerConfigStore((s) => s.presets);
  const isDirty = useBannerConfigStore((s) => s.isDirty);
  const setPresets = useBannerConfigStore((s) => s.setPresets);
  const loadPreset = useBannerConfigStore((s) => s.loadPreset);
  const removePresetFromList = useBannerConfigStore((s) => s.removePresetFromList);

  const { isSaving, lastSaved, save } = useSaveBannerPreset();

  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const renameInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Fetch presets when profile changes
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    fetch(`/api/banner-presets?profileId=${profileId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.presets) {
          setPresets(data.presets);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [profileId, setPresets]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenuId) return;
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenuId]);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Create new preset from current config
  const handleCreate = useCallback(async () => {
    if (!profileId || creating) return;
    setCreating(true);

    try {
      const config = extractBannerConfig(useBannerConfigStore.getState());
      const response = await fetch('/api/banner-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, config }),
      });

      if (response.ok) {
        const { preset } = await response.json();
        useBannerConfigStore.getState().setPresets([
          { id: preset.id, name: preset.name, thumbnailUrl: preset.thumbnailUrl, updatedAt: preset.updatedAt },
          ...presets,
        ]);
        useBannerConfigStore.getState().setActivePresetId(preset.id);
        useBannerConfigStore.getState().markClean();
      }
    } catch (error) {
      console.error('Failed to create preset:', error);
    } finally {
      setCreating(false);
    }
  }, [profileId, presets, creating]);

  // Load a preset (with unsaved changes guard)
  const handleSelect = useCallback(async (presetMeta: BannerPresetMeta) => {
    if (presetMeta.id === activePresetId) return;

    if (isDirty) {
      const confirmed = window.confirm('Ungespeicherte Änderungen verwerfen?');
      if (!confirmed) return;
    }

    try {
      const response = await fetch(`/api/banner-presets/${presetMeta.id}`);
      if (!response.ok) return;
      const { preset } = await response.json();
      loadPreset({
        id: preset.id,
        name: preset.name,
        thumbnailUrl: preset.thumbnailUrl,
        updatedAt: preset.updatedAt,
        config: preset.config as ReturnType<typeof extractBannerConfig>,
      });
    } catch (error) {
      console.error('Failed to load preset:', error);
    }
  }, [activePresetId, isDirty, loadPreset]);

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenuId(id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Rename
  const startRename = (preset: BannerPresetMeta) => {
    setRenamingId(preset.id);
    setRenameValue(preset.name);
    setContextMenuId(null);
  };

  const finishRename = async () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }

    try {
      const response = await fetch(`/api/banner-presets/${renamingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });

      if (response.ok) {
        useBannerConfigStore.getState().updatePresetInList(renamingId, { name: renameValue.trim() });
      }
    } catch (error) {
      console.error('Failed to rename preset:', error);
    } finally {
      setRenamingId(null);
    }
  };

  // Duplicate
  const handleDuplicate = async (preset: BannerPresetMeta) => {
    setContextMenuId(null);
    if (!profileId) return;

    try {
      // Load full preset data
      const loadRes = await fetch(`/api/banner-presets/${preset.id}`);
      if (!loadRes.ok) return;
      const { preset: fullPreset } = await loadRes.json();

      const response = await fetch('/api/banner-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          name: `${preset.name} (Kopie)`,
          config: fullPreset.config,
        }),
      });

      if (response.ok) {
        const { preset: newPreset } = await response.json();
        useBannerConfigStore.getState().setPresets([
          { id: newPreset.id, name: newPreset.name, thumbnailUrl: newPreset.thumbnailUrl, updatedAt: newPreset.updatedAt },
          ...presets,
        ]);
      }
    } catch (error) {
      console.error('Failed to duplicate preset:', error);
    }
  };

  // Delete
  const handleDelete = async (preset: BannerPresetMeta) => {
    setContextMenuId(null);
    const confirmed = window.confirm(`"${preset.name}" wirklich löschen?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/banner-presets/${preset.id}`, { method: 'DELETE' });
      if (response.ok) {
        removePresetFromList(preset.id);
      }
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  if (!profileId) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 overflow-x-auto">
      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={creating}
        className="shrink-0 w-12 h-12 rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500 flex items-center justify-center transition-colors disabled:opacity-50"
        title="Neues Bannerset"
      >
        {creating ? (
          <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>

      {/* Preset thumbnails */}
      {presets.map((preset) => (
        <div key={preset.id} className="relative shrink-0 group">
          <button
            onClick={() => handleSelect(preset)}
            onContextMenu={(e) => handleContextMenu(e, preset.id)}
            className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
              activePresetId === preset.id
                ? 'border-violet-500 ring-1 ring-violet-500/50'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}
            title={preset.name}
          >
            {renamingId === preset.id ? (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={finishRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') finishRename();
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="w-10 text-[8px] text-center bg-transparent text-white outline-none"
                />
              </div>
            ) : preset.thumbnailUrl ? (
              <img
                src={preset.thumbnailUrl}
                alt={preset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-[9px] text-zinc-500 leading-tight text-center px-0.5 truncate">
                  {preset.name}
                </span>
              </div>
            )}
          </button>

          {/* Dirty indicator */}
          {activePresetId === preset.id && isDirty && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-zinc-900" />
          )}

          {/* Saving spinner */}
          {activePresetId === preset.id && isSaving && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5">
              <div className="w-full h-full border border-violet-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ))}

      {/* Save status */}
      {activePresetId && (
        <div className="shrink-0 ml-auto text-[10px] text-zinc-600">
          {isSaving ? 'Speichern...' : isDirty ? 'Ungespeichert' : lastSaved ? 'Gespeichert' : ''}
        </div>
      )}

      {/* Context menu */}
      {contextMenuId && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[140px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          {(() => {
            const preset = presets.find((p) => p.id === contextMenuId);
            if (!preset) return null;
            return (
              <>
                <button
                  onClick={() => startRename(preset)}
                  className="w-full px-3 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Umbenennen
                </button>
                <button
                  onClick={() => handleDuplicate(preset)}
                  className="w-full px-3 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Duplizieren
                </button>
                <div className="border-t border-zinc-700 my-1" />
                <button
                  onClick={() => handleDelete(preset)}
                  className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                >
                  Löschen
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
