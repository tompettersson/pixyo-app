'use client';

import React from 'react';
import type { BannerConfig } from '@/store/useBannerConfigStore';

// ─── Common props for all patterns ─────────────────────────────
export type PatternProps = {
  width: number;
  height: number;
  config: BannerConfig & { resolvedTextColor: string };
};

// ─── Aspect-ratio helpers ──────────────────────────────────────
export function isHorizontal(w: number, h: number) {
  return w / h > 1.5;
}

export function isVertical(w: number, h: number) {
  return h / w > 1.5;
}

export function isSmall(w: number, h: number) {
  return w * h < 40000;
}

export function isTiny(w: number, h: number) {
  return w * h < 25000;
}

// ─── Responsive font sizes (area-based) ────────────────────────
export function fontSizes(w: number, h: number) {
  const area = w * h;
  if (area > 1_000_000) return { headline: 36, sub: 18, logo: 36, cta: false as const };
  if (area > 200_000) return { headline: 24, sub: 14, logo: 32, cta: false as const };
  if (area > 80_000) return { headline: 16, sub: 10, logo: 24, cta: true as const };
  if (area > 30_000) return { headline: 13, sub: 9, logo: 20, cta: true as const };
  return { headline: 11, sub: 8, logo: 16, cta: true as const };
}

// ─── Headline style builder ────────────────────────────────────
export function headlineStyle(
  config: PatternProps['config'],
  fs: ReturnType<typeof fontSizes>
): React.CSSProperties {
  return {
    fontSize: fs.headline,
    color: config.resolvedTextColor,
    fontFamily: config.headlineFont,
    fontWeight: config.headlineWeight,
    textTransform: config.headlineUppercase ? 'uppercase' : 'none',
  };
}

// ─── Logo component ────────────────────────────────────────────
export function Logo({
  url,
  size = 28,
  fallbackColor = '#fff',
}: {
  url: string | null;
  size?: number;
  fallbackColor?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt="Logo"
        style={{ width: size, height: size, objectFit: 'contain' }}
        crossOrigin="anonymous"
      />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill={fallbackColor} fillOpacity={0.2} />
      <circle cx="20" cy="20" r="17" stroke={fallbackColor} strokeWidth="2" fill="none" />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fill={fallbackColor}
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="16"
      >
        TF
      </text>
    </svg>
  );
}

// ─── CTA Button component ──────────────────────────────────────
export function CTAButton({
  config,
  small = false,
}: {
  config: PatternProps['config'];
  small?: boolean;
}) {
  const px = small ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]';
  const radius =
    config.ctaStyle === 'pill'
      ? 'rounded-full'
      : config.ctaStyle === 'rounded'
        ? 'rounded-lg'
        : 'rounded-none';

  // Auto text color based on accent luminance
  const accentHex = config.accentColor.replace('#', '');
  const r = parseInt(accentHex.substring(0, 2), 16);
  const g = parseInt(accentHex.substring(2, 4), 16);
  const b = parseInt(accentHex.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const ctaTextColor = lum > 0.5 ? '#1a1a1a' : '#ffffff';

  return (
    <span
      className={`inline-block font-bold tracking-wide ${px} ${radius}`}
      style={{
        backgroundColor: config.accentColor,
        color: ctaTextColor,
        textTransform: config.ctaUppercase ? 'uppercase' : 'none',
      }}
    >
      {config.ctaText}
    </span>
  );
}
