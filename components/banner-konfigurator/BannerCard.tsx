'use client';

import React, { memo, useCallback } from 'react';
import { getResolvedConfig, type BannerConfig } from '@/store/useBannerConfigStore';
import { getPatternComponent } from './patterns';
import { getScale, type BannerFormat } from '@/lib/banner/formats';

interface BannerCardProps {
  banner: BannerFormat;
  config: BannerConfig;
  maxCardWidth: number;
  maxCardHeight: number;
  onExport?: (banner: BannerFormat) => void;
}

const BannerCard = memo(function BannerCard({
  banner,
  config,
  maxCardWidth,
  maxCardHeight,
  onExport,
}: BannerCardProps) {
  const scale = getScale(banner.width, banner.height, maxCardWidth, maxCardHeight);
  const displayW = banner.width * scale;
  const displayH = banner.height * scale;
  const resolved = getResolvedConfig(config);
  const PatternComponent = getPatternComponent(config.activePattern);

  const handleExport = useCallback(() => {
    onExport?.(banner);
  }, [onExport, banner]);

  if (!PatternComponent) return null;

  return (
    <div className="flex flex-col gap-2 group">
      {/* Info bar */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-10 h-6 rounded bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
          {banner.id}
        </span>
        <span className="text-sm font-medium">{banner.name}</span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {banner.width}&times;{banner.height}
        </span>
        {banner.badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
            {banner.badge}
          </span>
        )}
      </div>

      {/* Scaled banner preview with hover actions */}
      <div className="relative">
        <div
          className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900"
          style={{ width: displayW, height: displayH }}
        >
          <div
            style={{
              width: banner.width,
              height: banner.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <PatternComponent
              width={banner.width}
              height={banner.height}
              config={resolved}
            />
          </div>
        </div>

        {/* Hover actions overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Export button */}
          <button
            onClick={handleExport}
            className="p-1.5 rounded-md bg-black/70 text-white hover:bg-black/90 transition-colors"
            title="Exportieren"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default BannerCard;
