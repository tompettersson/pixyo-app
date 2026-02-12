// ─── HSL-based Palette Generator ──────────────────────────────
// Generates a harmonious color palette from a single primary color.

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToHSL(hex: string): HSL {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16) / 255;
  const g = parseInt(sanitized.substring(2, 4), 16) / 255;
  const b = parseInt(sanitized.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const hNorm = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (hNorm < 60) { r = c; g = x; }
  else if (hNorm < 120) { r = x; g = c; }
  else if (hNorm < 180) { g = c; b = x; }
  else if (hNorm < 240) { g = x; b = c; }
  else if (hNorm < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export interface GeneratedPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  background: {
    default: string;
    subtle: string;
    inverse: string;
  };
  text: {
    default: string;
    muted: string;
    inverse: string;
    onPrimary: string;
  };
  border: {
    default: string;
    subtle: string;
  };
}

/**
 * Generate a full semantic palette from a single primary color.
 * Uses complementary + analogous harmony.
 */
export function generatePalette(primaryHex: string): GeneratedPalette {
  const { h, s, l } = hexToHSL(primaryHex);

  // Determine if primary is dark or light
  const isLight = l > 0.5;

  // Secondary: analogous (+30 degrees, slightly less saturated)
  const secondary = hslToHex(h + 30, s * 0.85, Math.min(l + 0.05, 0.65));

  // Accent: complementary (opposite on wheel), warmer
  const accent = hslToHex(h + 180, Math.min(s * 1.1, 1), 0.55);

  // On-primary: white if primary is dark enough, otherwise dark
  const onPrimary = l < 0.55 ? '#ffffff' : '#18181b';

  return {
    primary: primaryHex,
    secondary,
    accent,
    neutral: '#71717a',
    background: {
      default: '#ffffff',
      subtle: hslToHex(h, s * 0.08, 0.97),
      inverse: hslToHex(h, s * 0.15, 0.06),
    },
    text: {
      default: '#18181b',
      muted: '#71717a',
      inverse: '#fafafa',
      onPrimary,
    },
    border: {
      default: hslToHex(h, s * 0.05, 0.89),
      subtle: hslToHex(h, s * 0.03, 0.96),
    },
  };
}

/**
 * Get a readable contrast color (black or white) for a given background.
 */
export function getContrastColor(hex: string): string {
  const { l } = hexToHSL(hex);
  return l > 0.55 ? '#18181b' : '#ffffff';
}

/**
 * Lighten a hex color by a given amount (0-1).
 */
export function lighten(hex: string, amount: number): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, s, Math.min(l + amount, 1));
}

/**
 * Darken a hex color by a given amount (0-1).
 */
export function darken(hex: string, amount: number): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, s, Math.max(l - amount, 0));
}
