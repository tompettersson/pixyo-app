import type { DesignTokens } from '@/types/designTokens';

/**
 * Generate a Tailwind CSS v4 compatible config snippet.
 */
export function generateTailwindConfig(tokens: DesignTokens): string {
  const { colors, typography, spacing, borders, shadows } = tokens;

  const lines: string[] = [
    '/* Tailwind CSS v4 — @theme directive */',
    '/* Paste this into your main CSS file */',
    '',
    '@theme {',
  ];

  // Colors
  lines.push('  /* Colors */');
  for (const [name, value] of Object.entries(colors.palette)) {
    lines.push(`  --color-brand-${name}: ${value};`);
  }
  lines.push(`  --color-bg-default: ${colors.semantic.background.default};`);
  lines.push(`  --color-bg-subtle: ${colors.semantic.background.subtle};`);
  lines.push(`  --color-bg-inverse: ${colors.semantic.background.inverse};`);
  lines.push(`  --color-text-default: ${colors.semantic.text.default};`);
  lines.push(`  --color-text-muted: ${colors.semantic.text.muted};`);
  lines.push('');

  // Typography
  lines.push('  /* Typography */');
  lines.push(`  --font-heading: '${typography.fonts.heading.family}', ${typography.fonts.heading.fallback};`);
  lines.push(`  --font-body: '${typography.fonts.body.family}', ${typography.fonts.body.fallback};`);
  lines.push('');

  // Spacing
  lines.push('  /* Spacing */');
  for (const [key, value] of Object.entries(spacing.scale)) {
    lines.push(`  --spacing-${key}: ${value};`);
  }
  lines.push('');

  // Radius
  lines.push('  /* Radius */');
  for (const [key, value] of Object.entries(borders.radius)) {
    if (key !== 'default') {
      lines.push(`  --radius-${key}: ${value};`);
    }
  }
  lines.push('');

  // Shadows
  lines.push('  /* Shadows */');
  lines.push(`  --shadow-sm: ${shadows.sm};`);
  lines.push(`  --shadow-md: ${shadows.md};`);
  lines.push(`  --shadow-lg: ${shadows.lg};`);
  lines.push(`  --shadow-xl: ${shadows.xl};`);

  lines.push('}');
  return lines.join('\n');
}
