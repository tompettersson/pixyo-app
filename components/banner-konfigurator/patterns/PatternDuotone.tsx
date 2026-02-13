'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';

/**
 * P7: Duotone
 * Photo colorized with brand colors via mix-blend-mode.
 * Creates a striking duotone effect using colorFrom and colorTo.
 * Text color from tokens (not hardcoded white).
 */
export default function PatternDuotone({ width, height, config, tokens }: PatternProps) {
  const { flags, spacing, fontSize, colors } = tokens;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Duotone effect: base gradient + grayscale image + luminosity blend */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
        }}
      />
      {/* Image with luminosity blend to create duotone */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'luminosity',
          opacity: 0.6,
        }}
      />
      {/* Gradient scrim for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to ${
            flags.isVertical ? 'bottom' : 'right'
          }, rgba(0,0,0,0.1) 0%, rgba(0,0,0,${config.overlayStrength * 0.5}) 100%)`,
        }}
      />
      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col ${
          flags.isVertical
            ? 'justify-end items-center text-center'
            : flags.isHorizontal
              ? 'justify-center items-start'
              : 'justify-end items-start'
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
