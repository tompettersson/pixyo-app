import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { requireAuthForRoute } from "@/lib/permissions";
import { logUsage } from "@/lib/usage";
import { AI_COSTS_EUR, AI_MODELS } from "@/lib/costs";
import type { ApiError } from "@/types/api";

// Product Analysis schema (from analyze-product API) - SIMPLIFIED
const productAnalysisSchema = z.object({
  analysis_version: z.string(),
  confidence_overall: z.enum(["low", "medium", "high"]),
  camera: z.object({
    focal_length: z.object({
      estimated_mm: z.number(),
      category: z.enum(["wide", "normal", "light_telephoto", "telephoto"]),
      confidence: z.enum(["low", "medium", "high"]),
    }),
  }),
  product: z.object({
    category: z.string(),
    type: z.string(),
    type_german: z.string(),
    brand: z.string().optional(),
  }),
  placement: z.object({
    vertical_position: z.enum(["floor", "low_furniture", "table_height", "shelf", "counter", "wall_mounted"]),
    surface_type: z.string(),
  }),
  environment: z.object({
    primary_rooms: z.array(z.string()),
    primary_rooms_german: z.array(z.string()),
    outdoor_suitable: z.boolean(),
  }),
}).optional();

// Request validation schema
const requestSchema = z.object({
  backgroundPrompt: z.string().min(1, "Hintergrund-Beschreibung erforderlich"),
  aspectRatio: z.enum(["1:1", "4:3", "16:9", "9:16"]).optional().default("1:1"),
  // Lens type - should match the product photo's perspective
  lensType: z.enum(["wide", "normal", "tele"]).optional().default("normal"),
  // Layout image - product on neutral background showing EXACT position
  // This is the preferred way to communicate positioning to the AI
  layoutImage: z
    .object({
      data: z.string(), // Base64 encoded image data
      mimeType: z.string(),
    })
    .optional(),
  // Product image - fallback if no layout image
  productImage: z
    .object({
      data: z.string(), // Base64 encoded image data
      mimeType: z.string(), // image/png, image/webp with transparency
    })
    .optional(),
  // Optional reference image for style guidance
  referenceImage: z
    .object({
      data: z.string(), // Base64 encoded image data
      mimeType: z.string(), // image/png, image/jpeg, image/webp
    })
    .optional(),
  // Product placement hint (where product will be placed)
  productPlacement: z
    .object({
      x: z.number().min(0).max(1), // Relative position 0-1
      y: z.number().min(0).max(1),
      scale: z.number().min(0.1).max(1), // Relative size
    })
    .optional(),
  // Product analysis from AI (optional, enhances generation)
  productAnalysis: productAnalysisSchema,
});

// Lens type to prompt description mapping
const LENS_DESCRIPTIONS: Record<string, string> = {
  wide: "Shot with a wide-angle lens (24-35mm equivalent). Dramatic perspective, slightly curved lines at edges, expansive feel. Creates depth and drama.",
  normal: "Shot with a standard lens (50mm equivalent). Natural perspective matching human vision, straight lines, no distortion. Clean and neutral.",
  tele: "Shot with a telephoto lens (85-135mm equivalent). Compressed perspective, very straight parallel lines, flattened depth. Professional product photography style.",
};

// System prompt for background generation
// FOCUS: Generate background with MATCHING PERSPECTIVE to the product
const BACKGROUND_SYSTEM_PROMPT = `Generate a background scene for product photography compositing.

CRITICAL - ANALYZE THE PRODUCT'S PERSPECTIVE FIRST:
Look at the product image carefully and determine:
1. What is the CAMERA HEIGHT? (Is the camera looking up at the product, straight on, or down?)
2. What is the HORIZONTAL ANGLE? (Front view, 3/4 view from left/right?)
3. Where would the HORIZON LINE be if the product was in a real room?

YOUR TASK:
Generate ONLY the background/environment - NO product in the output.
The background perspective MUST MATCH the product's perspective exactly.

PERSPECTIVE MATCHING RULES:
- If the product shows a slight low angle (you can see under it slightly): Generate a room where the camera is at LOW HEIGHT (near floor level, looking slightly up)
- If the product shows a 3/4 view from the left: The room must also be viewed from that same angle
- The HORIZON LINE in the background must match where it would be based on the product's camera height

LEAVE EMPTY SPACE:
- Leave clear floor/surface space where the product will be composited
- Do NOT place furniture, objects, or decorations where the product will go
- The product in the reference shows exactly where it will be positioned

OUTPUT:
- Photorealistic interior scene
- Professional soft lighting
- DSLR quality
- Empty space where product will be placed
- Perspective that EXACTLY matches the product photo's camera angle`;

