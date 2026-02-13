'use client';

import React, { useState, useCallback, useRef } from 'react';
import { BANNERS, type BannerFormat } from '@/lib/banner/formats';
import { getResolvedConfig, useBannerConfigStore, type BannerConfig } from '@/store/useBannerConfigStore';
import { getPatternComponent } from './patterns';
import { exportAllBannersAsZip, downloadBlob } from '@/lib/banner/exportEngine';
import { createRoot } from 'react-dom/client';
import { computeBannerTokens } from '@/lib/banner/tokenBridge';

interface ExportActionsProps {
  config: BannerConfig;
}

export default function ExportActions({ config }: ExportActionsProps) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderBannerToBlob = useCallback(
    async (banner: BannerFormat): Promise<Blob | null> => {
      const PatternComponent = getPatternComponent(config.activePattern);
      if (!PatternComponent) return null;
      const resolved = getResolvedConfig(config);
      const designTokens = useBannerConfigStore.getState().designTokens;
      const tokens = computeBannerTokens(banner.width, banner.height, config, designTokens);

      // Create a temporary hidden container at full size
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = `${banner.width}px`;
      tempDiv.style.height = `${banner.height}px`;
      tempDiv.style.overflow = 'hidden';
      document.body.appendChild(tempDiv);

      // Render the pattern into it
      const root = createRoot(tempDiv);
      root.render(
        <PatternComponent width={banner.width} height={banner.height} config={resolved} tokens={tokens} />
      );

      // Wait for render + images to load
      await new Promise((r) => setTimeout(r, 500));

      try {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          width: banner.width,
          height: banner.height,
        });

        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.92
          );
        });
      } finally {
        root.unmount();
        document.body.removeChild(tempDiv);
      }
    },
    [config]
  );

  const handleExportAll = useCallback(async () => {
    setExporting(true);
    setProgress(0);
    try {
      await exportAllBannersAsZip(renderBannerToBlob, BANNERS, setProgress);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  }, [renderBannerToBlob]);

  const handleExportSingle = useCallback(
    async (banner: BannerFormat) => {
      const blob = await renderBannerToBlob(banner);
      if (blob) {
        const filename = `${banner.id}_${banner.name.replace(/\s+/g, '-').toLowerCase()}_${banner.width}x${banner.height}.jpg`;
        downloadBlob(blob, filename);
      }
    },
    [renderBannerToBlob]
  );

  return (
    <div className="space-y-3" ref={containerRef}>
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Export</h3>

      {/* Export all button */}
      <button
        onClick={handleExportAll}
        disabled={exporting}
        className="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all
          bg-violet-600 hover:bg-violet-500 text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
      >
        {exporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Exportiere... {Math.round(progress * 100)}%</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Alle exportieren (ZIP)</span>
          </>
        )}
      </button>

      {/* Progress bar */}
      {exporting && (
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <p className="text-[10px] text-zinc-600">
        {BANNERS.length} Formate &middot; JPEG @2x &middot; {exporting ? 'Bitte warten...' : 'Klick pro Banner zum Einzelexport'}
      </p>
    </div>
  );
}

// Re-export the single export handler for use by BannerCard
export { type BannerFormat };
