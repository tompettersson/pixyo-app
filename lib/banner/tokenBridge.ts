// ─── Token Bridge: DesignTokens → Banner-Ready Values ─────────
// Computes responsive typography, spacing, colors, and visibility flags
// for any banner dimension. All patterns consume BannerTokens instead
// of calling fontSizes() / hardcoding Tailwind classes.

import type { BannerConfig } from '@/store/useBannerConfigStore';
import type { DesignTokens } from '@/types/designTokens';
import { getContrastColor, getContrastColorForGradient, hexToRgba } from './colorUtils';

// ─── Public types ────────────────────────────────────────────

export interface BannerTokens {
  // Responsive font sizes (px)
  fontSize: {
    headline: number;
    subline: number;
    cta: number;
    logo: number;
  };

  // Proportional spacing (px)
  spacing: {
    padding: number;
    gap: number;
    ctaMarginTop: number;
  };

  // Resolved colors
  colors: {
    text: string;
    textMuted: string; // text at ~80% opacity equivalent
    ctaBg: string;
    ctaText: string;
    gradientFrom: string;
    gradientTo: string;
    accent: string;
  };

  // Typography details
  typography: {
    headlineFont: string;
    bodyFont: string;
    headlineWeight: string;
    headlineUppercase: boolean;
    ctaUppercase: boolean;
    ctaFontWeight: number;
    ctaBorderRadius: string;
    lineHeight: number;
    letterSpacing: string;
  };

  // Shadow tokens (CSS strings)
  shadows: {
    sm: string;
    md: string;
    textShadow: string;
  };

  // Layout flags
  flags: {
    isSmall: boolean;
    isTiny: boolean;
    isHorizontal: boolean;
    isVertical: boolean;
    hideSubline: boolean;
    hideLogo: boolean;
    hideCta: boolean;
  };
}

// ─── Reference area for scaling ──────────────────────────────
// Medium Rectangle (300x250) = 75,000 is our "1x" reference
const REFERENCE_AREA = 75_000;

// ─── Modular scale helper ────────────────────────────────────
function modularScale(base: number, ratio: number, step: number): number {
  return base * Math.pow(ratio, step);
}

// ─── Compute BannerTokens ────────────────────────────────────

export function computeBannerTokens(
  width: number,
  height: number,
  config: BannerConfig,
  designTokens?: DesignTokens | null
): BannerTokens {
  const area = width * height;
  const minDim = Math.min(width, height);
  const ratio = width / height;

  // ── Layout flags ──────────────────────────────────────────
  const isSmall = area < 40_000;
  const isTiny = area < 20_000;
  const isHorizontal = ratio > 1.5;
  const isVertical = 1 / ratio > 1.5;

  // ── Typography scaling ────────────────────────────────────
  // Modular scale from design tokens or defaults
  const scaleBase = designTokens?.typography?.scale?.base ?? 16;
  const scaleRatio = designTokens?.typography?.scale?.ratio ?? 1.25;

  // Scale factor: sqrt(area / reference) gives smooth sizing
  // Clamp to prevent extremes on very small/large banners
  const scaleFactor = Math.max(0.45, Math.min(2.5, Math.sqrt(area / REFERENCE_AREA)));

  // Headline = scale step 2 (2xl equivalent) × scaleFactor
  const headlineRaw = modularScale(scaleBase, scaleRatio, 2) * scaleFactor;
  // Subline = scale step 0 (base) × scaleFactor
  const sublineRaw = modularScale(scaleBase, scaleRatio, 0) * scaleFactor;
  // CTA = between subline and headline
  const ctaRaw = modularScale(scaleBase, scaleRatio, -1) * scaleFactor;
  // Logo = relative to headline
  const logoRaw = headlineRaw * 1.6;

  const headline = Math.round(Math.max(9, Math.min(72, headlineRaw)));
  const subline = Math.round(Math.max(7, Math.min(28, sublineRaw)));
  const cta = Math.round(Math.max(7, Math.min(20, ctaRaw)));
  const logo = Math.round(Math.max(14, Math.min(64, logoRaw)));

  // ── Spacing (proportional to min dimension) ───────────────
  const padding = Math.round(Math.max(4, minDim * 0.06));
  const gap = Math.round(Math.max(2, minDim * 0.025));
  const ctaMarginTop = Math.round(Math.max(2, minDim * 0.02));

  // ── Colors ────────────────────────────────────────────────
  const gradientFrom = config.colorFrom;
  const gradientTo = config.colorTo;
  const accent = config.accentColor;

  // Resolve text color from gradient average (not just colorFrom)
  let textColor: string;
  if (config.textColor === 'white') {
    textColor = '#ffffff';
  } else if (config.textColor === 'dark') {
    textColor = '#1a1a1a';
  } else {
    textColor = getContrastColorForGradient(gradientFrom, gradientTo);
  }

  // Muted text = same hue but reduced contrast
  const textMuted = textColor === '#ffffff'
    ? 'rgba(255, 255, 255, 0.75)'
    : 'rgba(26, 26, 26, 0.65)';

  // CTA colors: from design tokens or accent
  const ctaBg = designTokens?.components?.button?.primary?.background ?? accent;
  const ctaText = designTokens?.components?.button?.primary?.color ?? getContrastColor(accent);

  // ── Typography details ────────────────────────────────────
  const headlineFont = config.headlineFont;
  const bodyFont = designTokens?.typography?.fonts?.body?.family ?? config.headlineFont;
  const headlineWeight = config.headlineWeight;
  const headlineUppercase = config.headlineUppercase;
  const ctaUppercase = config.ctaUppercase;
  const ctaFontWeight = designTokens?.components?.button?.primary?.fontWeight ?? 700;
  const ctaBorderRadius = designTokens?.components?.button?.primary?.borderRadius
    ?? (config.ctaStyle === 'pill' ? '9999px' : config.ctaStyle === 'rounded' ? '8px' : '0px');
  const lineHeight = designTokens?.typography?.lineHeight?.tight ?? 1.2;
  const letterSpacing = designTokens?.typography?.letterSpacing?.tight ?? '-0.02em';

  // ── Shadows ───────────────────────────────────────────────
  const shadows = {
    sm: designTokens?.shadows?.sm ?? '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: designTokens?.shadows?.md ?? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  };

  // ── Visibility flags ──────────────────────────────────────
  // Hide elements that don't fit in very small formats
  const hideSubline = isTiny || (isHorizontal && minDim < 55);
  const hideLogo = isTiny;
  const hideCta = false; // always show CTA, but scale it down

  return {
    fontSize: { headline, subline, cta, logo },
    spacing: { padding, gap, ctaMarginTop },
    colors: {
      text: textColor,
      textMuted,
      ctaBg,
      ctaText,
      gradientFrom,
      gradientTo,
      accent,
    },
    typography: {
      headlineFont,
      bodyFont,
      headlineWeight,
      headlineUppercase,
      ctaUppercase,
      ctaFontWeight,
      ctaBorderRadius,
      lineHeight,
      letterSpacing,
    },
    shadows,
    flags: {
      isSmall,
      isTiny,
      isHorizontal,
      isVertical,
      hideSubline,
      hideLogo,
      hideCta,
    },
  };
}
