import type { DesignTokens } from '@/types/designTokens';
import type { Customer } from '@/types/customer';
import { DEFAULT_DESIGN_TOKENS } from './defaults';
import { generatePalette, getContrastColor } from './palette-generator';

/**
 * Bootstrap design tokens from legacy profile fields.
 * Used when a profile has no designTokens yet — creates a full token set
 * from the existing colors, fonts, and layout.
 */
export function migrateFromProfile(profile: Customer): DesignTokens {
  const defaults = DEFAULT_DESIGN_TOKENS;

  // Safety: if profile fields are missing, return defaults
  if (!profile?.colors || !profile?.fonts || !profile?.layout) {
    return { ...defaults, media: { ...defaults.media, logoVariants: { primary: profile?.logo } } };
  }

  const { colors, fonts, layout, logo, logoVariants } = profile;

  // Generate a palette from the primary (dark) color
  const palette = generatePalette(colors.dark || '#7c3aed');

  const tokens: DesignTokens = {
    ...defaults,
    version: 1,

    colors: {
      palette: {
        primary: colors.dark,
        secondary: colors.light,
        accent: colors.accent,
        neutral: '#71717a',
        white: '#ffffff',
        black: '#09090b',
      },
      semantic: {
        primary: colors.dark,
        secondary: colors.light,
        accent: colors.accent,
        background: palette.background,
        text: {
          ...palette.text,
          onPrimary: getContrastColor(colors.dark),
        },
        status: defaults.colors.semantic.status,
        border: palette.border,
      },
    },

    typography: {
      ...defaults.typography,
      fonts: {
        heading: {
          family: fonts.headline.family,
          fallback: 'sans-serif',
        },
        body: {
          family: fonts.body.family || fonts.headline.family,
          fallback: 'sans-serif',
        },
      },
      fontWeights: {
        ...defaults.typography.fontWeights,
        bold: parseInt(fonts.headline.weight) || 700,
      },
      headingUppercase: fonts.headline.uppercase ?? false,
    },

    spacing: {
      ...defaults.spacing,
      // Derive base unit from padding
      base: Math.round(layout.padding.top / 6) || 4,
    },

    borders: {
      ...defaults.borders,
      radius: {
        ...defaults.borders.radius,
        default: `${layout.button.radius}px`,
      },
    },

    components: {
      ...defaults.components,
      button: {
        ...defaults.components.button,
        primary: {
          ...defaults.components.button.primary,
          background: colors.accent,
          color: getContrastColor(colors.accent),
          borderRadius: `${layout.button.radius}px`,
          paddingX: `${layout.button.paddingX}px`,
          paddingY: `${layout.button.paddingY}px`,
        },
        secondary: {
          ...defaults.components.button.secondary,
          borderRadius: `${layout.button.radius}px`,
        },
        ghost: {
          ...defaults.components.button.ghost,
          color: colors.dark,
          borderRadius: `${layout.button.radius}px`,
        },
        outline: {
          ...defaults.components.button.outline,
          color: colors.dark,
          border: `1px solid ${colors.dark}`,
          borderRadius: `${layout.button.radius}px`,
        },
      },
      input: {
        ...defaults.components.input,
        focusRing: colors.dark,
      },
      link: {
        ...defaults.components.link,
        color: colors.dark,
        hoverColor: colors.light,
      },
    },

    media: {
      logoVariants: {
        primary: logo,
        dark: logoVariants?.dark,
        light: logoVariants?.light,
      },
      imageStyle: defaults.media.imageStyle,
      iconStyle: defaults.media.iconStyle,
    },

    voice: defaults.voice,
  };

  return tokens;
}
