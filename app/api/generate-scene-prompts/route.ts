import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { getServerEnv } from "@/lib/env";
import { requireAuthForRoute } from "@/lib/permissions";
import { logUsage } from "@/lib/usage";
import { AI_COSTS_EUR, AI_MODELS } from "@/lib/costs";
import type { ApiError } from "@/types/api";

// Request validation schema
const requestSchema = z.object({
  userPrompt: z.string().min(1, "Prompt erforderlich"),
  productType: z.string().optional(), // e.g., "Standlautsprecher", "Subwoofer"
  productBrand: z.string().optional(),
});

// Response schema for generated prompts
const generatedPromptsSchema = z.object({
  prompts: z.array(z.object({
    title: z.string(), // Short title like "Industrial Loft"
    prompt: z.string(), // Full optimized prompt
  })).length(3),
});

// System prompt for Claude - generates creative scene variations
const SCENE_GENERATOR_SYSTEM = `You are an expert interior design and architectural photography prompt engineer. Transform the user's scene idea into 3 creative, detailed variations for AI product photography.

**YOUR TASK:**
Take the user's input and create 3 distinctly different interpretations. Each should be a unique creative direction while staying true to the user's core idea.

**PROMPT STRUCTURE:**
Each prompt should describe:
1. Product placement in the scene (positioning in frame)
2. Specific materials and surfaces
3. Key design elements and furniture
4. Lighting conditions (time of day, light quality, mood)
5. View or background context

**VARIATION APPROACH:**
- Vary the lighting (morning vs evening, natural vs artificial)
- Vary the season or weather
- Vary the specific materials while keeping the style
- Vary the camera angle or framing
- Each variant should feel like a different photoshoot concept

**RULES:**
- Keep prompts 50-70 words
- Stay true to the user's original idea - don't force unrelated styles
- Be specific about materials and lighting
- Modern, high-quality aesthetic
- Focus on the environment - product placement is just the anchor

**OUTPUT FORMAT:**
Return exactly 3 prompts as JSON:
{
  "prompts": [
    {"title": "Short 2-3 word title", "prompt": "Full detailed prompt..."},
    {"title": "Short 2-3 word title", "prompt": "Full detailed prompt..."},
    {"title": "Short 2-3 word title", "prompt": "Full detailed prompt..."}
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    // Auth + tool permission check
    const auth = await requireAuthForRoute("generate-scene-prompts");
    if (auth.error) return auth.error;

    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      const error: ApiError = {
        error: "Validation Error",
        message: validationResult.error.issues.map((e) => e.message).join(", "),
        code: "VALIDATION_ERROR",
      };
      return NextResponse.json(error, { status: 400 });
    }

    const { userPrompt, productType, productBrand } = validationResult.data;

    // Check for mock mode
    if (process.env.NEXT_PUBLIC_MOCK_AI === "true") {
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json({
        prompts: [
          {
            title: "Morgenlicht",
            prompt: `Premium ${productType || 'product'} positioned in the scene, soft morning light streaming through large windows. Clean modern interior with warm wood tones, minimal furniture. Fresh, calm atmosphere with subtle shadows. Editorial photography style.`,
          },
          {
            title: "Abendstimmung",
            prompt: `Premium ${productType || 'product'} in an elegant evening setting, warm artificial lighting mixed with blue hour glow from windows. Contemporary furniture, sophisticated materials. Cozy yet refined atmosphere. Cinematic photography mood.`,
          },
          {
            title: "Klare Linien",
            prompt: `Premium ${productType || 'product'} in a bright, minimalist space with crisp natural daylight. White walls, concrete or light wood floors, geometric furniture pieces. Clean, architectural feel. Sharp focus, professional product photography.`,
          },
        ],
      });
    }

    const env = getServerEnv();
    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });

    // Build the user message
    const productContext = productType
      ? `The product is a ${productBrand ? `${productBrand} ` : ''}${productType}.`
      : '';

    const userMessage = `Create 3 creative variations of this scene idea: "${userPrompt}"

${productContext}

Stay true to the user's vision but vary the lighting, materials, time of day, or mood. Each should feel like a different photoshoot interpretation of the same concept.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      system: SCENE_GENERATOR_SYSTEM,
    });

    // Extract text content
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = generatedPromptsSchema.parse(parsed);

    // Log usage (fire-and-forget)
    logUsage({
      userId: auth.user.id,
      userEmail: auth.user.primaryEmail ?? "unknown",
      operation: "generate-scene-prompts",
      costEur: AI_COSTS_EUR["generate-scene-prompts"],
      model: AI_MODELS["generate-scene-prompts"],
    });

    return NextResponse.json(validated);
  } catch (error) {
    console.error("Generate scene prompts error:", error);

    const apiError: ApiError = {
      error: "Internal Server Error",
      message:
        error instanceof Error
          ? error.message
          : "Prompts konnten nicht generiert werden",
      code: "INTERNAL_ERROR",
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
