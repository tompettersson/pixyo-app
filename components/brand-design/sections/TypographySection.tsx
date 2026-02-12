'use client';

import React, { useCallback, useEffect } from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { GOOGLE_FONT_OPTIONS, loadGoogleFont } from '@/lib/brand-design/font-loader';
import { recalculateTypeScale } from '@/lib/brand-design/defaults';

export default function TypographySection() {
  const { tokens, updateTokens } = useBrandDesignStore();
  const { typography } = tokens;

  // Load current fonts on mount and when they change
  useEffect(() => {
    loadGoogleFont(typography.fonts.heading.family);
    loadGoogleFont(typography.fonts.body.family);
    if (typography.fonts.mono) {
      loadGoogleFont(typography.fonts.mono.family);
    }
  }, [typography.fonts]);

  const fontOptions = GOOGLE_FONT_OPTIONS.map((f) => ({
    value: f.value,
    label: `${f.label} (${f.category})`,
  }));

  const handleFontChange = useCallback(
    (role: 'heading' | 'body', family: string) => {
      const font = GOOGLE_FONT_OPTIONS.find((f) => f.value === family);
      loadGoogleFont(family);
      updateTokens({
        typography: {
          fonts: {
            [role]: {
              family,
              fallback: font?.category === 'serif' ? 'serif' : font?.category === 'monospace' ? 'monospace' : 'sans-serif',
            },
          },
        },
      } as never);
    },
    [updateTokens]
  );

  const handleScaleChange = useCallback(
    (field: 'base' | 'ratio', value: number) => {
      const base = field === 'base' ? value : typography.scale.base;
      const ratio = field === 'ratio' ? value : typography.scale.ratio;
      const newScale = recalculateTypeScale(base, ratio);
      updateTokens({
        typography: {
          scale: {
            [field]: value,
            ...newScale,
          },
        },
      } as never);
    },
    [updateTokens, typography.scale.base, typography.scale.ratio]
  );

  return (
    <div className="space-y-4">
      {/* Font families */}
      <div>
        <Select
          label="Heading-Font"
          value={typography.fonts.heading.family}
          onChange={(e) => handleFontChange('heading', e.target.value)}
          options={fontOptions}
        />
        <p
          className="mt-1.5 text-lg text-zinc-300 truncate"
          style={{ fontFamily: `'${typography.fonts.heading.family}', sans-serif`, fontWeight: typography.fontWeights.bold }}
        >
          Die Zukunft beginnt hier
        </p>
      </div>
      <div>
        <Select
          label="Body-Font"
          value={typography.fonts.body.family}
          onChange={(e) => handleFontChange('body', e.target.value)}
          options={fontOptions}
        />
        <p
          className="mt-1.5 text-sm text-zinc-400 truncate"
          style={{ fontFamily: `'${typography.fonts.body.family}', sans-serif` }}
        >
          Dies ist ein Beispiel für den Fließtext.
        </p>
      </div>

      {/* Type Scale */}
      <Slider
        label="Basis-Schriftgröße"
        min={12}
        max={20}
        step={1}
        value={typography.scale.base}
        onChange={(e) => handleScaleChange('base', Number(e.target.value))}
        valueFormatter={(v) => `${v}px`}
      />
      <Slider
        label="Scale-Ratio"
        min={1.1}
        max={1.5}
        step={0.05}
        value={typography.scale.ratio}
        onChange={(e) => handleScaleChange('ratio', Number(e.target.value))}
        valueFormatter={(v) => v.toFixed(2)}
      />

      {/* Font Weights */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Gewichte</span>
        <div className="grid grid-cols-2 gap-2">
          {(['normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
            <div key={weight} className="flex items-center justify-between bg-zinc-800/50 px-2 py-1.5 rounded">
              <span className="text-xs text-zinc-400 capitalize">{weight}</span>
              <select
                value={typography.fontWeights[weight]}
                onChange={(e) =>
                  updateTokens({
                    typography: {
                      fontWeights: { [weight]: Number(e.target.value) },
                    },
                  } as never)
                }
                className="bg-transparent text-xs text-zinc-200 text-right cursor-pointer focus:outline-none"
              >
                {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Heading uppercase */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <div
          className={`relative w-9 h-5 rounded-full transition-colors ${
            typography.headingUppercase ? 'bg-violet-500' : 'bg-zinc-700'
          }`}
          onClick={() => updateTokens({ typography: { headingUppercase: !typography.headingUppercase } })}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              typography.headingUppercase ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
        <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
          Heading UPPERCASE
        </span>
      </label>
    </div>
  );
}
