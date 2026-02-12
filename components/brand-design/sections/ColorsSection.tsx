'use client';

import React, { useCallback } from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { generatePalette, getContrastColor } from '@/lib/brand-design/palette-generator';

export default function ColorsSection() {
  const { tokens, updateTokens } = useBrandDesignStore();
  const { colors } = tokens;

  const updateSemanticColor = useCallback(
    (path: string, value: string) => {
      const parts = path.split('.');
      if (parts.length === 1) {
        updateTokens({ colors: { semantic: { [parts[0]]: value } } });
      } else if (parts.length === 2) {
        updateTokens({
          colors: {
            semantic: {
              [parts[0]]: { [parts[1]]: value },
            } as Record<string, unknown>,
          },
        } as never);
      }
    },
    [updateTokens]
  );

  const updatePaletteColor = useCallback(
    (name: string, value: string) => {
      updateTokens({
        colors: {
          palette: { ...colors.palette, [name]: value },
        },
      });
    },
    [updateTokens, colors.palette]
  );

  // Auto-generate palette from primary color
  const handleAutoGenerate = useCallback(() => {
    const palette = generatePalette(colors.semantic.primary);
    updateTokens({
      colors: {
        palette: {
          primary: colors.semantic.primary,
          secondary: palette.secondary,
          accent: palette.accent,
          neutral: palette.neutral,
          white: '#ffffff',
          black: '#09090b',
        },
        semantic: {
          ...colors.semantic,
          secondary: palette.secondary,
          accent: palette.accent,
          background: palette.background,
          text: palette.text,
          border: palette.border,
        },
      },
    });
  }, [colors.semantic.primary, colors.semantic, updateTokens]);

  return (
    <div className="space-y-4">
      {/* Main brand colors */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Brand-Farben</span>
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="Primär"
            value={colors.semantic.primary}
            onChange={(e) => {
              updateTokens({
                colors: {
                  semantic: { primary: e.target.value },
                  palette: { ...colors.palette, primary: e.target.value },
                },
              });
            }}
          />
          <ColorPicker
            label="Sekundär"
            value={colors.semantic.secondary}
            onChange={(e) => {
              updateTokens({
                colors: {
                  semantic: { secondary: e.target.value },
                  palette: { ...colors.palette, secondary: e.target.value },
                },
              });
            }}
          />
        </div>
        <ColorPicker
          label="Akzent"
          value={colors.semantic.accent}
          onChange={(e) => {
            updateTokens({
              colors: {
                semantic: { accent: e.target.value },
                palette: { ...colors.palette, accent: e.target.value },
              },
            });
          }}
        />
      </div>

      {/* Auto-generate */}
      <button
        onClick={handleAutoGenerate}
        className="w-full px-3 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
      >
        Palette aus Primärfarbe generieren
      </button>

      {/* Background colors */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Hintergrund</span>
        <div className="grid grid-cols-3 gap-2">
          <ColorPicker
            label="Standard"
            value={colors.semantic.background.default}
            onChange={(e) => updateSemanticColor('background.default', e.target.value)}
          />
          <ColorPicker
            label="Subtle"
            value={colors.semantic.background.subtle}
            onChange={(e) => updateSemanticColor('background.subtle', e.target.value)}
          />
          <ColorPicker
            label="Inverse"
            value={colors.semantic.background.inverse}
            onChange={(e) => updateSemanticColor('background.inverse', e.target.value)}
          />
        </div>
      </div>

      {/* Text colors */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Text</span>
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            label="Standard"
            value={colors.semantic.text.default}
            onChange={(e) => updateSemanticColor('text.default', e.target.value)}
          />
          <ColorPicker
            label="Muted"
            value={colors.semantic.text.muted}
            onChange={(e) => updateSemanticColor('text.muted', e.target.value)}
          />
          <ColorPicker
            label="Inverse"
            value={colors.semantic.text.inverse}
            onChange={(e) => updateSemanticColor('text.inverse', e.target.value)}
          />
          <ColorPicker
            label="On Primary"
            value={colors.semantic.text.onPrimary}
            onChange={(e) => updateSemanticColor('text.onPrimary', e.target.value)}
          />
        </div>
      </div>

      {/* Status colors */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Status</span>
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            label="Erfolg"
            value={colors.semantic.status.success}
            onChange={(e) => updateSemanticColor('status.success', e.target.value)}
          />
          <ColorPicker
            label="Warnung"
            value={colors.semantic.status.warning}
            onChange={(e) => updateSemanticColor('status.warning', e.target.value)}
          />
          <ColorPicker
            label="Fehler"
            value={colors.semantic.status.error}
            onChange={(e) => updateSemanticColor('status.error', e.target.value)}
          />
          <ColorPicker
            label="Info"
            value={colors.semantic.status.info}
            onChange={(e) => updateSemanticColor('status.info', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
