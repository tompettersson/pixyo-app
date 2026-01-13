import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { put, del } from '@vercel/blob';

// POST /api/designs/[id]/thumbnail - Upload thumbnail
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
      include: {
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

    // Get the image data from the request
    const formData = await request.formData();
    const file = formData.get('thumbnail') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No thumbnail provided' },
        { status: 400 }
      );
    }

    // Delete old thumbnail if exists
    if (existingDesign.thumbnailUrl) {
      try {
        await del(existingDesign.thumbnailUrl);
      } catch {
        // Ignore deletion errors
      }
    }

    // Upload new thumbnail
    const filename = `thumbnails/${id}-${Date.now()}.jpg`;
    const { url } = await put(filename, file, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    // Update design with new thumbnail URL
    const design = await prisma.design.update({
      where: { id },
      data: { thumbnailUrl: url },
    });

    return NextResponse.json({ thumbnailUrl: url, design });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to upload thumbnail' },
      { status: 500 }
    );
  }
}
