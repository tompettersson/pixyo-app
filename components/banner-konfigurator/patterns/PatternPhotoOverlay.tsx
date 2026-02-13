'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';
import { hexToRgba } from '@/lib/banner/colorUtils';

/**
 * P6: Photo Overlay
 * Full image with colored tint overlay + dark overlay.
 * overlayStrength controls the darkness. Brand colors tint the image.
 * Text color from tokens (not hardcoded white).
 */
export default function PatternPhotoOverlay({ width, height, config, tokens }: PatternProps) {
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
      {/* Colored tint overlay using brand colors */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${hexToRgba(config.colorFrom, 0.73)}, ${hexToRgba(config.colorTo, 0.6)})`,
          mixBlendMode: 'multiply',
        }}
      />
      {/* Dark overlay controlled by overlayStrength */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${config.overlayStrength})` }}
      />
      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col ${
          flags.isVertical
            ? 'justify-center items-center text-center'
            : 'justify-center items-start'
        }`}
        style={{
          padding: spacing.padding,
          gap: spacing.gap,
        }}
      >
        {!flags.hideLogo && (
          <Logo url={config.logoUrl} size={fontSize.logo} />
        )}
        <p style={{ ...headlineStyle(tokens), textShadow: tokens.shadows.textShadow }}>
          {config.headline}
        </p>
        {!flags.hideSubline && (
          <p style={{ ...sublineStyle(tokens), textShadow: tokens.shadows.textShadow }}>
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
