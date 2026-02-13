'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';

/**
 * P1: Split Layout
 * Horizontal or vertical split with image on one side, gradient content on the other.
 * Automatically adapts orientation based on aspect ratio.
 */
export default function PatternSplit({ width, height, config, tokens }: PatternProps) {
  const splitPct = `${config.splitRatio * 100}%`;
  const { flags, spacing, fontSize, colors } = tokens;

  if (flags.isVertical) {
    return (
      <div className="relative flex flex-col w-full h-full overflow-hidden">
        <div
          className="flex-1"
          style={{
            backgroundImage: `url(${config.bgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="flex flex-col justify-center items-center"
          style={{
            background: `linear-gradient(${config.gradientAngle}deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
            flex: `0 0 ${splitPct}`,
            padding: spacing.padding,
            gap: spacing.gap,
          }}
        >
          {!flags.hideLogo && (
            <Logo url={config.logoUrl} size={fontSize.logo} />
          )}
          <p style={headlineStyle(tokens)} className="text-center">
            {config.headline}
          </p>
          {!flags.hideSubline && (
            <p style={sublineStyle(tokens)} className="text-center">
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

  return (
    <div className="relative flex w-full h-full overflow-hidden">
      <div
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flex: `0 0 ${100 - config.splitRatio * 100}%`,
        }}
      />
      <div
        className="flex flex-col justify-center items-start"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
          flex: 1,
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