// Mock response for development
function getMockResponse(): { image: { url: string }; prompt: string } {
  return {
    image: {
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80",
    },
    prompt: "Mock background",
  };
}

export async function POST(request: NextRequest) {
  try {
    // Auth + tool permission check
    const auth = await requireAuthForRoute("generate-background");
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

    const { backgroundPrompt, aspectRatio, lensType, layoutImage, productImage, referenceImage, productPlacement, productAnalysis } =
      validationResult.data;

    // Get lens description - prefer analysis data if available
    const effectiveLensType = productAnalysis?.camera.focal_length.category === 'wide' ? 'wide'
      : productAnalysis?.camera.focal_length.category === 'telephoto' || productAnalysis?.camera.focal_length.category === 'light_telephoto' ? 'tele'
      : lensType;
    const lensDescription = LENS_DESCRIPTIONS[effectiveLensType] || LENS_DESCRIPTIONS.normal;

    // Build minimal analysis context - let the AI derive most from the layout image
    let analysisContext = '';
    if (productAnalysis) {
      const { camera, product } = productAnalysis;
      // Only pass essential info - the layout image shows everything else
      analysisContext = `
**PRODUCT INFO:**
- Type: ${product.type_german}${product.brand && product.brand !== 'unknown' ? ` (${product.brand})` : ''}
- Lens used for product photo: ~${camera.focal_length.estimated_mm}mm

The layout image shows you EXACTLY how the product looks and where it's positioned.
Match the background perspective to the product's perspective visible in the image.
`;
      console.log('Using simplified analysis: lens', camera.focal_length.estimated_mm, 'mm, product:', product.type_german);
    }

    // Check for mock mode or missing API key
    const isMockMode =
      process.env.NEXT_PUBLIC_MOCK_AI === "true" || !process.env.GOOGLE_API_KEY;

    if (isMockMode) {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 2000));
      return NextResponse.json(getMockResponse());
    }

    const env = getServerEnv();
    const model = "gemini-3-pro-image-preview";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GOOGLE_API_KEY}`;

    // Determine which positioning method we're using
    const hasLayoutImage = !!layoutImage;
    const hasProductImage = !!productImage;

    // Build the prompt based on what we have
    let fullPrompt: string;

    if (hasLayoutImage) {
      // BEST CASE: Layout image shows exact product position on neutral background
      console.log("Using layout image for precise positioning, lens:", effectiveLensType);
      fullPrompt = `${BACKGROUND_SYSTEM_PROMPT}
${analysisContext}
**STEP 1 - ANALYZE THE PRODUCT'S CAMERA ANGLE:**
Look at the product in the image. Determine:
- Is the camera BELOW the product (looking up)? → You see the underside/base
- Is the camera AT EYE LEVEL? → You see it straight on
- Is the camera ABOVE? → You see the top surface

For this product, the camera appears to be at LOW HEIGHT (you can see the base/feet of the product).
This means the room's horizon line should be LOW (near the bottom third of the image).

**STEP 2 - GENERATE MATCHING BACKGROUND:**
Generate a room scene where:
- The CAMERA HEIGHT matches the product photo (low camera position)
- The HORIZON LINE is in the same position as implied by the product
- A ${productAnalysis?.product?.type_german || 'product'} would naturally stand here

**LENS:** ${lensDescription}

**SCENE:** ${backgroundPrompt}

