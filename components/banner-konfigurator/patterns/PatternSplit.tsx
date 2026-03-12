'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';

/**
 * P1: Split Layout
 * Horizontal or vertical split with image on one side, gradient content on the other.
 * Automatically adapts orientation based on aspect ratio.
 * For small/square formats: gives more space to text, hides subline.
 */
export default function PatternSplit({ width, height, config, tokens }: PatternProps) {
  const { flags, spacing, fontSize, colors } = tokens;
  const area = width * height;
  const ratio = width / height;

  // For small formats or near-square: give text more space (60% instead of splitRatio)
  const isNarrowText = !flags.isVertical && !flags.isHorizontal && area < 120_000;
  const effectiveSplitRatio = isNarrowText ? 0.6 : config.splitRatio;
  const splitPct = `${effectiveSplitRatio * 100}%`;

  // Hide subline when text column is too narrow
  const textColumnWidth = flags.isVertical ? width : width * effectiveSplitRatio;
  const hideSubHere = flags.hideSubline || textColumnWidth < 180;

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
          className="flex flex-col justify-center items-center overflow-hidden"
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
          {!hideSubHere && (
            <p style={sublineStyle(tokens)} className="text-center">
              {config.subline}
            </p>
          )}
          <div style={{ marginTop: spacing.ctaMarginTop, maxWidth: '100%' }}>
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
          flex: `0 0 ${100 - effectiveSplitRatio * 100}%`,
        }}
      />
      <div
        className="flex flex-col justify-center items-start overflow-hidden"
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
        {!hideSubHere && (
          <p style={sublineStyle(tokens)}>
            {config.subline}
          </p>
        )}
        <div style={{ marginTop: spacing.ctaMarginTop, maxWidth: '100%' }}>
          <span style={ctaStyle(tokens)}>{config.ctaText}</span>
        </div>
      </div>
    </div>
  );
}
