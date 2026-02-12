import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuthForRoute } from '@/lib/permissions';
import { logUsage } from '@/lib/usage';
import { AI_COSTS_EUR, AI_MODELS } from '@/lib/costs';
import { getServerEnv } from '@/lib/env';

const requestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  currentTokens: z.any().optional(),
});

const SYSTEM_PROMPT = `Du bist ein Design-System-Experte. Der Benutzer beschreibt eine Marke oder einen Stil, und du generierst passende Design Tokens.

WICHTIG: Antworte NUR mit einem validen JSON-Objekt, keine Erklärungen. Das JSON muss ein partielles DesignTokens-Objekt sein — nur die Felder die sich vom Default unterscheiden.

Die Tokens-Struktur hat folgende Bereiche:
- colors.palette: Record<string, hex> — benannte Farben (primary, secondary, accent, neutral, white, black)
- colors.semantic: { primary, secondary, accent, background: {default, subtle, inverse}, text: {default, muted, inverse, onPrimary}, status: {success, warning, error, info}, border: {default, subtle} }
- typography.fonts: { heading: {family, fallback}, body: {family, fallback} } — nur Google Fonts verwenden
- typography.scale: { base: number(px), ratio: number(1.1-1.5) }
- typography.fontWeights: { normal, medium, semibold, bold } — Zahlen 300-900
- typography.headingUppercase: boolean
- spacing.base: number(2-8px)
- borders.radius.default: string(px)
- components.button.primary: { background, color, border, borderRadius, fontWeight, textTransform: 'none'|'uppercase', paddingX, paddingY }
- voice: { formality: 'formal'|'neutral'|'casual', tone: string[], address: 'du'|'Sie'|'ihr', languages: string[], description: string }

Design-Regeln:
1. Farben müssen harmonisch sein — verwende Komplementär- oder Analogie-Harmonien
2. Kontrast für Lesbarkeit sicherstellen (Text auf Hintergrund)
3. Button-Hintergrund muss mit Text darauf lesbar sein
4. Max 2 Font-Familien (Heading + Body), nur bekannte Google Fonts
5. Wenn der Benutzer eine Branche nennt, passe Tonalität und Bildsprache an`;

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthForRoute('brand-design-generate');
    if (auth.error) return auth.error;

    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validationResult.error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { prompt, currentTokens } = validationResult.data;
    const env = getServerEnv();

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const userMessage = currentTokens
      ? `Aktuelle Tokens (als Kontext):\n${JSON.stringify(currentTokens, null, 2)}\n\nAnweisung: ${prompt}`
      : prompt;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract text from response
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON from response (may be wrapped in markdown code block)
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const tokens = JSON.parse(jsonStr);

    // Log usage
    logUsage({
      userId: auth.user.id,
      userEmail: auth.user.primaryEmail ?? 'unknown',
      operation: 'brand-design-generate',
      costEur: AI_COSTS_EUR['brand-design-generate'],
      model: AI_MODELS['brand-design-generate'],
    });

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Brand design generate error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to generate design tokens',
      },
      { status: 500 }
    );
  }
}
