import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma/client';
import { z } from 'zod';

// Schema for updating a design
const updateDesignSchema = z.object({
  name: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  canvasState: z
    .object({
      width: z.number(),
      height: z.number(),
      aspectRatio: z.string(),
      backgroundColor: z.string(),
    })
    .optional(),
  layers: z.array(z.any()).optional(),
  overlayOpacity: z.number().optional(),
  content: z
    .object({
      tagline: z.string(),
      headline: z.string(),
      body: z.string(),
      buttonText: z.string(),
      showButton: z.boolean().optional(),
    })
    .optional(),
  // NEW: Complete visual state
  backgroundImage: z
    .object({
      url: z.string(),
      source: z.enum(['GENERATED', 'UNSPLASH']),
      credit: z
        .object({
          name: z.string(),
          username: z.string(),
          link: z.string(),
        })
        .optional(),
      transform: z.object({
        scale: z.number(),
        positionX: z.number(),
        positionY: z.number(),
        flipX: z.boolean(),
      }),
    })
    .nullable()
    .optional(),
  overlay: z
    .object({
      type: z.enum(['none', 'gradient', 'halftone', 'grain', 'duotone', 'diagonal-stripes', 'scanlines', 'mesh-gradient']),
      mode: z.enum(['darken', 'lighten']),
      intensity: z.number(),
    })
    .optional(),
  // NEW: Product image for Gemini Image-to-Image
  productImage: z
    .object({
      data: z.string(), // Base64 encoded image
      mimeType: z.string(), // image/png, image/jpeg, image/webp
    })
    .nullable()
    .optional(),
});

// GET /api/designs/[id] - Get a single design
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const design = await prisma.design.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            id: true,
            userId: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    // Verify profile access
    if (
      design.profile.userId !== user.id &&
      design.profile.userId !== 'system-seed-user'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ design });
  } catch (error) {
    console.error('Error fetching design:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design' },
      { status: 500 }
    );
  }
}

// PUT /api/designs/[id] - Update a design (autosave)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateDesignSchema.parse(body);

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

    const design = await prisma.design.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.thumbnailUrl !== undefined && {
          thumbnailUrl: data.thumbnailUrl,
        }),
        ...(data.canvasState !== undefined && { canvasState: data.canvasState }),
        ...(data.layers !== undefined && { layers: data.layers }),
        ...(data.overlayOpacity !== undefined && {
          overlayOpacity: data.overlayOpacity,
        }),
        ...(data.content !== undefined && { content: data.content }),
        // NEW: Save complete visual state (handle null for JSON fields)
        ...(data.backgroundImage !== undefined && {
          backgroundImage: data.backgroundImage === null ? Prisma.JsonNull : data.backgroundImage,
        }),
        ...(data.overlay !== undefined && { overlay: data.overlay }),
        ...(data.productImage !== undefined && {
          productImage: data.productImage === null ? Prisma.JsonNull : data.productImage,
        }),
      },
    });

    return NextResponse.json({ design });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating design:', error);
    return NextResponse.json(
      { error: 'Failed to update design' },
      { status: 500 }
    );
  }
}

// DELETE /api/designs/[id] - Delete a design
export async function DELETE(
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

    await prisma.design.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting design:', error);
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    );
  }
}