**CRITICAL RULES:**
1. NO PRODUCT in the output - only the environment
2. Leave EMPTY FLOOR SPACE where the product is positioned in the reference
3. The room's perspective MUST match the product's perspective
4. If the product is viewed from a low angle, the room must also be viewed from a low angle
5. Floor should be visible, extending from bottom of frame
6. Realistic scale - imagine where a ~40cm tall speaker would fit naturally

Output: Photorealistic room background, low camera angle, empty floor space for product placement.`;
    } else if (hasProductImage) {
      // FALLBACK: Product image only, use placement coordinates
      console.log("Using product image with placement coordinates, lens:", effectiveLensType);
      const placementHint = productPlacement
        ? `The product will be positioned at approximately ${Math.round(productPlacement.x * 100)}% horizontal and ${Math.round(productPlacement.y * 100)}% vertical, taking up about ${Math.round(productPlacement.scale * 100)}% of the frame.`
        : "The product will be placed in the lower-center area of the image.";

      fullPrompt = `${BACKGROUND_SYSTEM_PROMPT}
${analysisContext}
**CAMERA/LENS:**
${lensDescription}

**PRODUCT REFERENCE (Image 1):**
The attached image shows the product that will be composited into this scene.
Analyze its shape, size, and proportions.

**PLACEMENT:** ${placementHint}

**SCENE TO GENERATE:**
${backgroundPrompt}

You MUST leave empty space where this product can be naturally placed.
Do NOT include any product in the generated image - only the background.`;
    } else {
      // NO PRODUCT: Just generate background with general space
      fullPrompt = `${BACKGROUND_SYSTEM_PROMPT}
${analysisContext}
**CAMERA/LENS:**
${lensDescription}

**SCENE TO GENERATE:**
${backgroundPrompt}

Leave clear space in the center-bottom area for a product to be placed later.
Do NOT include any product placeholder - just the environment.`;
    }

    // Add style reference instruction if provided
    if (referenceImage) {
      fullPrompt += "\n\n**STYLE REFERENCE (additional image):** Match the atmosphere, color palette, and lighting mood from the style reference image.";
    }

    // Build parts array
    const parts: Array<
      { text: string } | { inline_data: { mime_type: string; data: string } }
    > = [{ text: fullPrompt }];

    // Add layout image OR product image (layout preferred)
    if (layoutImage) {
      parts.push({
        inline_data: {
          mime_type: layoutImage.mimeType,
          data: layoutImage.data,
        },
      });
    } else if (productImage) {
      parts.push({
        inline_data: {
          mime_type: productImage.mimeType,
          data: productImage.data,
        },
      });
    }

    // Add style reference image if provided
    if (referenceImage) {
      parts.push({
        inline_data: {
          mime_type: referenceImage.mimeType,
          data: referenceImage.data,
        },
      });
    }

    // Build the request
    const requestBody = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "2K", // 2K for testing, 4K for production
        },
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Imagen API error:", response.status, errorText);
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
            part.inlineData.mimeType &&
            part.inlineData.mimeType.startsWith("image/")
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
      console.warn(
        "No image generated, response:",
        JSON.stringify(result, null, 2)
      );
      if (result.candidates?.[0]?.finishReason === "SAFETY") {
        throw new Error(
          "Bild konnte aus Sicherheitsgründen nicht generiert werden. Bitte versuche eine andere Beschreibung."
        );
      }
      throw new Error("Keine Bilddaten in der Antwort erhalten");
    }

    // Log usage (fire-and-forget)
    logUsage({
      userId: auth.user.id,
      userEmail: auth.user.primaryEmail ?? "unknown",
      operation: "generate-background",
      costEur: AI_COSTS_EUR["generate-background"],
      model: AI_MODELS["generate-background"],
    });

    return NextResponse.json({
      image: { url: imageUrl },
      prompt: backgroundPrompt,
    });
  } catch (error) {
    console.error("Generate background error:", error);

    const apiError: ApiError = {
      error: "Internal Server Error",
      message:
        error instanceof Error
          ? error.message
          : "Hintergrund konnte nicht generiert werden",
      code: "INTERNAL_ERROR",
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
