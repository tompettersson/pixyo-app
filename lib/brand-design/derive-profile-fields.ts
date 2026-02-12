import type { DesignTokens } from '@/types/designTokens';

/**
 * Derive legacy profile fields (colors, fonts, layout) from design tokens.
 * Used when saving — keeps the old fields in sync for tools that still read them.
 */
export function deriveProfileFields(tokens: DesignTokens) {
  const { colors, typography, borders, components } = tokens;

  return {
    colors: {
      dark: colors.semantic.primary,
      light: colors.semantic.secondary,
      accent: colors.semantic.accent,
    },
    fonts: {
      headline: {
        family: typography.fonts.heading.family,
        size: typography.scale.base * (typography.scale.ratio ** 3), // ~xl size
        weight: String(typography.fontWeights.bold),
        uppercase: typography.headingUppercase,
      },
      body: {
        family: typography.fonts.body.family,
        size: typography.scale.base,
        weight: String(typography.fontWeights.normal),
      },
    },
    layout: {
      padding: {
        top: parseInt(tokens.spacing.scale.lg) || 24,
        right: parseInt(tokens.spacing.scale.lg) || 24,
        bottom: parseInt(tokens.spacing.scale.lg) || 24,
        left: parseInt(tokens.spacing.scale.lg) || 24,
      },
      gaps: {
        taglineToHeadline: parseInt(tokens.spacing.scale.sm) || 8,
        headlineToBody: parseInt(tokens.spacing.scale.md) || 16,
        bodyToButton: parseInt(tokens.spacing.scale.lg) || 24,
      },
      button: {
        radius: parseInt(components.button.primary.borderRadius) || 8,
        paddingX: parseInt(components.button.primary.paddingX) || 24,
        paddingY: parseInt(components.button.primary.paddingY) || 12,
      },
    },
    // Also sync logo variants if available
    ...(tokens.media.logoVariants.primary
      ? { logo: tokens.media.logoVariants.primary }
      : {}),
    ...(tokens.media.logoVariants.dark || tokens.media.logoVariants.light
      ? {
          logoVariants: {
            dark: tokens.media.logoVariants.dark || tokens.media.logoVariants.primary,
            light: tokens.media.logoVariants.light || tokens.media.logoVariants.primary,
          },
        }
      : {}),
  };
}
