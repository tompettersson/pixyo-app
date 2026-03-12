'use client';

import React from 'react';
import { Logo, headlineStyle, sublineStyle, ctaStyle, type PatternProps } from './shared';
import { hexToRgba } from '@/lib/banner/colorUtils';

/**
 * P4: Bottom Gradient Fade
 *
 * Two layout modes based on banner proportions:
 *
 * 1) HORIZONTAL ROW (leaderboard-type, height <= 120 && ratio > 1.5):
 *    Gradient left→right, content in a single row:
 *    [Logo]  Headline  ————————  [CTA Button]
 *    Photo peeks through on the right side.
 *
 * 2) VERTICAL STACK (rectangles, skyscrapers, social):
 *    Gradient bottom→top, content stacked at bottom:
 *    Photo on top, gradient fades into brand color,
 *    Logo → Headline → Subline → CTA stacked vertically.
 */
export default function PatternBottomFade({ width, height, config, tokens }: PatternProps) {
  const { flags } = tokens;

  // Thin landscape banners get horizontal row layout
  const useRowLayout = flags.isHorizontal && height <= 120;

  if (useRowLayout) {
    return <HorizontalLayout width={width} height={height} config={config} tokens={tokens} />;
  }

  return <VerticalLayout width={width} height={height} config={config} tokens={tokens} />;
}

// ─── Horizontal Row Layout ──────────────────────────────────────
// Used for: B-01 (728×90), B-02 (970×90), B-03 (468×60),
//           B-04 (320×50), B-05 (320×100)
//
// Layout: [Logo] | Headline (single line, ellipsis) | [CTA right-aligned]
// Gradient: left (opaque brand) → right (transparent → photo visible)

function HorizontalLayout({ config, tokens }: PatternProps) {
  const { flags, spacing, fontSize } = tokens;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image */}
      {config.bgImageUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${config.bgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {/* Gradient: left opaque → right transparent (photo peeks through right) */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${hexToRgba(config.colorTo, 0.93)} 0%, ${hexToRgba(config.colorFrom, 0.82)} 30%, ${hexToRgba(config.colorFrom, 0.45)} 60%, transparent 100%)`,
        }}
      />
      {/* Content: single horizontal row, vertically centered */}
      <div
        className="absolute inset-0 flex items-center overflow-hidden"
        style={{
          padding: spacing.padding,
          gap: spacing.gap * 2,
        }}
      >
        {!flags.hideLogo && (
          <div className="flex-shrink-0">
            <Logo url={config.logoUrl} size={fontSize.logo} />
          </div>
        )}
        <p
          className="flex-1 min-w-0"
          style={{
            ...headlineStyle(tokens),
            textShadow: tokens.shadows.textShadow,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {config.headline}
        </p>
        <div className="flex-shrink-0">
          <span
            style={{
              ...ctaStyle(tokens),
              whiteSpace: 'nowrap',
            }}
          >
            {config.ctaText}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Vertical Stack Layout ──────────────────────────────────────
// Used for: Rectangles (B-06..B-09), Skyscrapers (B-10..B-12),
//           Social (B-13..B-16)
//
// Layout: Photo top portion, gradient fades to brand color,
//         content stacked at bottom: Logo → Headline → Subline → CTA
// Gradient: top (transparent) → bottom (opaque brand color)

function VerticalLayout({ width, height, config, tokens }: PatternProps) {
  const { flags, spacing, fontSize } = tokens;

  // Skyscrapers: gradient starts much earlier to create a generous branded zone
  // Standard formats: gradient starts later to show more photo
  const gradientStart = flags.isVertical ? '5%' : '25%';
  const gradientMid = flags.isVertical ? '35%' : '55%';

  // Skyscrapers need more padding to prevent content feeling cramped
  const verticalPadding = flags.isVertical
    ? Math.round(Math.max(spacing.padding * 2, height * 0.03))
    : spacing.padding;

  // Skyscrapers get more gap between elements for breathing room
  const verticalGap = flags.isVertical
    ? Math.round(spacing.gap * 1.8)
    : spacing.gap;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image */}
      {config.bgImageUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${config.bgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
      )}
      {/* Gradient: top transparent → bottom opaque */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent ${gradientStart}, ${hexToRgba(config.colorFrom, 0.4)} ${gradientMid}, ${hexToRgba(config.colorTo, 0.95)} 100%)`,
        }}
      />
      {/* Content stacked at bottom */}
      <div
        className="absolute inset-0 flex flex-col justify-end overflow-hidden"
        style={{
          padding: `${verticalPadding}px`,
          gap: verticalGap,
        }}
      >
        {!flags.hideLogo && (
          <Logo url={config.logoUrl} size={fontSize.logo} />
        )}
        <p style={{
          ...headlineStyle(tokens),
          textShadow: tokens.shadows.textShadow,
        }}>
          {config.headline}
        </p>
        {!flags.hideSubline && (
          <p style={{
            ...sublineStyle(tokens),
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          }}>
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
