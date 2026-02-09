'use client';

import React from 'react';
import BannerDesign from '@/components/showcase/BannerDesign';
import BannerConfigPanel from '@/components/showcase/BannerConfigPanel';
import { useBannerConfigStore } from '@/store/useBannerConfigStore';
import type { BannerConfig } from '@/store/useBannerConfigStore';

// ─── Banner definitions ─────────────────────────────────────────
type BannerDef = {
  id: string;
  name: string;
  width: number;
  height: number;
  pattern: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8';
  category: 'leaderboard' | 'rectangle' | 'skyscraper' | 'social';
  badge?: string;
};

const BANNERS: BannerDef[] = [
  // Leaderboard
  { id: 'B-01', name: 'Leaderboard', width: 728, height: 90, pattern: 'P1', category: 'leaderboard', badge: 'GDN Top 5' },
  { id: 'B-02', name: 'Large Leaderboard', width: 970, height: 90, pattern: 'P8', category: 'leaderboard' },
  { id: 'B-03', name: 'Full Banner', width: 468, height: 60, pattern: 'P5', category: 'leaderboard', badge: 'Legacy' },
  { id: 'B-04', name: 'Mobile Leaderboard', width: 320, height: 50, pattern: 'P5', category: 'leaderboard', badge: 'Mobile' },
  { id: 'B-05', name: 'Large Mobile Banner', width: 320, height: 100, pattern: 'P6', category: 'leaderboard', badge: 'Mobile' },
  // Rectangle
  { id: 'B-06', name: 'Medium Rectangle', width: 300, height: 250, pattern: 'P2', category: 'rectangle', badge: '#1 Beliebtestes' },
  { id: 'B-07', name: 'Large Rectangle', width: 336, height: 280, pattern: 'P4', category: 'rectangle' },
  { id: 'B-08', name: 'Square', width: 250, height: 250, pattern: 'P2', category: 'rectangle' },
  { id: 'B-09', name: 'Small Square', width: 200, height: 200, pattern: 'P3', category: 'rectangle' },
  // Skyscraper
  { id: 'B-10', name: 'Wide Skyscraper', width: 160, height: 600, pattern: 'P1', category: 'skyscraper', badge: 'GDN Top 5' },
  { id: 'B-11', name: 'Skyscraper', width: 120, height: 600, pattern: 'P5', category: 'skyscraper' },
  { id: 'B-12', name: 'Half-Page', width: 300, height: 600, pattern: 'P4', category: 'skyscraper', badge: 'Premium' },
  // Social
  { id: 'B-13', name: 'Instagram Post', width: 1080, height: 1080, pattern: 'P2', category: 'social', badge: '1:1' },
  { id: 'B-14', name: 'Instagram Feed', width: 1080, height: 1350, pattern: 'P7', category: 'social', badge: '4:5' },
  { id: 'B-15', name: 'Story / Reels', width: 1080, height: 1920, pattern: 'P6', category: 'social', badge: '9:16' },
  { id: 'B-16', name: 'YouTube / LinkedIn', width: 1920, height: 1080, pattern: 'P8', category: 'social', badge: '16:9' },
];

// ─── Category metadata ──────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'leaderboard' as const,
    title: 'Leaderboard',
    subtitle: 'Horizontale Banner — Website-Header, Top-of-Page',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="8" width="20" height="8" rx="1" />
      </svg>
    ),
  },
  {
    key: 'rectangle' as const,
    title: 'Rectangle',
    subtitle: 'Inline / Sidebar — Vielseitigste Formate',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="3" width="16" height="18" rx="1" />
      </svg>
    ),
  },
  {
    key: 'skyscraper' as const,
    title: 'Skyscraper',
    subtitle: 'Vertikale Banner — Sidebar-Werbung',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="7" y="2" width="10" height="20" rx="1" />
      </svg>
    ),
  },
  {
    key: 'social' as const,
    title: 'Social Media',
    subtitle: 'Instagram, YouTube, LinkedIn — Alle gängigen Formate',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
];

// ─── Pattern label map ──────────────────────────────────────────
const PATTERN_LABELS: Record<string, string> = {
  P1: 'Split Layout',
  P2: 'Diagonale',
  P3: 'Cutout',
  P4: 'Bottom Fade',
  P5: 'Minimal Gradient',
  P6: 'Darkened',
  P7: 'Wave',
  P8: 'Side Panel',
};

// ─── Scaling helper ─────────────────────────────────────────────
function getScale(width: number, height: number, maxCardWidth: number, maxCardHeight: number) {
  const scaleW = Math.min(maxCardWidth / width, 1);
  const scaleH = Math.min(maxCardHeight / height, 1);
  return Math.min(scaleW, scaleH);
}

// ═════════════════════════════════════════════════════════════════
// Page Component
// ═════════════════════════════════════════════════════════════════
export default function BannerFormatsKonfigurator() {
  const store = useBannerConfigStore();
  const MAX_CARD_WIDTH = 420;
  const MAX_CARD_HEIGHT = 500;

  // Build config from store
  const config: BannerConfig = {
    activePattern: 'P1',
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

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Sticky Header ────────────────────────────────── */}
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Banner-Konfigurator</h1>
              <p className="text-xs text-zinc-500">16 Formate &middot; 8 Design-Patterns &middot; Live-Vorschau</p>
            </div>
          </div>
          <a
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Dashboard
          </a>
        </div>
      </header>

      {/* ── Main: Panel + Banners ────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Config Panel (sticky via flex) */}
        <BannerConfigPanel />

        {/* Right: Scrollable Banner Preview */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {CATEGORIES.map((cat) => {
              const banners = BANNERS.filter((b) => b.category === cat.key);
              return (
                <section key={cat.key}>
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-zinc-400">{cat.icon}</span>
                    <div>
                      <h2 className="text-base font-semibold">{cat.title}</h2>
                      <p className="text-xs text-zinc-500">{cat.subtitle}</p>
                    </div>
                  </div>

                  {/* Banner cards */}
                  <div className="flex flex-wrap gap-6">
                    {banners.map((banner) => {
                      const scale = getScale(banner.width, banner.height, MAX_CARD_WIDTH, MAX_CARD_HEIGHT);
                      const displayW = banner.width * scale;
                      const displayH = banner.height * scale;

                      return (
                        <div key={banner.id} className="flex flex-col gap-2">
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

                          {/* Scaled banner preview */}
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
                              <BannerDesign
                                pattern={banner.pattern}
                                width={banner.width}
                                height={banner.height}
                                config={config}
                              />
                            </div>
                          </div>

                          {/* Pattern label */}
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {banner.pattern}: {PATTERN_LABELS[banner.pattern]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* ── Footer ──────────────────────────────────── */}
            <footer className="border-t border-zinc-800 pt-6 pb-4">
              <div className="flex flex-wrap gap-6 text-xs text-zinc-500">
                <span>{BANNERS.length} Formate</span>
                <span>8 Design-Patterns</span>
                <span>4 Kategorien</span>
                <span className="text-zinc-600">Live-Konfigurator</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
