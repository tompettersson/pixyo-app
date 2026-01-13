import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage } from "@/lib/ai/gemini";
import type { GenerateImageRequest, ApiError } from "@/types/api";

// Request validation schema
const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  mode: z.enum(["photo", "illustration"]).optional().default("photo"),
  aspectRatio: z.enum(["1:1", "4:5", "16:9", "9:16"]).optional(),
  variationSeed: z.number().optional(),
  // Product image for Image-to-Image generation
  productImage: z
    .object({
      data: z.string(), // Base64 encoded image
      mimeType: z.string(), // image/png, image/jpeg, image/webp
    })
    .optional(),
});

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

    const imageRequest: GenerateImageRequest = validationResult.data;

    // Generate image using Gemini
    const response = await generateImage(imageRequest);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Generate image error:", error);

    const apiError: ApiError = {
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "Failed to generate image",
      code: "INTERNAL_ERROR",
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
