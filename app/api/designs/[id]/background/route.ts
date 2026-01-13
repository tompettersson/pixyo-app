import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { put, del } from '@vercel/blob';
import { z } from 'zod';

// Schema for uploading base64 image
const uploadSchema = z.object({
  imageData: z.string(), // Base64 data (without data URL prefix) or full data URL
  mimeType: z.string().optional(), // image/png, image/jpeg, etc.
  source: z.enum(['GENERATED', 'UNSPLASH']),
});

// POST /api/designs/[id]/background - Upload background image to Blob
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify design exists and user has access
    const existingDesign = await prisma.design.findUnique({
      where: { id },
      select: {
        id: true,
        backgroundImage: true,
        profile: {
          select: { userId: true },
        },
      },
    });

    if (!existingDesign) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    if (
      existingDesign.profile.userId !== user.id &&
      existingDesign.profile.userId !== 'system-seed-user'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const data = uploadSchema.parse(body);

    // Extract base64 data and mime type
    let base64Data = data.imageData;
    let mimeType = data.mimeType || 'image/png';

    // Handle data URL format (data:image/png;base64,...)
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Delete old background image if it's a blob URL
    const existingBgImage = existingDesign.backgroundImage as { url?: string } | null | undefined;
    if (existingBgImage?.url?.includes('blob.vercel-storage.com')) {
      try {
        await del(existingBgImage.url);
      } catch {
        // Ignore deletion errors
      }
    }

    // Determine file extension
    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
    const filename = `backgrounds/${id}-${Date.now()}.${ext}`;

    // Upload to Vercel Blob
    const { url } = await put(filename, buffer, {
      access: 'public',
      contentType: mimeType,
    });

    return NextResponse.json({
      url,
      source: data.source,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error uploading background image:', error);
    return NextResponse.json(
      { error: 'Failed to upload background image' },
      { status: 500 }
    );
  }
}
