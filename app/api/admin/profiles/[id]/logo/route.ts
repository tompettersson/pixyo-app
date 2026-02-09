import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { isAdmin, type UserServerMetadata } from "@/lib/permissions";
import {
  logoUploadSchema,
  processLogoUpload,
  deleteProfileLogo,
  LogoError,
  type LogoUploadResponse,
} from "@/lib/api/logo-helpers";

/**
 * POST /api/admin/profiles/[id]/logo
 * Upload SVG logo (admin only, no ownership check)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<LogoUploadResponse | { error: string; details?: unknown }>> {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: profileId } = await params;

    // Find profile without ownership check
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = logoUploadSchema.parse(body);

    const result = await processLogoUpload(profileId, validatedData.svgData, profile);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof LogoError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Failed to upload logo:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/profiles/[id]/logo
 * Remove logo (admin only, no ownership check)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: profileId } = await params;

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await deleteProfileLogo(profileId, profile);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 }
    );
  }
}
