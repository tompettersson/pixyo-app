import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { getServerEnv } from '@/lib/env';
import { requireAuthForRoute } from '@/lib/permissions';
import { logUsage } from '@/lib/usage';
import { AI_COSTS_EUR, AI_MODELS } from '@/lib/costs';

// Request validation schema
const requestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  customerName: z.string().optional(),
  systemPrompt: z.string().optional(),
});

// Response type for generated text
interface GeneratedText {
  tagline: string;
  headline: string;
  body: string;
}

// System prompt for Claude - defines the rules for generating social media text
const SYSTEM_PROMPT = `Du bist ein erfahrener Social Media Texter für deutsche Marken.

Deine Aufgabe ist es, aus einem kurzen Briefing drei Textelemente für eine Social Media Grafik zu erstellen:

1. **Tagline** (2-4 Wörter): Ein kurzer, prägnanter Aufhänger in GROSSBUCHSTABEN. Beispiele: "JETZT NEU", "LIMITED EDITION", "SOMMER SALE".

2. **Headline** (3-8 Wörter): Die Hauptüberschrift, die Aufmerksamkeit erregt und das Kernthema vermittelt.

3. **Body** (1-2 Sätze, max. 100 Zeichen): Ein kurzer Fließtext, der die Botschaft verstärkt und zum Handeln motiviert.

WICHTIGE REGELN:
- Schreibe auf Deutsch
- Halte dich an die Zeichenlimits
- Sei prägnant und werbewirksam
- Vermeide Floskeln und Füllwörter
- Die Texte sollen zusammen eine Story erzählen

AUSGABEFORMAT:
Antworte ausschließlich als valides JSON-Objekt mit diesem Format:
{
  "tagline": "DEINE TAGLINE",
  "headline": "Deine Headline",
  "body": "Dein Body-Text hier."
}`;

// Get mock response for development
function getMockResponse(prompt: string): GeneratedText {
  return {
    tagline: 'JETZT ENTDECKEN',
    headline: 'Die neue Kollektion ist da',
    body: 'Entdecke jetzt unsere neuesten Highlights und lass dich inspirieren.',
  };
}

export async function POST(request: NextRequest) {
  try {
    // Auth + tool permission check
    const auth = await requireAuthForRoute('generate-text');
    if (auth.error) return auth.error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: validationResult.error.issues.map((e) => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { prompt, customerName, systemPrompt: customerSystemPrompt } = validationResult.data;

    // Check for mock mode or missing API key
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_AI === 'true' || !process.env.ANTHROPIC_API_KEY;

    if (isMockMode) {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(getMockResponse(prompt));
    }

    const env = getServerEnv();
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    // Build user message
    const userMessage = `Erstelle Social Media Texte für folgendes Briefing:

${customerName ? `Marke: ${customerName}` : ''}
${customerSystemPrompt ? `Markenstil: ${customerSystemPrompt}` : ''}

Briefing: ${prompt}

Generiere jetzt die Texte als JSON.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    // Parse JSON response
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]) as GeneratedText;

      // Validate required fields
      if (!parsedResponse.tagline || !parsedResponse.headline || !parsedResponse.body) {
        throw new Error('Missing required fields in response');
      }

      // Log usage (fire-and-forget)
      logUsage({
        userId: auth.user.id,
        userEmail: auth.user.primaryEmail ?? 'unknown',
        operation: 'generate-text',
        costEur: AI_COSTS_EUR['generate-text'],
        model: AI_MODELS['generate-text'],
      });

      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      // Return mock response as fallback
      return NextResponse.json(getMockResponse(prompt));
    }
  } catch (error) {
    console.error('Generate text error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to generate text',
      },
      { status: 500 }
    );
  }
}
