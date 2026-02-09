'use client';

import React from 'react';
import { useBannerConfigStore, BG_IMAGE_OPTIONS, type BannerConfig } from '@/store/useBannerConfigStore';
import { AVAILABLE_FONTS } from '@/lib/stylePresets';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
import PatternSelector from './PatternSelector';
import ProfileSwitcher from './ProfileSwitcher';
import CollapsibleSection from './CollapsibleSection';
import type { PatternId } from '@/lib/banner/formats';

// ─── Section wrapper (non-collapsible) ─────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────────
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-violet-500' : 'bg-zinc-700'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{label}</span>
    </label>
  );
}

export default function BannerConfigPanel() {
  const store = useBannerConfigStore();
  const update = store.updateConfig;

  // Build config snapshot for pattern selector
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

  return (
    <div className="w-full">
      <div className="p-4 space-y-5">
        {/* ═══ 1. Pattern Selector (always visible, top) ═══ */}
        <PatternSelector
          activePattern={store.activePattern}
          config={config}
          onSelect={(id: PatternId) => update({ activePattern: id })}
        />

        <div className="border-t border-zinc-800" />

        {/* ═══ 2. Brand & Content (always visible) ═══ */}
        <Section title="Brand & Content">
          <ProfileSwitcher />

          {store.logoUrl && (
            <div className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg">
              <img
                src={store.logoUrl}
                alt="Logo"
                className="w-8 h-8 object-contain rounded"
                crossOrigin="anonymous"
              />
              <span className="text-xs text-zinc-400">Profil-Logo</span>
            </div>
          )}

          <Input
            label="Headline"
            value={store.headline}
            onChange={(e) => update({ headline: e.target.value })}
            placeholder="Smarter arbeiten."
          />
          <Input
            label="Subline"
            value={store.subline}
            onChange={(e) => update({ subline: e.target.value })}
            placeholder="KI-Tools für dein Team"
          />
          <Input
            label="CTA-Text"
            value={store.ctaText}
            onChange={(e) => update({ ctaText: e.target.value })}
            placeholder="Jetzt starten"
          />
        </Section>

        <div className="border-t border-zinc-800" />

        {/* ═══ 3. Colors (collapsible, default open) ═══ */}
        <CollapsibleSection title="Farben" defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Primär (from)"
              value={store.colorFrom}
              onChange={(e) => update({ colorFrom: e.target.value })}
            />
            <ColorPicker
              label="Sekundär (to)"
              value={store.colorTo}
              onChange={(e) => update({ colorTo: e.target.value })}
            />
          </div>
          <ColorPicker
            label="Akzent (CTA)"
            value={store.accentColor}
            onChange={(e) => update({ accentColor: e.target.value })}
          />
          <Select
            label="Textfarbe"
            value={store.textColor}
            onChange={(e) => update({ textColor: e.target.value as 'white' | 'dark' | 'auto' })}
            options={[
              { value: 'white', label: 'Weiß' },
              { value: 'dark', label: 'Dunkel' },
              { value: 'auto', label: 'Auto (Kontrast)' },
            ]}
          />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ 4. Typography (collapsible, default closed) ═══ */}
        <CollapsibleSection title="Typografie">
          <Select
            label="Headline-Font"
            value={store.headlineFont}
            onChange={(e) => update({ headlineFont: e.target.value })}
            options={AVAILABLE_FONTS.map((f) => ({
              value: f.value,
              label: `${f.label} (${f.category})`,
            }))}
          />
          <Select
            label="Headline-Gewicht"
            value={store.headlineWeight}
            onChange={(e) => update({ headlineWeight: e.target.value })}
            options={[
              { value: '400', label: 'Regular' },
              { value: '500', label: 'Medium' },
              { value: '600', label: 'Semibold' },
              { value: '700', label: 'Bold' },
            ]}
          />
          <Toggle
            label="Headline UPPERCASE"
            checked={store.headlineUppercase}
            onChange={(v) => update({ headlineUppercase: v })}
          />
          <Select
            label="CTA-Stil"
            value={store.ctaStyle}
            onChange={(e) => update({ ctaStyle: e.target.value as 'pill' | 'rounded' | 'square' })}
            options={[
              { value: 'pill', label: 'Pill (rounded-full)' },
              { value: 'rounded', label: 'Rounded (rounded-lg)' },
              { value: 'square', label: 'Eckig (rounded-none)' },
            ]}
          />
          <Toggle
            label="CTA UPPERCASE"
            checked={store.ctaUppercase}
            onChange={(v) => update({ ctaUppercase: v })}
          />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ 5. Design Parameters (collapsible, default closed) ═══ */}
        <CollapsibleSection title="Design-Parameter">
          <Slider
            label="Gradient-Winkel"
            min={90}
            max={180}
            step={5}
            value={store.gradientAngle}
            onChange={(e) => update({ gradientAngle: Number(e.target.value) })}
            valueFormatter={(v) => `${v}°`}
          />
          <Slider
            label="Overlay-Stärke"
            min={0.2}
            max={0.8}
            step={0.05}
            value={store.overlayStrength}
            onChange={(e) => update({ overlayStrength: Number(e.target.value) })}
            valueFormatter={(v) => `${Math.round(v * 100)}%`}
          />
          <Toggle
            label="Deko-Elemente"
            checked={store.showDecoElements}
            onChange={(v) => update({ showDecoElements: v })}
          />
          <Slider
            label="Split-Verhältnis"
            min={0.3}
            max={0.6}
            step={0.05}
            value={store.splitRatio}
            onChange={(e) => update({ splitRatio: Number(e.target.value) })}
            valueFormatter={(v) => `${Math.round(v * 100)}%`}
          />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ 6. Background (collapsible, default closed) ═══ */}
        <CollapsibleSection title="Hintergrund">
          <div className="grid grid-cols-3 gap-2">
            {BG_IMAGE_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => update({ bgImageUrl: opt.url })}
                className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
                  store.bgImageUrl === opt.url
                    ? 'border-violet-500 ring-1 ring-violet-500/50'
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <img
                  src={opt.thumb}
                  alt={opt.label}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-zinc-300 py-0.5">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <Input
            label="Eigene Bild-URL"
            value={store.bgImageUrl}
            onChange={(e) => update({ bgImageUrl: e.target.value })}
            placeholder="https://..."
            className="text-xs"
          />
        </CollapsibleSection>
      </div>
    </div>
  );
}
