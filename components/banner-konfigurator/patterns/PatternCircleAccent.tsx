'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';

/**
 * P3: Circle Accent
 * Gradient background with decorative circles in brand colors.
 * No image required — pure brand-forward design.
 */
export default function PatternCircleAccent({ width, height, config, tokens }: PatternProps) {
  const { flags, spacing, fontSize, colors } = tokens;
  const baseSize = Math.min(width, height);

  return (
    <div
      className="relative w-full h-full overflow-hidden flex"
      style={{
        background: `linear-gradient(${config.gradientAngle + 10}deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
      }}
    >
      {/* Decorative circles */}
      {config.showDecoElements && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: baseSize * 0.6,
              height: baseSize * 0.6,
              background: colors.text,
              opacity: 0.08,
              top: '-10%',
              right: '-5%',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: baseSize * 0.35,
              height: baseSize * 0.35,
              background: colors.text,
              opacity: 0.06,
              bottom: '-5%',
              left: '10%',
            }}
          />
          {!flags.isSmall && (
            <div
              className="absolute rounded-full"
              style={{
                width: baseSize * 0.2,
                height: baseSize * 0.2,
                background: colors.accent,
                opacity: 0.12,
                top: '30%',
                right: '25%',
              }}
            />
          )}
        </>
      )}

      {/* Content */}
      <div
        className={`relative z-10 flex ${
          flags.isHorizontal
            ? 'flex-row items-center'
            : 'flex-col justify-center items-start'
        }`}
        style={{
          flex: 1,
          padding: spacing.padding,
          gap: spacing.gap,
        }}
      >
        {!flags.hideLogo && (
          <Logo url={config.logoUrl} size={fontSize.logo} />
        )}
        <div className={flags.isHorizontal ? 'text-left flex-1' : ''}>
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
