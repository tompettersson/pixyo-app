'use client';

import React from 'react';
import type { BannerConfig } from '@/store/useBannerConfigStore';
import type { BannerTokens } from '@/lib/banner/tokenBridge';

// ─── Common props for all patterns ─────────────────────────────
export type PatternProps = {
  width: number;
  height: number;
  config: BannerConfig & { resolvedTextColor: string };
  tokens: BannerTokens;
};

// ─── Headline style builder (token-aware) ────────────────────
export function headlineStyle(tokens: BannerTokens): React.CSSProperties {
  return {
    fontSize: tokens.fontSize.headline,
    color: tokens.colors.text,
    fontFamily: tokens.typography.headlineFont,
    fontWeight: tokens.typography.headlineWeight,
    textTransform: tokens.typography.headlineUppercase ? 'uppercase' : 'none',
    lineHeight: tokens.typography.lineHeight,
    letterSpacing: tokens.typography.letterSpacing,
  };
}

// ─── Subline style builder ───────────────────────────────────
export function sublineStyle(tokens: BannerTokens): React.CSSProperties {
  return {
    fontSize: tokens.fontSize.subline,
    color: tokens.colors.textMuted,
    fontFamily: tokens.typography.bodyFont,
    lineHeight: tokens.typography.lineHeight + 0.1,
  };
}

// ─── Logo component ────────────────────────────────────────────
export function Logo({
  url,
  size = 28,
}: {
  url: string | null;
  size?: number;
}) {
  if (!url) return null;
  return (
    <img
      src={url}
      alt="Logo"
      style={{ width: size, height: size, objectFit: 'contain' }}
      crossOrigin="anonymous"
    />
  );
}

// ─── CTA Button component (token-aware) ────────────────────────
export function CTAButton({
  tokens,
}: {
  tokens: BannerTokens;
}) {
  // Scale padding proportionally to CTA font size
  const py = Math.max(2, Math.round(tokens.fontSize.cta * 0.35));
  const px = Math.max(4, Math.round(tokens.fontSize.cta * 1.0));

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: tokens.fontSize.cta,
        fontWeight: tokens.typography.ctaFontWeight,
        letterSpacing: '0.03em',
        backgroundColor: tokens.colors.ctaBg,
        color: tokens.colors.ctaText,
        textTransform: tokens.typography.ctaUppercase ? 'uppercase' : 'none',
        borderRadius: tokens.typography.ctaBorderRadius,
        padding: `${py}px ${px}px`,
        boxShadow: tokens.shadows.sm,
        whiteSpace: 'nowrap',
      }}
    >
      {/* Access ctaText from config — patterns pass it directly */}
    </span>
  );
}

// Patterns will render CTA inline, so we export a style-only helper too:
export function ctaStyle(tokens: BannerTokens): React.CSSProperties {
  const py = Math.max(2, Math.round(tokens.fontSize.cta * 0.35));
  const px = Math.max(4, Math.round(tokens.fontSize.cta * 1.0));

  return {
    display: 'inline-block',
    fontSize: tokens.fontSize.cta,
    fontWeight: tokens.typography.ctaFontWeight,
    letterSpacing: '0.03em',
    backgroundColor: tokens.colors.ctaBg,
    color: tokens.colors.ctaText,
    textTransform: tokens.typography.ctaUppercase ? 'uppercase' : 'none',
    borderRadius: tokens.typography.ctaBorderRadius,
    padding: `${py}px ${px}px`,
    boxShadow: tokens.shadows.sm,
    whiteSpace: 'nowrap',
  };
}

// ─── Content wrapper style ────────────────────────────────────
// Returns padding and gap as inline styles (replaces Tailwind p-3 gap-0.5)
export function contentStyle(tokens: BannerTokens): React.CSSProperties {
  return {
    padding: tokens.spacing.padding,
    gap: tokens.spacing.gap,
  };
}
