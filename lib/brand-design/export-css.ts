import type { DesignTokens } from '@/types/designTokens';

/**
 * Generate CSS custom properties from design tokens.
 */
export function generateCSSVariables(tokens: DesignTokens): string {
  const { colors, typography, spacing, borders, shadows, components } = tokens;

  const lines: string[] = [':root {'];

  // Colors
  lines.push('  /* Colors — Palette */');
  for (const [name, value] of Object.entries(colors.palette)) {
    lines.push(`  --color-${name}: ${value};`);
  }

  lines.push('');
  lines.push('  /* Colors — Semantic */');
  lines.push(`  --color-primary: ${colors.semantic.primary};`);
  lines.push(`  --color-secondary: ${colors.semantic.secondary};`);
  lines.push(`  --color-accent: ${colors.semantic.accent};`);
  lines.push(`  --color-bg-default: ${colors.semantic.background.default};`);
  lines.push(`  --color-bg-subtle: ${colors.semantic.background.subtle};`);
  lines.push(`  --color-bg-inverse: ${colors.semantic.background.inverse};`);
  lines.push(`  --color-text-default: ${colors.semantic.text.default};`);
  lines.push(`  --color-text-muted: ${colors.semantic.text.muted};`);
  lines.push(`  --color-text-inverse: ${colors.semantic.text.inverse};`);
  lines.push(`  --color-text-on-primary: ${colors.semantic.text.onPrimary};`);
  lines.push(`  --color-success: ${colors.semantic.status.success};`);
  lines.push(`  --color-warning: ${colors.semantic.status.warning};`);
  lines.push(`  --color-error: ${colors.semantic.status.error};`);
  lines.push(`  --color-info: ${colors.semantic.status.info};`);
  lines.push(`  --color-border: ${colors.semantic.border.default};`);
  lines.push(`  --color-border-subtle: ${colors.semantic.border.subtle};`);

  // Typography
  lines.push('');
  lines.push('  /* Typography */');
  lines.push(`  --font-heading: '${typography.fonts.heading.family}', ${typography.fonts.heading.fallback};`);
  lines.push(`  --font-body: '${typography.fonts.body.family}', ${typography.fonts.body.fallback};`);
  if (typography.fonts.mono) {
    lines.push(`  --font-mono: '${typography.fonts.mono.family}', ${typography.fonts.mono.fallback};`);
  }
  lines.push(`  --font-size-base: ${typography.scale.base}px;`);
  lines.push(`  --font-size-xs: ${typography.scale.xs};`);
  lines.push(`  --font-size-sm: ${typography.scale.sm};`);
  lines.push(`  --font-size-md: ${typography.scale.md};`);
  lines.push(`  --font-size-lg: ${typography.scale.lg};`);
  lines.push(`  --font-size-xl: ${typography.scale.xl};`);
  lines.push(`  --font-size-2xl: ${typography.scale['2xl']};`);
  lines.push(`  --font-size-3xl: ${typography.scale['3xl']};`);
  lines.push(`  --font-size-4xl: ${typography.scale['4xl']};`);
  lines.push(`  --font-size-5xl: ${typography.scale['5xl']};`);
  lines.push(`  --line-height-tight: ${typography.lineHeight.tight};`);
  lines.push(`  --line-height-normal: ${typography.lineHeight.normal};`);
  lines.push(`  --line-height-relaxed: ${typography.lineHeight.relaxed};`);
  lines.push(`  --letter-spacing-tight: ${typography.letterSpacing.tight};`);
  lines.push(`  --letter-spacing-normal: ${typography.letterSpacing.normal};`);
  lines.push(`  --letter-spacing-wide: ${typography.letterSpacing.wide};`);
  lines.push(`  --font-weight-normal: ${typography.fontWeights.normal};`);
  lines.push(`  --font-weight-medium: ${typography.fontWeights.medium};`);
  lines.push(`  --font-weight-semibold: ${typography.fontWeights.semibold};`);
  lines.push(`  --font-weight-bold: ${typography.fontWeights.bold};`);

  // Spacing
  lines.push('');
  lines.push('  /* Spacing */');
  lines.push(`  --space-base: ${spacing.base}px;`);
  for (const [key, value] of Object.entries(spacing.scale)) {
    lines.push(`  --space-${key}: ${value};`);
  }
  lines.push(`  --container-max-width: ${spacing.container};`);
  lines.push(`  --section-padding: ${spacing.sectionPadding};`);

  // Borders
  lines.push('');
  lines.push('  /* Borders */');
  for (const [key, value] of Object.entries(borders.radius)) {
    if (key === 'default') {
      lines.push(`  --radius-default: ${value};`);
    } else {
      lines.push(`  --radius-${key}: ${value};`);
    }
  }
  lines.push(`  --border-width: ${borders.width};`);
  lines.push(`  --border-color: ${borders.color};`);

  // Shadows
  lines.push('');
  lines.push('  /* Shadows */');
  lines.push(`  --shadow-sm: ${shadows.sm};`);
  lines.push(`  --shadow-md: ${shadows.md};`);
  lines.push(`  --shadow-lg: ${shadows.lg};`);
  lines.push(`  --shadow-xl: ${shadows.xl};`);

  lines.push('}');
  return lines.join('\n');
}
