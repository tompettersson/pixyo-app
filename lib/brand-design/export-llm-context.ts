import type { DesignTokens } from '@/types/designTokens';

/**
 * Generate a human + LLM readable brand context string.
 * This can be used as system prompt context for AI tools.
 */
export function generateLLMContext(tokens: DesignTokens, brandName?: string | null): string {
  const { colors, typography, spacing, borders, shadows, components, media, voice } = tokens;

  const lines: string[] = [];

  if (brandName) {
    lines.push(`# ${brandName} — Brand Design System`);
  } else {
    lines.push('# Brand Design System');
  }
  lines.push('');

  // Colors
  lines.push('## Farben');
  lines.push(`- Primär: ${colors.semantic.primary}`);
  lines.push(`- Sekundär: ${colors.semantic.secondary}`);
  lines.push(`- Akzent: ${colors.semantic.accent}`);
  lines.push(`- Hintergrund: ${colors.semantic.background.default} (subtle: ${colors.semantic.background.subtle})`);
  lines.push(`- Text: ${colors.semantic.text.default} (muted: ${colors.semantic.text.muted})`);
  lines.push(`- Text auf Primary: ${colors.semantic.text.onPrimary}`);
  lines.push('');

  // Typography
  lines.push('## Typografie');
  lines.push(`- Heading-Font: ${typography.fonts.heading.family}`);
  lines.push(`- Body-Font: ${typography.fonts.body.family}`);
  lines.push(`- Basis-Schriftgröße: ${typography.scale.base}px`);
  lines.push(`- Scale-Ratio: ${typography.scale.ratio} (Major Third)`);
  lines.push(`- Heading Uppercase: ${typography.headingUppercase ? 'Ja' : 'Nein'}`);
  lines.push(`- Gewichte: Normal ${typography.fontWeights.normal}, Medium ${typography.fontWeights.medium}, Semibold ${typography.fontWeights.semibold}, Bold ${typography.fontWeights.bold}`);
  lines.push('');

  // Spacing
  lines.push('## Spacing');
  lines.push(`- Basis-Einheit: ${spacing.base}px`);
  lines.push(`- Container Max-Width: ${spacing.container}`);
  lines.push('');

  // Borders + Shadows
  lines.push('## Formen & Schatten');
  lines.push(`- Standard-Radius: ${borders.radius.default}`);
  lines.push(`- Border: ${borders.width} ${borders.color}`);
  lines.push(`- Schatten: sm/md/lg/xl verfügbar`);
  lines.push('');

  // Components
  lines.push('## Button-Stile');
  const btn = components.button.primary;
  lines.push(`- Primary: ${btn.background}, Text ${btn.color}, Radius ${btn.borderRadius}${btn.textTransform === 'uppercase' ? ', UPPERCASE' : ''}`);
  lines.push('');

  // Media
  if (media.imageStyle) {
    lines.push('## Bildsprache');
    lines.push(`- Stil: ${media.imageStyle}`);
    lines.push(`- Icons: ${media.iconStyle}`);
    lines.push('');
  }

  // Voice
  if (voice.description || voice.tone.length > 0) {
    lines.push('## Brand Voice');
    lines.push(`- Formalität: ${voice.formality}`);
    lines.push(`- Anrede: ${voice.address}`);
    if (voice.tone.length > 0) {
      lines.push(`- Tonalität: ${voice.tone.join(', ')}`);
    }
    if (voice.languages.length > 0) {
      lines.push(`- Sprachen: ${voice.languages.join(', ')}`);
    }
    if (voice.description) {
      lines.push(`- Beschreibung: ${voice.description}`);
    }
    if (voice.dos.length > 0) {
      lines.push(`- Dos: ${voice.dos.join('; ')}`);
    }
    if (voice.donts.length > 0) {
      lines.push(`- Don'ts: ${voice.donts.join('; ')}`);
    }
  }

  return lines.join('\n');
}
