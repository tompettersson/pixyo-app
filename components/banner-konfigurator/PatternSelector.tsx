'use client';

import React, { useMemo } from 'react';
import { PATTERNS } from './patterns';
import { getResolvedConfig, useBannerConfigStore, type BannerConfig } from '@/store/useBannerConfigStore';
import type { PatternId } from '@/lib/banner/formats';
import { computeBannerTokens } from '@/lib/banner/tokenBridge';

interface PatternSelectorProps {
  activePattern: PatternId;
  config: BannerConfig;
  onSelect: (id: PatternId) => void;
}

/**
 * Visual 2-column pattern selector with live thumbnails.
 * Each thumbnail renders a miniature banner at 300x250, scaled to ~140x90.
 */
export default function PatternSelector({ activePattern, config, onSelect }: PatternSelectorProps) {
  const resolved = getResolvedConfig(config);
  const designTokens = useBannerConfigStore((s) => s.designTokens);

  // Compute tokens once for the thumbnail size (300x250)
  const tokens = useMemo(
    () => computeBannerTokens(300, 250, config, designTokens),
    [config, designTokens]
  );

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        Design-Pattern
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {PATTERNS.map((pattern) => {
          const isActive = activePattern === pattern.id;
          const Component = pattern.component;

          return (
            <button
              key={pattern.id}
              onClick={() => onSelect(pattern.id)}
              className={`relative flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'ring-2 ring-violet-500 bg-violet-500/10'
                  : 'ring-1 ring-zinc-700 hover:ring-zinc-600 bg-zinc-800/50 hover:bg-zinc-800'
              }`}
            >
              {/* Miniature preview: render at 300x250, scale to ~140x84 */}
              <div
                className="w-full overflow-hidden rounded"
                style={{ aspectRatio: '300/250' }}
              >
                <div
                  style={{
                    width: 300,
                    height: 250,
                    transform: 'scale(0.467)',
                    transformOrigin: 'top left',
                  }}
                >
                  <Component
                    width={300}
                    height={250}
                    config={resolved}
                    tokens={tokens}
                  />
                </div>
              </div>
              {/* Label */}
              <span className={`text-[10px] font-medium leading-tight ${
                isActive ? 'text-violet-300' : 'text-zinc-400'
              }`}>
                {pattern.labelDe}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
