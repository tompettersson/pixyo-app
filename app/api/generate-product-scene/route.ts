import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI, PersonGeneration } from "@google/genai";
import { getServerEnv } from "@/lib/env";
import type { ApiError } from "@/types/api";

// Product Analysis schema (simplified)
const productAnalysisSchema = z.object({
  camera: z.object({
    focal_length: z.object({
      estimated_mm: z.number(),
      category: z.enum(["wide", "normal", "light_telephoto", "telephoto"]),
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
  }),
}).optional();

// Single product image schema
const productImageSchema = z.object({
  data: z.string(), // Base64 encoded image data
  mimeType: z.string(), // image/png, image/jpeg, image/webp
  label: z.string().optional(), // Optional label like "Frontal", "Seitlich"
});

// Request validation schema - supports 1-3 product images for multi-view
const requestSchema = z.object({
  // Support both single image (backward compatible) and multi-view array
  productImage: productImageSchema.optional(),
  productImages: z.array(productImageSchema).min(1).max(3).optional(),
  backgroundPrompt: z.string().min(1, "Hintergrund-Beschreibung erforderlich"),
  aspectRatio: z.enum(["1:1", "4:3", "16:9", "9:16"]).optional().default("1:1"),
  imageSize: z.enum(["1K", "2K", "4K"]).optional().default("2K"),
  // Product scale level: -2 (smaller) to +2 (larger), 0 = default
  productScaleLevel: z.number().min(-2).max(2).optional().default(0),
  // Optional reference image for style guidance
  referenceImage: z
    .object({
      data: z.string(), // Base64 encoded image data
      mimeType: z.string(), // image/png, image/jpeg, image/webp
    })
    .optional(),
  // Product analysis from AI (helps with intelligent placement)
  productAnalysis: productAnalysisSchema,
  // Floor plan from Raumplaner mode (2D room layout)
  floorPlanImage: z
    .object({
      data: z.string(), // Base64 encoded image data
      mimeType: z.string(), // image/png
    })
    .optional(),
  floorPlanDescription: z.string().optional(),
}).refine(
  (data) => data.productImage || (data.productImages && data.productImages.length > 0),
  { message: "Either productImage or productImages must be provided" }
);

// Type for normalized product images
type ProductImage = z.infer<typeof productImageSchema>;

// Map scale level to prompt parameters
function getScaleParameters(level: number): { framePercentage: string; sizeDescription: string } {
  const scaleMap: Record<number, { framePercentage: string; sizeDescription: string }> = {
    [-2]: { framePercentage: "15-25%", sizeDescription: "compact, appearing smaller in the scene" },
    [-1]: { framePercentage: "25-35%", sizeDescription: "moderately sized" },
    [0]: { framePercentage: "35-45%", sizeDescription: "naturally proportioned" },
    [1]: { framePercentage: "45-55%", sizeDescription: "prominent, taking up more space" },
    [2]: { framePercentage: "55-65%", sizeDescription: "large and dominant in the frame" },
  };
  return scaleMap[level] || scaleMap[0];
}

// =============================================================================
// MULTI-VIEW PROMPT GENERATION
// Dynamic prompt blocks based on number of product images (1-3)
// =============================================================================
function getMultiViewPromptBlock(images: ProductImage[], productType?: string): string {
  const productLabel = productType || "Produkt";
  const imageCount = images.length;

  if (imageCount === 1) {
    // Single image - standard behavior
    return `**Product Reference:**
Here is one image of the ${productLabel}. Use this reference to understand the product's appearance.`;
  }

  if (imageCount === 2) {
    // Two views - enhanced understanding
    const label1 = images[0].label || "First view";
    const label2 = images[1].label || "Second view";
    return `**Multi-View Product Reference (2 images):**
Here are 2 views of the same ${productLabel}:
- Image 1: ${label1}
- Image 2: ${label2}

Use BOTH views to fully understand the product's shape, proportions, and surface details.`;
  }

  // Three views - comprehensive 3D understanding
  const label1 = images[0].label || "First view";
  const label2 = images[1].label || "Second view";
  const label3 = images[2].label || "Third view";
  return `**Multi-View Product Reference (3 images):**
Here are 3 views of the same ${productLabel}:
- Image 1: ${label1}
- Image 2: ${label2}
- Image 3: ${label3}

Use ALL THREE views to fully capture the product's form, proportions, and surface details from multiple angles.`;
}

// Enhanced preservation prompt for multi-view scenarios
function getMultiViewPreservationPrompt(imageCount: number): string {
  if (imageCount <= 1) {
    return ""; // Standard preservation is enough for single image
  }

  return `
**Multi-View Advantage:**
Since you can see the product from ${imageCount} different angles, you have a complete understanding of its form and details. Use this knowledge to render the product EXACTLY as shown in the reference images - same proportions, same surfaces, same details. The multiple views give you certainty about how the product should look from any angle.`;
}

// =============================================================================
// SYSTEM PROMPT - Based on Google's official Gemini prompting guidelines
// Key principles: Narrative description, positive formulation, Markdown structure
// =============================================================================

// Mock response for development
function getMockResponse(): { image: { url: string }; prompt: string } {
  return {
    image: {
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80",
    },
    prompt: "Mock product scene",
  };
}

// =============================================================================
// VERTEX AI CLIENT FACTORY
// Creates a Vertex AI client if GOOGLE_CLOUD_PROJECT is configured
// =============================================================================
function getVertexAIClient(): GoogleGenAI | null {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "europe-west1";
  const apiKey = process.env.VERTEX_AI_API_KEY;

  if (!project) {
    console.log("Vertex AI not configured - using Gemini API fallback");
    return null;
  }

  if (!apiKey) {
    console.log("Vertex AI API key not configured - using Gemini API fallback");
    return null;
  }

  try {
    console.log(`Initializing Vertex AI client for project: ${project}, location: ${location}`);
    return new GoogleGenAI({
      vertexai: true,
      project,
      location,
      apiKey, // Vertex AI API key from Google Cloud Console
    });
  } catch (error) {
    console.error("Failed to create Vertex AI client:", error);
    return null;
  }
}

// =============================================================================
// VERTEX AI: imagen-product-recontext
// Specialized model for product background replacement with optimal fidelity
// =============================================================================
async function generateWithVertexAI(
  client: GoogleGenAI,
  productImageBase64: string,
  productImageMimeType: string,
  backgroundPrompt: string,
  _aspectRatio: string // Not directly supported by recontextImage API
): Promise<{ image: { url: string }; prompt: string; model: string }> {
  console.log("Using Vertex AI imagen-product-recontext model");

  const response = await client.models.recontextImage({
    model: "imagen-product-recontext-preview-06-30",
    source: {
      prompt: backgroundPrompt,
      productImages: [
        {
          productImage: {
            imageBytes: productImageBase64,
            mimeType: productImageMimeType,
          },
        },
      ],
    },
    config: {
      numberOfImages: 1,
      outputMimeType: "image/png",
      enhancePrompt: true, // Let Google optimize the prompt automatically
      personGeneration: PersonGeneration.ALLOW_ADULT,
      // Note: aspectRatio is not directly supported by recontextImage
      // The output aspect ratio depends on the product image
    },
  });

  const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;

  if (!imageBytes) {
    throw new Error("Vertex AI returned no image data");
  }

  return {
    image: { url: `data:image/png;base64,${imageBytes}` },
    prompt: backgroundPrompt,
    model: "imagen-product-recontext-preview-06-30",
  };
}

// Helper: Extract base64 image data from Gemini response
function extractImageFromResponse(result: Record<string, unknown>): { data: string; mimeType: string } | null {
  const candidates = result.candidates as Array<{ content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> } }> | undefined;
  if (candidates && candidates.length > 0) {
    const candidate = candidates[0];
    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
          return {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          };
        }
      }
    }
  }
  return null;
}

