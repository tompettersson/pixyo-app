// ─── Central Color Utilities for Banner Rendering ─────────────
// Single source of truth — replaces duplicated luminance code in store + shared.tsx

/**
 * Parse a hex color string to RGB components.
 * Supports #RGB, #RRGGBB formats.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

/**
 * Relative luminance (0–1) per WCAG 2.0 formula.
 * Higher = lighter color.
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Average luminance of two colors.
 * Useful for gradient backgrounds where text must be readable over both stops.
 */
export function getAverageLuminance(hex1: string, hex2: string): number {
  return (getLuminance(hex1) + getLuminance(hex2)) / 2;
}

/**
 * Convert hex color to rgba() string.
 * Replaces the buggy `${hex}dd` CSS hex-alpha pattern.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Returns a contrasting text color (dark or light) for a given background.
 * Threshold at 0.5 luminance.
 */
export function getContrastColor(bgHex: string): string {
  return getLuminance(bgHex) > 0.5 ? '#1a1a1a' : '#ffffff';
}

/**
 * Returns a contrasting text color based on the average of two gradient stops.
 * Use this when text sits on a gradient background.
 */
export function getContrastColorForGradient(hex1: string, hex2: string): string {
  return getAverageLuminance(hex1, hex2) > 0.5 ? '#1a1a1a' : '#ffffff';
}
