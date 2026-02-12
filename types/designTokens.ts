// ─── Brand Design Token Types ─────────────────────────────────
// Complete, machine-readable design system derived from customer brand

export interface DesignTokens {
  version: 1;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  components: ComponentTokens;
  media: MediaTokens;
  voice: VoiceTokens;
}

// ─── Colors ───────────────────────────────────────────────────

export interface ColorTokens {
  /** Named palette — user-defined swatches */
  palette: Record<string, string>;
  /** Semantic color roles */
  semantic: {
    primary: string;
    secondary: string;
    accent: string;
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
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    border: {
      default: string;
      subtle: string;
    };
  };
}

// ─── Typography ───────────────────────────────────────────────

export interface FontSpec {
  family: string;
  fallback: string;
}

export interface TypographyTokens {
  fonts: {
    heading: FontSpec;
    body: FontSpec;
    mono?: FontSpec;
  };
  scale: {
    base: number; // px
    ratio: number; // modular scale ratio (e.g. 1.25 = major third)
    xs: string;
    sm: string;
    base_: string; // "base_" because "base" is the px value
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  headingUppercase: boolean;
}

// ─── Spacing ──────────────────────────────────────────────────

export interface SpacingTokens {
  base: number; // px (e.g. 4 or 8)
  scale: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  container: string; // max-width (e.g. "1200px")
  sectionPadding: string; // vertical section padding (e.g. "64px")
}

// ─── Borders ──────────────────────────────────────────────────

export interface BorderTokens {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
    default: string; // which one is the default
  };
  width: string;
  color: string;
}

// ─── Shadows ──────────────────────────────────────────────────

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

// ─── Components ───────────────────────────────────────────────

export interface ButtonStyle {
  background: string;
  color: string;
  border: string;
  borderRadius: string;
  fontWeight: number;
  textTransform: 'none' | 'uppercase';
  paddingX: string;
  paddingY: string;
}

export interface ComponentTokens {
  button: {
    primary: ButtonStyle;
    secondary: ButtonStyle;
    ghost: ButtonStyle;
    outline: ButtonStyle;
  };
  input: {
    background: string;
    border: string;
    borderRadius: string;
    focusRing: string;
    padding: string;
  };
  card: {
    background: string;
    border: string;
    borderRadius: string;
    shadow: string;
    padding: string;
  };
  link: {
    color: string;
    hoverColor: string;
    underline: boolean;
  };
}

// ─── Media ────────────────────────────────────────────────────

export interface MediaTokens {
  logoVariants: {
    primary: string; // URL
    dark?: string;
    light?: string;
    icon?: string;
  };
  favicon?: string;
  imageStyle: string; // e.g. "Warm, lifestyle photography"
  iconStyle: string; // e.g. "Outlined, 2px stroke"
}

// ─── Voice ────────────────────────────────────────────────────

export interface VoiceTokens {
  formality: 'formal' | 'neutral' | 'casual';
  tone: string[]; // e.g. ["friendly", "confident", "professional"]
  address: 'du' | 'Sie' | 'ihr';
  languages: string[]; // e.g. ["de", "en"]
  dos: string[]; // "Do this..."
  donts: string[]; // "Don't do that..."
  description: string; // Free-form brand voice description
}

// ─── Utility types ────────────────────────────────────────────

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends (infer U)[]
      ? U[]
      : DeepPartial<T[K]>
    : T[K];
};
