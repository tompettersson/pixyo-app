'use client';

import React, { useCallback } from 'react';
import BannerConfigPanel from '@/components/banner-konfigurator/BannerConfigPanel';
import BannerGrid from '@/components/banner-konfigurator/BannerGrid';
import ExportActions from '@/components/banner-konfigurator/ExportActions';
import { useBannerConfigStore, getResolvedConfig, type BannerConfig } from '@/store/useBannerConfigStore';
import { getPatternComponent } from '@/components/banner-konfigurator/patterns';
import { downloadBlob } from '@/lib/banner/exportEngine';
import { createRoot } from 'react-dom/client';
import type { BannerFormat } from '@/lib/banner/formats';
import { computeBannerTokens } from '@/lib/banner/tokenBridge';

export default function BannerKonfigurator() {
  const store = useBannerConfigStore();

  // Build config snapshot from store
  const config: BannerConfig = {
    activePattern: store.activePattern,
    colorFrom: store.colorFrom,
    colorTo: store.colorTo,
    accentColor: store.accentColor,
    textColor: store.textColor,
    headlineFont: store.headlineFont,
    headlineWeight: store.headlineWeight,
    headlineUppercase: store.headlineUppercase,
    ctaStyle: store.ctaStyle,
    ctaUppercase: store.ctaUppercase,
    headline: store.headline,
    subline: store.subline,
    ctaText: store.ctaText,
    logoUrl: store.logoUrl,
    gradientAngle: store.gradientAngle,
    overlayStrength: store.overlayStrength,
    showDecoElements: store.showDecoElements,
    splitRatio: store.splitRatio,
    bgImageUrl: store.bgImageUrl,
  };

  // Single banner export handler
  const handleExportSingle = useCallback(
    async (banner: BannerFormat) => {
      const PatternComponent = getPatternComponent(config.activePattern);
      if (!PatternComponent) return;
      const resolved = getResolvedConfig(config);
      const designTokens = useBannerConfigStore.getState().designTokens;
      const tokens = computeBannerTokens(banner.width, banner.height, config, designTokens);

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = `${banner.width}px`;
      tempDiv.style.height = `${banner.height}px`;
      tempDiv.style.overflow = 'hidden';
      document.body.appendChild(tempDiv);

      const root = createRoot(tempDiv);
      root.render(
        <PatternComponent width={banner.width} height={banner.height} config={resolved} tokens={tokens} />
      );

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

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
        });

        if (blob) {
          const filename = `${banner.id}_${banner.name.replace(/\s+/g, '-').toLowerCase()}_${banner.width}x${banner.height}.jpg`;
          downloadBlob(blob, filename);
        }
      } finally {
        root.unmount();
        document.body.removeChild(tempDiv);
      }
    },
    [config]
  );

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Sticky Header ────────────────────────────────── */}
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-7" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Banner-Konfigurator</h1>
              <p className="text-xs text-zinc-500">16 Formate &middot; 7 Design-Patterns &middot; Live-Vorschau</p>
            </div>
          </div>
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
      </header>

      {/* ── Main: Panel + Banners ────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Config Panel + Export */}
        <div className="w-[340px] shrink-0 flex flex-col bg-zinc-900/80 backdrop-blur-sm border-r border-zinc-800">
          <div className="flex-1 overflow-y-auto">
            <BannerConfigPanel />
          </div>
          {/* Export always visible at bottom */}
          <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/90 p-4">
            <ExportActions config={config} />
          </div>
        </div>

        {/* Right: Scrollable Banner Grid */}
        <main className="flex-1 overflow-y-auto">
          <BannerGrid config={config} onExportSingle={handleExportSingle} />
        </main>
      </div>
    </div>
  );
}
