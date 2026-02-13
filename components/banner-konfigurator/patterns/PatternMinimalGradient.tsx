'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';

/**
 * P5: Minimal Gradient (no image)
 * Clean gradient background with optional dot pattern.
 * Essential "no image" option — pure brand-forward.
 */
export default function PatternMinimalGradient({ width, height, config, tokens }: PatternProps) {
  const { flags, spacing, fontSize, colors } = tokens;

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(${config.gradientAngle}deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
      }}
    >
      {/* Subtle pattern dots */}
      {config.showDecoElements && (
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.06,
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      )}
      <div
        className={`relative z-10 flex ${
          flags.isHorizontal
            ? 'flex-row items-center'
            : 'flex-col items-center'
        } text-center`}
        style={{
          padding: spacing.padding,
          gap: spacing.gap,
        }}
      >
        {!flags.hideLogo && (
          <Logo url={config.logoUrl} size={fontSize.logo} />
        )}
        <div className={flags.isHorizontal ? 'text-left' : 'text-center'}>
          <p style={headlineStyle(tokens)}>
            {config.headline}
          </p>
          {!flags.hideSubline && (
            <p style={{ ...sublineStyle(tokens), marginTop: spacing.gap * 0.5 }}>
              {config.subline}
            </p>
          )}
        </div>
        <div style={{ marginTop: flags.isHorizontal ? 0 : spacing.ctaMarginTop }}>
          <span style={ctaStyle(tokens)}>{config.ctaText}</span>
        </div>
      </div>
    </div>
  );
}
