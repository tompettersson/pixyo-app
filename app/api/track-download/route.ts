import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import type { ApiError } from "@/types/api";

const requestSchema = z.object({
  generationLogId: z.string().min(1, "generationLogId is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Nicht angemeldet", code: "UNAUTHORIZED" } satisfies ApiError,
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: validationResult.error.issues.map((e) => e.message).join(", "),
          code: "VALIDATION_ERROR",
        } satisfies ApiError,
        { status: 400 }
      );
    }

    const { generationLogId } = validationResult.data;

    // Update GenerationLog — only if it belongs to the current user
    const updated = await prisma.generationLog.updateMany({
      where: {
        id: generationLogId,
        userId: user.id,
        downloaded: false, // Idempotent: only update if not already downloaded
      },
      data: {
        downloaded: true,
        downloadedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, updated: updated.count });
  } catch (error) {
    console.error("Track download error:", error);

    const apiError: ApiError = {
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Tracking fehlgeschlagen",
      code: "INTERNAL_ERROR",
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
