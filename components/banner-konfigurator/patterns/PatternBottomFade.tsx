'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';
import { hexToRgba } from '@/lib/banner/colorUtils';

/**
 * P4: Bottom Gradient Fade
 * Full image background with gradient fade from bottom.
 * Universal pattern that works across all aspect ratios.
 */
export default function PatternBottomFade({ width, height, config, tokens }: PatternProps) {
  const { flags, spacing, fontSize, colors } = tokens;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Gradient fade from bottom — 3-stop for smooth transition */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 20%, ${hexToRgba(config.colorFrom, 0.3)} 55%, ${hexToRgba(config.colorTo, 0.9)} 100%)`,
        }}
      />
      {/* Content at bottom */}
      <div
        className="absolute inset-0 flex flex-col justify-end"
        style={{
          padding: spacing.padding,
          gap: spacing.gap,
        }}
      >
        {!flags.hideLogo && (
          <Logo url={config.logoUrl} size={fontSize.logo} />
        )}
        <p style={headlineStyle(tokens)}>
          {config.headline}
        </p>
        {!flags.hideSubline && (
          <p style={sublineStyle(tokens)}>
            {config.subline}
          </p>
        )}
        <div style={{ marginTop: spacing.ctaMarginTop }}>
          <span style={ctaStyle(tokens)}>{config.ctaText}</span>
        </div>
      </div>
    </div>
  );
}