// NOTE: Feedback loop was removed - inconsistent results, doubled API costs
// If needed in future, see git history for the implementation

export async function POST(request: NextRequest) {
  try {
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

    const { productImage, productImages, backgroundPrompt, aspectRatio, imageSize, productScaleLevel, referenceImage, productAnalysis, floorPlanImage, floorPlanDescription } = validationResult.data;
    const scaleParams = getScaleParameters(productScaleLevel);

    // Normalize images: support both single productImage and productImages array
    const normalizedImages: ProductImage[] = productImages && productImages.length > 0
      ? productImages
      : productImage
        ? [productImage]
        : [];

    if (normalizedImages.length === 0) {
      throw new Error("No product images provided");
    }

    const imageCount = normalizedImages.length;
    const primaryImage = normalizedImages[0]; // First image is primary (used for Vertex AI)
    console.log(`Processing ${imageCount} product image(s)`);

    // Build product context - minimal, let user prompt define the scene
    let productContext = '';
    if (productAnalysis) {
      const { product, placement } = productAnalysis;
      const placementMap: Record<string, string> = {
        floor: 'on the floor',
        low_furniture: 'on low furniture',
        table_height: 'on a table',
        shelf: 'on a shelf',
        counter: 'on a counter',
        wall_mounted: 'mounted on a wall',
      };
      const placementHint = placementMap[placement.vertical_position] || 'naturally';

      productContext = `
**PRODUCT:** ${product.type_german}${product.brand && product.brand !== 'unknown' ? ` (${product.brand})` : ''}
**TYPICAL PLACEMENT:** ${placementHint}
`;
      console.log('Product:', product.type_german, 'placement:', placement.vertical_position);
    }

    // Check for mock mode or missing API key
    const isMockMode =
      process.env.NEXT_PUBLIC_MOCK_AI === "true" || !process.env.GOOGLE_API_KEY;

    if (isMockMode) {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 2000));
      return NextResponse.json(getMockResponse());
    }

    // =======================================================
    // TRY VERTEX AI FIRST (if configured)
    // imagen-product-recontext is optimized for product photos
    // =======================================================
    const vertexClient = getVertexAIClient();

    if (vertexClient) {
      try {
        // Vertex AI imagen-product-recontext supports multiple product images
        const result = await generateWithVertexAI(
          vertexClient,
          primaryImage.data,
          primaryImage.mimeType,
          backgroundPrompt,
          aspectRatio
        );
        console.log(`Successfully generated with ${result.model}`);
        return NextResponse.json({
          image: result.image,
          prompt: result.prompt,
        });
      } catch (vertexError) {
        console.error("Vertex AI failed, falling back to Gemini API:", vertexError);
        // Continue to Gemini API fallback below
      }
    }

    // =======================================================
    // FALLBACK: Gemini API (original implementation)
    // =======================================================
    const env = getServerEnv();
    const model = "gemini-3-pro-image-preview";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GOOGLE_API_KEY}`;
    console.log("Using Gemini API fallback");

    // =================================================================
    // PROMPT CONSTRUCTION - Based on Research Documents:
    // 1. product-scene-prompting-research.md (identity preservation)
    // 2. photorealism-prompting-guide.md (photography language)
    //
    // Key principles:
    // - Narrative descriptions, not keyword lists
    // - Positive formulations (avoid negations)
    // - Specific camera/lens terminology for authenticity
    // - Natural imperfections for realism
    // - AVOID: "hyperrealistic", "ultra-detailed", "perfect"
    // =================================================================
    const referenceStyleNote = referenceImage
      ? `\n**Style Reference:**\nThe additional reference image shows the desired lighting mood and color palette for the environment.`
      : "";

    // Floor plan context - 2D room layout for precise positioning
    // Prefer image + description, but text-only also works as fallback
    const floorPlanNote = floorPlanImage && floorPlanDescription
      ? `\n**Room Layout Reference (IMPORTANT):**
