'use client';

import { useEffect, useCallback } from 'react';
import { useFormatizer } from '@/hooks/useFormatizer';
import { useEditorStore } from '@/store/useEditorStore';
import type { Customer } from '@/types/customer';
import type { DesignSnapshot, ContentLevel, RenderResult } from '@/lib/formatizer/types';

interface FormatizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: Customer | null;
}

/** Map content level to display info */
const LEVEL_PILLS: Record<ContentLevel, { label: string; color: string; tooltip: string }> = {
  FULL: {
    label: 'Komplett',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    tooltip: 'Alle Elemente: Tagline, Headline, Body, Button, Logo',
  },
  REDUCED_NO_CTA: {
    label: 'Ohne CTA',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    tooltip: 'CTA-Button wurde entfernt, um in das Format zu passen',
  },
  HEADLINE_ONLY: {
    label: 'Nur Headline',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    tooltip: 'Nur Headline + Logo – Body und CTA passen nicht',
  },
  IMAGE_ONLY_LOGO: {
    label: 'Nur Bild',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    tooltip: 'Nur Hintergrundbild + Logo – kein Text möglich',
  },
  SKIP: {
    label: 'Übersprungen',
    color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    tooltip: 'Format zu klein für jede Darstellung',
  },
};

/** Format ratio labels for display */
const RATIO_LABELS: Record<string, { platform: string; desc: string }> = {
  '1:1': { platform: 'Instagram Post', desc: '1080 × 1080' },
  '4:5': { platform: 'Instagram Feed', desc: '1080 × 1350' },
  '9:16': { platform: 'Story / Reels', desc: '1080 × 1920' },
  '16:9': { platform: 'YouTube / LinkedIn', desc: '1920 × 1080' },
};

export function FormatizerModal({ isOpen, onClose, currentCustomer }: FormatizerModalProps) {
  const {
    phase,
    results,
    progress,
    totalFormats,
    startBatchRender,
    downloadZip,
    downloadSingle,
    reset,
  } = useFormatizer();

  // Close handler: reset state and close
  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  // Build snapshot from store + customer
  const buildSnapshot = useCallback((): DesignSnapshot | null => {
    if (!currentCustomer) return null;

    const state = useEditorStore.getState();
    return {
      content: state.content,
      backgroundImage: state.backgroundImageState,
      overlay: state.designOverlay,
      backgroundColor: state.canvas.backgroundColor,
      sourceCanvasWidth: state.canvas.width,
      sourceCanvasHeight: state.canvas.height,
      customer: {
        logo: currentCustomer.logo,
        logoVariants: currentCustomer.logoVariants,
        colors: currentCustomer.colors,
        fonts: currentCustomer.fonts,
        layout: currentCustomer.layout,
      },
    };
  }, [currentCustomer]);

  const handleStartRender = useCallback(async () => {
    const snapshot = buildSnapshot();
    if (!snapshot) return;
    await startBatchRender(snapshot);
  }, [buildSnapshot, startBatchRender]);

  const handleDownloadZip = useCallback(() => {
    const designName = currentCustomer?.name ?? 'Design';
    downloadZip(designName);
  }, [currentCustomer, downloadZip]);

  if (!isOpen) return null;

  const progressPercent = totalFormats > 0 ? Math.round((progress / totalFormats) * 100) : 0;
  const doneCount = results.filter((r) => r.status === 'done').length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/50 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Alle Formate exportieren</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {phase === 'idle' && 'Dein Design wird automatisch für 4 Social-Media-Formate optimiert'}
              {phase === 'rendering' && `Generiere Format ${progress} von ${totalFormats}...`}
              {phase === 'done' && `${doneCount} Formate erfolgreich generiert`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar (rendering phase) */}
        {phase === 'rendering' && (
          <div className="px-6 pt-4">
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            {phase === 'idle'
              ? renderPlaceholderCards()
              : results.map((result) => renderResultCard(result, downloadSingle))
            }
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/50 flex items-center justify-end gap-3 flex-shrink-0">
          {phase === 'idle' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleStartRender}
                disabled={!currentCustomer}
                className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium
                           hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Formate generieren
              </button>
            </>
          )}

          {phase === 'rendering' && (
            <button
              disabled
              className="px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-500 text-sm font-medium cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rendere...
              </span>
            </button>
          )}

          {phase === 'done' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Schließen
              </button>
              <button
                onClick={handleDownloadZip}
                disabled={doneCount === 0}
                className="px-5 py-2.5 rounded-lg bg-white text-zinc-900 text-sm font-medium
                           hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ZIP herunterladen ({doneCount} Formate)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Render placeholder cards for the idle state */
function renderPlaceholderCards() {
  const ratios = ['1:1', '4:5', '9:16', '16:9'];

  return ratios.map((ratio) => {
    const info = RATIO_LABELS[ratio];
    return (
      <div
        key={ratio}
        className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex flex-col gap-3"
      >
        {/* Aspect ratio preview placeholder */}
        <div className="relative w-full bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center"
          style={{ aspectRatio: ratio.replace(':', '/') }}
        >
          <span className="text-2xl font-bold text-zinc-700">{ratio}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-300">{info?.platform ?? ratio}</p>
          <p className="text-xs text-zinc-600">{info?.desc ?? ''}</p>
        </div>
      </div>
    );
  });
}

/** Render a single result card */
function renderResultCard(result: RenderResult, onDownload: (ratioId: string) => void) {
  const info = RATIO_LABELS[result.ratioId];
  const pill = LEVEL_PILLS[result.contentLevel];

  return (
    <div
      key={result.ratioId}
      className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex flex-col gap-3"
    >
      {/* Preview area */}
      <div
        className="relative w-full bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: result.ratioId.replace(':', '/') }}
      >
        {result.status === 'pending' || result.status === 'rendering' ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-6 h-6 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-zinc-600">
              {result.status === 'rendering' ? 'Rendere...' : 'Wartend'}
            </span>
          </div>
        ) : result.status === 'done' && result.thumbnailUrl ? (
          <img
            src={result.thumbnailUrl}
            alt={`${result.ratioId} Preview`}
            className="w-full h-full object-contain"
          />
        ) : result.status === 'skipped' ? (
          <span className="text-xs text-zinc-600">Übersprungen</span>
        ) : (
          <span className="text-xs text-red-400">Fehler</span>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-300 truncate">
            {info?.platform ?? result.ratioId}
          </p>
          <p className="text-xs text-zinc-600">
            {result.width} × {result.height}
          </p>
        </div>

        {/* Status pill */}
        <div className="relative group flex-shrink-0">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${pill.color}`}
          >
            {pill.label}
          </span>
          {/* Tooltip */}
          {result.warnings.length > 0 && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg
                            text-xs text-zinc-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none z-50 shadow-xl">
              {result.warnings.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Single download button */}
      {result.status === 'done' && (
        <button
          onClick={() => onDownload(result.ratioId)}
          className="w-full px-3 py-1.5 rounded-lg bg-zinc-700/50 text-zinc-400 text-xs font-medium
                     hover:bg-zinc-700 hover:text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Herunterladen
        </button>
      )}
    </div>
  );
}
