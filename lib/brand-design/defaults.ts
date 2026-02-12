import type { DesignTokens } from '@/types/designTokens';

// ─── Modular Scale Generator ──────────────────────────────────
function generateScale(base: number, ratio: number): Record<string, string> {
  return {
    xs: `${(base / ratio / ratio).toFixed(1)}px`,
    sm: `${(base / ratio).toFixed(1)}px`,
    base_: `${base}px`,
    md: `${(base * ratio).toFixed(1)}px`,
    lg: `${(base * ratio * ratio).toFixed(1)}px`,
    xl: `${(base * ratio ** 3).toFixed(1)}px`,
    '2xl': `${(base * ratio ** 4).toFixed(1)}px`,
    '3xl': `${(base * ratio ** 5).toFixed(1)}px`,
    '4xl': `${(base * ratio ** 6).toFixed(1)}px`,
    '5xl': `${(base * ratio ** 7).toFixed(1)}px`,
  };
}

// ─── Spacing Scale Generator ──────────────────────────────────
function generateSpacingScale(base: number): Record<string, string> {
  return {
    xs: `${base}px`,        // 4
    sm: `${base * 2}px`,    // 8
    md: `${base * 4}px`,    // 16
    lg: `${base * 6}px`,    // 24
    xl: `${base * 8}px`,    // 32
    '2xl': `${base * 12}px`, // 48
    '3xl': `${base * 16}px`, // 64
    '4xl': `${base * 24}px`, // 96
  };
}

// ─── Default Design Tokens ────────────────────────────────────

const BASE_FONT_SIZE = 16;
const SCALE_RATIO = 1.25; // Major third
const SPACING_BASE = 4;

const typeScale = generateScale(BASE_FONT_SIZE, SCALE_RATIO);
const spacingScale = generateSpacingScale(SPACING_BASE);

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  version: 1,

  colors: {
    palette: {
      primary: '#7c3aed',
      secondary: '#4f46e5',
      accent: '#f59e0b',
      neutral: '#71717a',
      white: '#ffffff',
      black: '#09090b',
    },
    semantic: {
      primary: '#7c3aed',
      secondary: '#4f46e5',
      accent: '#f59e0b',
      background: {
        default: '#ffffff',
        subtle: '#f4f4f5',
        inverse: '#09090b',
      },
      text: {
        default: '#18181b',
        muted: '#71717a',
        inverse: '#fafafa',
        onPrimary: '#ffffff',
      },
      status: {
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      border: {
        default: '#e4e4e7',
        subtle: '#f4f4f5',
      },
    },
  },

  typography: {
    fonts: {
      heading: { family: 'Inter', fallback: 'sans-serif' },
      body: { family: 'Inter', fallback: 'sans-serif' },
    },
    scale: {
      base: BASE_FONT_SIZE,
      ratio: SCALE_RATIO,
      ...typeScale,
    } as DesignTokens['typography']['scale'],
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0em',
      wide: '0.05em',
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    headingUppercase: false,
  },

  spacing: {
    base: SPACING_BASE,
    scale: spacingScale as DesignTokens['spacing']['scale'],
    container: '1200px',
    sectionPadding: '64px',
  },

  borders: {
    radius: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
      default: '8px',
    },
    width: '1px',
    color: '#e4e4e7',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },

  components: {
    button: {
      primary: {
        background: '#7c3aed',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        textTransform: 'none',
        paddingX: '24px',
        paddingY: '12px',
      },
      secondary: {
        background: '#f4f4f5',
        color: '#18181b',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        textTransform: 'none',
        paddingX: '24px',
        paddingY: '12px',
      },
      ghost: {
        background: 'transparent',
        color: '#7c3aed',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 500,
        textTransform: 'none',
        paddingX: '24px',
        paddingY: '12px',
      },
      outline: {
        background: 'transparent',
        color: '#7c3aed',
        border: '1px solid #7c3aed',
        borderRadius: '8px',
        fontWeight: 600,
        textTransform: 'none',
        paddingX: '24px',
        paddingY: '12px',
      },
    },
    input: {
      background: '#ffffff',
      border: '1px solid #e4e4e7',
      borderRadius: '8px',
      focusRing: '#7c3aed',
      padding: '10px 14px',
    },
    card: {
      background: '#ffffff',
      border: '1px solid #e4e4e7',
      borderRadius: '12px',
      shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      padding: '24px',
    },
    link: {
      color: '#7c3aed',
      hoverColor: '#6d28d9',
      underline: false,
    },
  },

  media: {
    logoVariants: {
      primary: '',
    },
    imageStyle: 'Clean, modern photography with natural lighting',
    iconStyle: 'Outlined, 1.5px stroke, rounded caps',
  },

  voice: {
    formality: 'neutral',
    tone: ['professional', 'friendly'],
    address: 'du',
    languages: ['de'],
    dos: [],
    donts: [],
    description: '',
  },
};

/**
 * Recalculate type scale from base + ratio.
 */
export function recalculateTypeScale(base: number, ratio: number) {
  return generateScale(base, ratio);
}

/**
 * Recalculate spacing scale from base unit.
 */
export function recalculateSpacingScale(base: number) {
  return generateSpacingScale(base);
}