A floor plan image is provided showing the room layout from above (bird's eye view).
${floorPlanDescription}

Use this floor plan to understand:
- Where furniture is positioned in the room
- Where the product should be placed relative to other elements
- The overall room proportions and spatial relationships
- Window/door positions for natural lighting direction

Render the scene as if viewing from a natural camera position that matches this layout. The floor plan shows the TOP-DOWN view - translate this to a natural eye-level or slightly elevated perspective photograph while maintaining the relative positions of all elements.`
      : floorPlanDescription
        ? `\n**Room Layout Description:**
${floorPlanDescription}

Use this description to understand the room layout and position the product accordingly.`
        : "";

    // Get multi-view prompt blocks if multiple images provided
    const multiViewBlock = getMultiViewPromptBlock(normalizedImages, productAnalysis?.product?.type_german);
    const multiViewPreservation = getMultiViewPreservationPrompt(imageCount);

    // Derive focal length from product analysis if available
    const focalLength = productAnalysis?.camera?.focal_length?.estimated_mm || 50;
    const apertureForScene = focalLength > 70 ? "f/4" : "f/5.6"; // Telephoto = wider aperture for bokeh

    // Photography-first prompt structure
    const fullPrompt = `A professional product photograph captured with a Canon EOS R5, ${focalLength}mm lens at ${apertureForScene}.

${multiViewBlock}

**Scene Description:**
${backgroundPrompt}

**Subject Placement:**
- The exact product from the provided ${imageCount > 1 ? 'reference images' : 'image'}
- Positioned naturally within the scene, grounded with realistic contact shadow
${productContext}

**Product Identity (CRITICAL - must match reference exactly):**
This may be a new or unreleased product. Do NOT use your prior knowledge of the brand's other products. Rely ONLY on the provided reference ${imageCount > 1 ? 'images' : 'image'} for all product details.

The product in the output is identical to the input ${imageCount > 1 ? 'images' : 'image'}:
- Same viewing angle and perspective (camera position unchanged)
- Colors, materials, and surface textures match exactly
- Shape, proportions, and silhouette preserved perfectly
- All surface details, markings, and branding exactly as shown in reference
- Fine details like buttons, ports, seams, edges remain identical
${multiViewPreservation}

**Photography Style:**
- Shot with ${focalLength}mm prime lens, natural perspective
- Product fills approximately ${scaleParams.framePercentage} of the frame, ${scaleParams.sizeDescription}
- Shallow depth of field: product in sharp focus, background with gentle blur
- Natural texture and subtle micro-detail on surfaces
- Soft shadows with natural falloff, not harsh or artificial

**Lighting:**
- Soft, diffused natural light or professional softbox setup
- Ambient lighting harmonizes product with the environment
- Subtle rim light or edge definition where appropriate
- Controlled highlight reflections, not overblown

**Composition:**
- [Foreground]: Subtle contextual elements, slightly out of focus
- [Midground]: The exact product from the input, in sharp focus
- [Background]: Scene environment with depth of field blur
${referenceStyleNote}

**Output Style:**
This is a background replacement task for e-commerce. The product stays exactly as shown in the reference ${imageCount > 1 ? 'images' : 'image'} - same angle, same details, same surface markings. Only the background changes. Generate a candid, natural-looking product photograph with realistic shadows and natural color temperature. Avoid over-processed or CGI appearance.
${floorPlanNote}`;

    // Build parts array - text first, then ALL product images, then optional reference image
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
      { text: fullPrompt },
    ];

    // Add all product images (supports 1-3 images for multi-view)
    for (const img of normalizedImages) {
      parts.push({
        inline_data: {
          mime_type: img.mimeType,
          data: img.data,
        },
      });
    }
    console.log(`Added ${normalizedImages.length} product image(s) to request`);

    // Add reference image if provided
    if (referenceImage) {
      parts.push({
        inline_data: {
          mime_type: referenceImage.mimeType,
          data: referenceImage.data,
        },
      });
      console.log("Added reference image to request");
    }

    // Add floor plan image if provided (now works because product images are compressed)
    // The text description is already in the prompt via floorPlanNote
    if (floorPlanImage) {
      parts.push({
        inline_data: {
          mime_type: floorPlanImage.mimeType,
          data: floorPlanImage.data,
        },
      });
      console.log("Added floor plan image to request");
    }

    // Build the request with images
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
          imageSize: imageSize, // 1K, 2K, or 4K - user selectable
        },
      },
    };

    // =======================================================
    // Generate Scene (single pass, no feedback loop)
    // Feedback loop was removed: inconsistent results, doubles cost
    // =======================================================
    console.log(`Generating scene in ${imageSize}...`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const generatedImage = extractImageFromResponse(result);

    if (!generatedImage) {
      console.warn("No image generated", JSON.stringify(result, null, 2));
      if (result.candidates?.[0]?.finishReason === "SAFETY") {
        throw new Error("Bild konnte aus Sicherheitsgründen nicht generiert werden.");
      }
      throw new Error("Keine Bilddaten in der Antwort erhalten");
    }

    const finalImageUrl = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
    console.log("Scene generated successfully");

    return NextResponse.json({
      image: { url: finalImageUrl },
      prompt: backgroundPrompt,
    });
  } catch (error) {
    console.error("Generate product scene error:", error);

    const apiError: ApiError = {
      error: "Internal Server Error",
      message:
        error instanceof Error
          ? error.message
          : "Szene konnte nicht generiert werden",
      code: "INTERNAL_ERROR",
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
