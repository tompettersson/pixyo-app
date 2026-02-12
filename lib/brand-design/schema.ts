import { z } from 'zod';

// ─── Reusable sub-schemas ─────────────────────────────────────

const fontSpecSchema = z.object({
  family: z.string(),
  fallback: z.string(),
});

const buttonStyleSchema = z.object({
  background: z.string(),
  color: z.string(),
  border: z.string(),
  borderRadius: z.string(),
  fontWeight: z.number(),
  textTransform: z.enum(['none', 'uppercase']),
  paddingX: z.string(),
  paddingY: z.string(),
});

// ─── Full Design Tokens Schema ────────────────────────────────

export const designTokensSchema = z.object({
  version: z.literal(1),

  colors: z.object({
    palette: z.record(z.string(), z.string()),
    semantic: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background: z.object({
        default: z.string(),
        subtle: z.string(),
        inverse: z.string(),
      }),
      text: z.object({
        default: z.string(),
        muted: z.string(),
        inverse: z.string(),
        onPrimary: z.string(),
      }),
      status: z.object({
        success: z.string(),
        warning: z.string(),
        error: z.string(),
        info: z.string(),
      }),
      border: z.object({
        default: z.string(),
        subtle: z.string(),
      }),
    }),
  }),

  typography: z.object({
    fonts: z.object({
      heading: fontSpecSchema,
      body: fontSpecSchema,
      mono: fontSpecSchema.optional(),
    }),
    scale: z.object({
      base: z.number(),
      ratio: z.number(),
      xs: z.string(),
      sm: z.string(),
      base_: z.string(),
      md: z.string(),
      lg: z.string(),
      xl: z.string(),
      '2xl': z.string(),
      '3xl': z.string(),
      '4xl': z.string(),
      '5xl': z.string(),
    }),
    lineHeight: z.object({
      tight: z.number(),
      normal: z.number(),
      relaxed: z.number(),
    }),
    letterSpacing: z.object({
      tight: z.string(),
      normal: z.string(),
      wide: z.string(),
    }),
    fontWeights: z.object({
      normal: z.number(),
      medium: z.number(),
      semibold: z.number(),
      bold: z.number(),
    }),
    headingUppercase: z.boolean(),
  }),

  spacing: z.object({
    base: z.number(),
    scale: z.object({
      xs: z.string(),
      sm: z.string(),
      md: z.string(),
      lg: z.string(),
      xl: z.string(),
      '2xl': z.string(),
      '3xl': z.string(),
      '4xl': z.string(),
    }),
    container: z.string(),
    sectionPadding: z.string(),
  }),

  borders: z.object({
    radius: z.object({
      none: z.string(),
      sm: z.string(),
      md: z.string(),
      lg: z.string(),
      xl: z.string(),
      full: z.string(),
      default: z.string(),
    }),
    width: z.string(),
    color: z.string(),
  }),

  shadows: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
  }),

  components: z.object({
    button: z.object({
      primary: buttonStyleSchema,
      secondary: buttonStyleSchema,
      ghost: buttonStyleSchema,
      outline: buttonStyleSchema,
    }),
    input: z.object({
      background: z.string(),
      border: z.string(),
      borderRadius: z.string(),
      focusRing: z.string(),
      padding: z.string(),
    }),
    card: z.object({
      background: z.string(),
      border: z.string(),
      borderRadius: z.string(),
      shadow: z.string(),
      padding: z.string(),
    }),
    link: z.object({
      color: z.string(),
      hoverColor: z.string(),
      underline: z.boolean(),
    }),
  }),

  media: z.object({
    logoVariants: z.object({
      primary: z.string(),
      dark: z.string().optional(),
      light: z.string().optional(),
      icon: z.string().optional(),
    }),
    favicon: z.string().optional(),
    imageStyle: z.string(),
    iconStyle: z.string(),
  }),

  voice: z.object({
    formality: z.enum(['formal', 'neutral', 'casual']),
    tone: z.array(z.string()),
    address: z.enum(['du', 'Sie', 'ihr']),
    languages: z.array(z.string()),
    dos: z.array(z.string()),
    donts: z.array(z.string()),
    description: z.string(),
  }),
});

export type ValidatedDesignTokens = z.infer<typeof designTokensSchema>;
