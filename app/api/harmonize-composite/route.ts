import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { requireAuthForRoute } from "@/lib/permissions";
import { logUsage } from "@/lib/usage";
import { AI_COSTS_EUR, AI_MODELS } from "@/lib/costs";
import type { ApiError } from "@/types/api";

// Request validation schema
const requestSchema = z.object({
  // The composite image (product + background combined)
  compositeImage: z.object({
    data: z.string(), // Base64 encoded image data
    mimeType: z.string(),
  }),
  aspectRatio: z.enum(["1:1", "4:3", "16:9", "9:16"]).optional().default("1:1"),
});

// Harmonization prompt - ONLY color, shadows, reflections - NO perspective change
const HARMONIZE_PROMPT = `You are looking at a composite image where a product has been placed on a generated background.

Your task is to HARMONIZE the colors, shadows, and reflections ONLY.

**WHAT YOU MUST DO:**

1. **COLOR INTEGRATION:**
   - Match the product's color temperature to the environment's lighting
   - Adjust highlights and shadows on the product to match the scene's light direction
   - Subtle color grading to unify product and background

2. **SHADOWS & GROUNDING:**
   - Add or enhance a natural contact shadow beneath the product
   - The shadow direction must match the scene's lighting
   - Soft, realistic shadow that grounds the product in the space

3. **REFLECTIONS (if surface is reflective):**
   - Add subtle product reflection on reflective surfaces (wood, marble, glass)
   - Match reflection intensity to the surface material

**ABSOLUTE CONSTRAINTS - DO NOT VIOLATE:**

- **CAMERA PERSPECTIVE STAYS EXACTLY THE SAME** - Do not change the viewing angle
- If the product was photographed from the front, it stays front-facing
- If it was photographed straight-on, it stays straight-on
- **NO rotation, NO tilting, NO perspective shift**
- The product's position in the frame stays exactly where it is
- Product shape, proportions, logos, text remain PIXEL-IDENTICAL
- Only colors, shadows, and reflections may be adjusted

**FORBIDDEN:**
- Changing the camera angle or perspective
- Moving or repositioning the product
- Altering the product's shape or proportions
- Modifying logos, text, or brand elements

Output the same image with improved color harmony, realistic shadows, and reflections - but with IDENTICAL perspective and product placement.`;

// Mock response for development
function getMockResponse(): { image: { url: string } } {
  return {
    image: {
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80",
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Auth + tool permission check
    const auth = await requireAuthForRoute("harmonize-composite");
    if (auth.error) return auth.error;

    // Parse and validate request body
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

    const { compositeImage, aspectRatio } = validationResult.data;

    // Check for mock mode or missing API key
    const isMockMode =
      process.env.NEXT_PUBLIC_MOCK_AI === "true" || !process.env.GOOGLE_API_KEY;

    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 2000));
      return NextResponse.json(getMockResponse());
    }

    const env = getServerEnv();
    const model = "gemini-3-pro-image-preview";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GOOGLE_API_KEY}`;

    console.log("Harmonizing composite image...");

    // Build the request
    const requestBody = {
      contents: [
        {
          parts: [
            { text: HARMONIZE_PROMPT },
            {
              inline_data: {
                mime_type: compositeImage.mimeType,
                data: compositeImage.data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "2K", // High quality output
        },
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Harmonize API error:", response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    // Extract image from response
    let imageUrl: string | null = null;

    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];

      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (
            part.inlineData &&
            part.inlineData.mimeType?.startsWith("image/")
          ) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            imageUrl = `data:${mimeType};base64,${base64Data}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      console.warn("No image from harmonize:", JSON.stringify(result, null, 2));
      if (result.candidates?.[0]?.finishReason === "SAFETY") {
        throw new Error("Bild konnte aus Sicherheitsgründen nicht verarbeitet werden.");
      }
      throw new Error("Keine Bilddaten in der Antwort erhalten");
    }

    console.log("Harmonization complete");

    // Log usage (fire-and-forget)
    logUsage({
      userId: auth.user.id,
      userEmail: auth.user.primaryEmail ?? "unknown",
      operation: "harmonize-composite",
      costEur: AI_COSTS_EUR["harmonize-composite"],
      model: AI_MODELS["harmonize-composite"],
    });

    return NextResponse.json({
      image: { url: imageUrl },
    });
  } catch (error) {
    console.error("Harmonize composite error:", error);

    const apiError: ApiError = {
      error: "Internal Server Error",
      message:
        error instanceof Error
          ? error.message
          : "Harmonisierung fehlgeschlagen",
      code: "INTERNAL_ERROR",
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
