'use client';

import React from 'react';
import BannerCard from './BannerCard';
import { BANNERS, CATEGORIES, type BannerFormat } from '@/lib/banner/formats';
import type { BannerConfig } from '@/store/useBannerConfigStore';

interface BannerGridProps {
  config: BannerConfig;
  onExportSingle?: (banner: BannerFormat) => void;
}

const MAX_CARD_WIDTH = 420;
const MAX_CARD_HEIGHT = 500;

// Category icon SVGs
function CategoryIcon({ path }: { path: string }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={path} />
    </svg>
  );
}

export default function BannerGrid({ config, onExportSingle }: BannerGridProps) {
  return (
    <div className="p-6 space-y-8">
      {CATEGORIES.map((cat) => {
        const banners = BANNERS.filter((b) => b.category === cat.key);
        return (
          <section key={cat.key}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-zinc-400">
                <CategoryIcon path={cat.icon} />
              </span>
              <div>
                <h2 className="text-base font-semibold">{cat.title}</h2>
                <p className="text-xs text-zinc-500">{cat.subtitle}</p>
              </div>
            </div>

            {/* Banner cards */}
            <div className="flex flex-wrap gap-6">
              {banners.map((banner) => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  config={config}
                  maxCardWidth={MAX_CARD_WIDTH}
                  maxCardHeight={MAX_CARD_HEIGHT}
                  onExport={onExportSingle}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Footer */}
      <footer className="border-t border-zinc-800 pt-6 pb-4">
        <div className="flex flex-wrap gap-6 text-xs text-zinc-500">
          <span>{BANNERS.length} Formate</span>
          <span>7 Design-Patterns</span>
          <span>4 Kategorien</span>
          <span className="text-zinc-600">Live-Konfigurator</span>
        </div>
      </footer>
    </div>
  );
}
