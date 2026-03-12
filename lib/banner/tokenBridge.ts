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
  const isSmall = area < 65_000;
  const isTiny = area < 25_000;
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
  const logoRaw = headlineRaw * 1.4;

  // Headline constraint based on format orientation:
  // Horizontal banners: height is the bottleneck (thin strip)
  // Vertical banners: width is the bottleneck (narrow column)
  // Square banners: balanced constraint on min dimension
  const headlineMaxForDim = Math.round(
    isHorizontal
      ? height * 0.24
      : isVertical
        ? width * 0.12
        : minDim * 0.10
  );
  // Dynamic headline cap: 48px for standard ads, scales up for social/large formats
  // Social (1080px+) should feel like social posts, not tiny ad text
  const headlineCap = area > 500_000 ? 72 : 48;
  const headline = Math.round(Math.max(9, Math.min(headlineMaxForDim, headlineCap, headlineRaw)));

  // Subline & CTA caps scale with headline for large formats
  const sublineCap = area > 500_000 ? 32 : 20;
  const sublineMax = Math.min(sublineCap, Math.round(headline * 0.7));
  const subline = Math.round(Math.max(7, Math.min(sublineMax, sublineRaw)));

  const ctaCap = area > 500_000 ? 28 : 20;
  // CTA must stay below headline (max 85%) to preserve visual hierarchy
  const ctaMax = Math.min(ctaCap, Math.round(headline * 0.85));
  const ctaMin = Math.max(7, Math.min(ctaMax, Math.round(headline * 0.55)));
  const cta = Math.round(Math.max(ctaMin, Math.min(ctaMax, ctaRaw)));

  // Logo scales with format size
  const logoCap = area > 500_000 ? 56 : 36;
  const logo = Math.round(Math.max(12, Math.min(logoCap, logoRaw)));

  // ── Spacing (proportional to min dimension, capped) ──────
  // Horizontal banners need more padding relative to their short height
  const paddingFactor = isHorizontal ? 0.10 : 0.06;
  const paddingMax = area > 500_000 ? 40 : 24;
  const padding = Math.round(Math.max(6, Math.min(paddingMax, minDim * paddingFactor)));
  const gapMax = area > 500_000 ? 16 : 10;
  const gap = Math.round(Math.max(2, Math.min(gapMax, minDim * 0.025)));
  const ctaMarginMax = area > 500_000 ? 14 : 8;
  const ctaMarginTop = Math.round(Math.max(1, Math.min(ctaMarginMax, minDim * 0.02)));

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
  const hideSubline = isTiny || isSmall || (isHorizontal && height < 120) || (isVertical && width < 150);
  const hideLogo = isTiny || (isHorizontal && (height < 70 || width < 400));
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
