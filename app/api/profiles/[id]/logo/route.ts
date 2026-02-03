import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { put, del } from "@vercel/blob";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { colorizeSvg, sanitizeSvg, isValidSvg } from "@/lib/svg/colorize";

// Maximum file size: 500KB
const MAX_FILE_SIZE = 500 * 1024;

// Schema for logo upload
const logoUploadSchema = z.object({
  svgData: z.string().min(1, "SVG data is required"),
  filename: z.string().optional(),
});

// Response type
interface LogoUploadResponse {
  logo: string;
  logoVariants: {
    dark: string;
    light: string;
  };
}

/**
 * POST /api/profiles/[id]/logo
 * Upload an SVG logo and generate colorized variants
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<LogoUploadResponse | { error: string; details?: unknown }>> {
  try {
    // Authenticate user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: profileId } = await params;

    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
      where: { id: profileId, userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = logoUploadSchema.parse(body);

    // Decode base64 if provided
    let svgContent = validatedData.svgData;
    if (svgContent.startsWith("data:")) {
      // Extract base64 content from data URL
      const base64Match = svgContent.match(/base64,(.+)$/);
      if (base64Match) {
        svgContent = Buffer.from(base64Match[1], "base64").toString("utf-8");
      }
    }

    // Check file size
    const contentSize = Buffer.byteLength(svgContent, "utf-8");
    if (contentSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024}KB` },
        { status: 400 }
      );
    }

    // Validate SVG structure
    if (!isValidSvg(svgContent)) {
      return NextResponse.json(
        { error: "Invalid SVG file format" },
        { status: 400 }
      );
    }

    // Sanitize SVG (remove scripts, event handlers, etc.)
    const sanitizedSvg = sanitizeSvg(svgContent);

    // Generate colorized variants
    const variants = colorizeSvg(sanitizedSvg);

    // Delete old logo files if they exist
    if (profile.logo && profile.logo.includes("blob.vercel-storage.com")) {
      try {
        await del(profile.logo);
      } catch {
        // Ignore deletion errors for old files
      }
    }

    // Also try to delete old variants
    const logoVariants = profile.logoVariants as { dark?: string; light?: string } | null;
    if (logoVariants?.dark && logoVariants.dark.includes("blob.vercel-storage.com")) {
      try {
        await del(logoVariants.dark);
      } catch {
        // Ignore deletion errors
      }
    }
    if (logoVariants?.light && logoVariants.light.includes("blob.vercel-storage.com")) {
      try {
        await del(logoVariants.light);
      } catch {
        // Ignore deletion errors
      }
    }

    // Generate unique filename prefix
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const baseFilename = `logos/${profileId}/${timestamp}-${randomSuffix}`;

    // Upload all three variants to Vercel Blob
    const [originalBlob, darkBlob, lightBlob] = await Promise.all([
      put(`${baseFilename}-original.svg`, variants.original, {
        access: "public",
        contentType: "image/svg+xml",
      }),
      put(`${baseFilename}-dark.svg`, variants.dark, {
        access: "public",
        contentType: "image/svg+xml",
      }),
      put(`${baseFilename}-light.svg`, variants.light, {
        access: "public",
        contentType: "image/svg+xml",
      }),
    ]);

    // Update profile with new logo URLs
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        logo: originalBlob.url,
        logoVariants: {
          dark: darkBlob.url,
          light: lightBlob.url,
        },
      },
    });

    return NextResponse.json({
      logo: originalBlob.url,
      logoVariants: {
        dark: darkBlob.url,
        light: lightBlob.url,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    // Log with context for debugging
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
 * DELETE /api/profiles/[id]/logo
 * Remove logo from profile
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    // Authenticate user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: profileId } = await params;

    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
      where: { id: profileId, userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete logo files from Vercel Blob
    const deletePromises: Promise<void>[] = [];

    if (profile.logo && profile.logo.includes("blob.vercel-storage.com")) {
      deletePromises.push(del(profile.logo));
    }

    const logoVariants = profile.logoVariants as { dark?: string; light?: string } | null;
    if (logoVariants?.dark && logoVariants.dark.includes("blob.vercel-storage.com")) {
      deletePromises.push(del(logoVariants.dark));
    }
    if (logoVariants?.light && logoVariants.light.includes("blob.vercel-storage.com")) {
      deletePromises.push(del(logoVariants.light));
    }

    // Wait for all deletions (ignore errors)
    await Promise.allSettled(deletePromises);

    // Clear logo from profile
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        logo: "",
        logoVariants: Prisma.JsonNull,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 }
    );
  }
}
