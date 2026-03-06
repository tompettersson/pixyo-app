import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma/client';

// POST /api/designs/[id]/duplicate - Duplicate a design
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

    // Fetch original design
    const originalDesign = await prisma.design.findUnique({
      where: { id },
      include: {
        profile: {
          select: { userId: true },
        },
      },
    });

    if (!originalDesign) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    if (
      originalDesign.profile.userId !== user.id &&
      originalDesign.profile.userId !== 'system-seed-user'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create duplicate with all visual state
    const duplicatedDesign = await prisma.design.create({
      data: {
        profileId: originalDesign.profileId,
        name: `${originalDesign.name} (Kopie)`,
        canvasState: originalDesign.canvasState as Prisma.InputJsonValue,
        layers: originalDesign.layers as Prisma.InputJsonValue,
        overlayOpacity: originalDesign.overlayOpacity,
        ...(originalDesign.content !== null && { content: originalDesign.content as Prisma.InputJsonValue }),
        ...(originalDesign.backgroundImage !== null && { backgroundImage: originalDesign.backgroundImage as Prisma.InputJsonValue }),
        ...(originalDesign.overlay !== null && { overlay: originalDesign.overlay as Prisma.InputJsonValue }),
        ...(originalDesign.productImage !== null && { productImage: originalDesign.productImage as Prisma.InputJsonValue }),
        thumbnailUrl: originalDesign.thumbnailUrl,
      },
    });

    return NextResponse.json({ design: duplicatedDesign }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating design:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate design' },
      { status: 500 }
    );
  }
}
