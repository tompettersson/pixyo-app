'use client';

import { useState, useCallback, useRef } from 'react';
import type { DesignSnapshot, FormatTarget, RenderResult } from '@/lib/formatizer/types';
import { ASPECT_RATIOS } from '@/types/layers';
import { reduceAllTargets } from '@/lib/formatizer/contentReducer';
import { renderAllFormats } from '@/lib/formatizer/offscreenRenderer';

export type FormatizerPhase = 'idle' | 'rendering' | 'done';

/**
 * Build format targets from ASPECT_RATIOS.
 * Always generates all 4 social formats.
 */
function buildTargets(): FormatTarget[] {
  return Object.values(ASPECT_RATIOS).map((ar) => ({
    ratioId: ar.id,
    width: ar.width,
    height: ar.height,
    label: ar.label,
    contentLevel: 'FULL' as const,
  }));
}

export function useFormatizer() {
  const [phase, setPhase] = useState<FormatizerPhase>('idle');
  const [results, setResults] = useState<RenderResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [totalFormats, setTotalFormats] = useState(0);
  const thumbnailUrlsRef = useRef<string[]>([]);

  /**
   * Start batch rendering all formats.
   */
  const startBatchRender = useCallback(async (snapshot: DesignSnapshot) => {
    setPhase('rendering');
    setProgress(0);

    // Build format targets
    const targets = buildTargets();
    setTotalFormats(targets.length);

    // Initialize results as pending
    const initialResults: RenderResult[] = targets.map((t) => ({
      ratioId: t.ratioId,
      label: t.label,
      width: t.width,
      height: t.height,
      contentLevel: 'FULL',
      blob: null,
      thumbnailUrl: null,
      status: 'pending' as const,
      warnings: [],
    }));
    setResults(initialResults);

    // Run content reduction
    const warningsMap = reduceAllTargets(targets, snapshot);

    // Update results with content levels and warnings
    setResults((prev) =>
      prev.map((r) => {
        const target = targets.find((t) => t.ratioId === r.ratioId);
        return {
          ...r,
          contentLevel: target?.contentLevel ?? r.contentLevel,
          warnings: warningsMap.get(r.ratioId) ?? [],
        };
      }),
    );

    // Render sequentially with progress
    const rendered = await renderAllFormats(targets, snapshot, (index, result) => {
      setProgress(index + 1);
      setResults((prev) =>
        prev.map((r) =>
          r.ratioId === result.ratioId
            ? { ...r, ...result }
            : r,
        ),
      );

      // Track thumbnail URLs for cleanup
      if (result.thumbnailUrl) {
        thumbnailUrlsRef.current.push(result.thumbnailUrl);
      }
    });

    // Final update
    setResults(rendered.map((r) => ({
      ...r,
      warnings: [...(warningsMap.get(r.ratioId) ?? []), ...r.warnings],
    })));
    setPhase('done');
  }, []);

  /**
   * Download all rendered formats as a ZIP file.
   */
  const downloadZip = useCallback(async (designName: string) => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const doneResults = results.filter((r) => r.status === 'done' && r.blob);
    if (doneResults.length === 0) return;

    for (const result of doneResults) {
      const safeName = designName.replace(/[^a-zA-Z0-9-_äöüÄÖÜß ]/g, '').trim() || 'design';
      const filename = `${safeName}-${result.ratioId.replace(':', 'x')}-${result.width}x${result.height}.jpg`;
      zip.file(filename, result.blob!);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    const safeName = designName.replace(/[^a-zA-Z0-9-_äöüÄÖÜß ]/g, '').trim() || 'design';
    link.download = `${safeName}-alle-formate.zip`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [results]);

  /**
   * Download a single format.
   */
  const downloadSingle = useCallback((ratioId: string) => {
    const result = results.find((r) => r.ratioId === ratioId);
    if (!result?.blob) return;

    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.download = `design-${ratioId.replace(':', 'x')}-${result.width}x${result.height}.jpg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [results]);

  /**
   * Reset state and revoke all object URLs.
   */
  const reset = useCallback(() => {
    // Revoke all thumbnail URLs
    for (const url of thumbnailUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    thumbnailUrlsRef.current = [];

    setPhase('idle');
    setResults([]);
    setProgress(0);
    setTotalFormats(0);
  }, []);

  return {
    phase,
    results,
    progress,
    totalFormats,
    startBatchRender,
    downloadZip,
    downloadSingle,
    reset,
  };
}
