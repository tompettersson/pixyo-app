'use client';

import React, { useCallback, useEffect, useState } from 'react';
import BrandDesignPanel from '@/components/brand-design/BrandDesignPanel';
import PreviewContainer from '@/components/brand-design/preview/PreviewContainer';
import AiDesignDialog from '@/components/brand-design/AiDesignDialog';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { TemporalState } from 'zundo';

export default function BrandDesignPage() {
  const store = useBrandDesignStore();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const { undo, redo } = useStoreWithEqualityFn(
    useBrandDesignStore.temporal,
    (state: TemporalState<unknown>) => ({ undo: state.undo, redo: state.redo })
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      // Cmd+K for AI dialog
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAiDialogOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Save handler
  const handleSave = useCallback(async () => {
    const { profileId, tokens, setIsSaving, markSaved } = useBrandDesignStore.getState();
    if (!profileId) return;

    setIsSaving(true);
    try {
      const { deriveProfileFields } = await import('@/lib/brand-design/derive-profile-fields');
      const legacyFields = deriveProfileFields(tokens);

      const res = await fetch(`/api/profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...legacyFields,
          designTokens: tokens,
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      markSaved();
    } catch (err) {
      console.error('Save error:', err);
      setIsSaving(false);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Sticky Header ──────────────────────────────── */}
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-7" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Brand Design</h1>
              <p className="text-xs text-zinc-500">
                Design-System &middot; Live-Preview &middot; Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Generate button */}
            <button
              onClick={() => setAiDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium
                bg-gradient-to-r from-violet-600 to-indigo-600 text-white
                hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
              title="KI-Generierung (Cmd+K)"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              KI
            </button>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => undo()}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Rückgängig (Cmd+Z)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H12" />
                  <path d="M7 14l-4-4 4-4" />
                </svg>
              </button>
              <button
                onClick={() => redo()}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Wiederholen (Cmd+Shift+Z)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10H11a5 5 0 00-5 5v0a5 5 0 005 5h1" />
                  <path d="M17 14l4-4-4-4" />
                </svg>
              </button>
            </div>

            {/* Save Button */}
            {store.profileId && (
              <button
                onClick={handleSave}
                disabled={!store.isDirty || store.isSaving}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
                  store.isDirty
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {store.isSaving ? 'Speichern...' : store.isDirty ? 'Speichern' : 'Gespeichert'}
              </button>
            )}

            {/* Back to Dashboard */}
            <a
              href="/"
              className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Tools
            </a>
          </div>
        </div>
      </header>

      {/* ── Main: Panel + Preview ──────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Config Panel */}
        <div className="w-[380px] shrink-0 flex flex-col bg-zinc-900/80 backdrop-blur-sm border-r border-zinc-800">
          <div className="flex-1 overflow-y-auto">
            <BrandDesignPanel />
          </div>
        </div>

        {/* Right: Preview */}
        <main className="flex-1 overflow-y-auto">
          <PreviewContainer />
        </main>
      </div>

      {/* AI Dialog */}
      <AiDesignDialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} />
    </div>
  );
}
