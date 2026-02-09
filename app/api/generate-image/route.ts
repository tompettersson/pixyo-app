import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage } from "@/lib/ai/gemini";
import { requireAuthForRoute } from "@/lib/permissions";
import { logUsage } from "@/lib/usage";
import { prisma } from "@/lib/db";
import { AI_COSTS_EUR, AI_MODELS } from "@/lib/costs";
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
  // Prompt source for generation tracking
  promptSource: z.enum(["ai-improved", "user-direct"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth + tool permission check
    const auth = await requireAuthForRoute("generate-image");
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

    const { promptSource, ...imageRequestData } = validationResult.data;
    const imageRequest: GenerateImageRequest = imageRequestData;

    // Generate image using Gemini
    const response = await generateImage(imageRequest);

    // Log usage (fire-and-forget)
    logUsage({
      userId: auth.user.id,
      userEmail: auth.user.primaryEmail ?? "unknown",
      operation: "generate-image",
      costEur: AI_COSTS_EUR["generate-image"],
      model: AI_MODELS["generate-image"],
    });

    // Log generation for prompt tracking (fire-and-forget, but capture ID)
    let generationLogId: string | undefined;
    try {
      const generationLog = await prisma.generationLog.create({
        data: {
          userId: auth.user.id,
          tool: "social-graphics",
          prompt: imageRequest.prompt,
          promptSource: promptSource ?? "user-direct",
          meta: {
            mode: imageRequest.mode,
            aspectRatio: imageRequest.aspectRatio,
          },
        },
      });
      generationLogId = generationLog.id;
    } catch (err) {
      console.error("Failed to create GenerationLog:", err);
    }

    return NextResponse.json({ ...response, generationLogId });
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
