'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';

/**
 * P2: Diagonal Split
 * Image background with a diagonal clip-path gradient overlay.
 * clip-path adapts dynamically to aspect ratio.
 */
export default function PatternDiagonal({ width, height, config, tokens }: PatternProps) {
  const { flags, spacing, fontSize, colors } = tokens;
  const ratio = width / height;

  // Dynamic clip-path based on aspect ratio
  let leftEdge: number;
  let rightEdge: number;

  if (flags.isHorizontal) {
    leftEdge = Math.min(45, 30 + ratio * 5);
    rightEdge = Math.min(70, leftEdge + 20);
  } else if (flags.isVertical) {
    leftEdge = 15;
    rightEdge = 65;
  } else {
    leftEdge = 35;
    rightEdge = 55;
  }

  const clipPath = `polygon(${leftEdge}% 0, 100% 0, 100% 100%, ${rightEdge}% 100%)`;

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
      {/* Diagonal gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
          clipPath,
        }}
      />
      {/* Content (positioned on the gradient side) */}
      <div
        className={`absolute inset-0 flex flex-col justify-center ${
          flags.isVertical ? 'items-center text-center' : 'items-end text-right'
        }`}
        style={{
          padding: spacing.padding,
          gap: spacing.gap,
          ...(!flags.isVertical ? { paddingRight: '10%', paddingLeft: '4%' } : {}),
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
