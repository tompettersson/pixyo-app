import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for creating a design
const createDesignSchema = z.object({
  profileId: z.string(),
  name: z.string().optional(),
  canvasState: z.object({
    width: z.number(),
    height: z.number(),
    aspectRatio: z.string(),
    backgroundColor: z.string(),
  }),
  layers: z.array(z.any()),
  overlayOpacity: z.number().optional(),
});

// GET /api/designs?profileId=xxx - List designs for a profile
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 }
      );
    }

    // Verify profile access (either owned by user or system-seeded)
    const profile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        OR: [{ userId: user.id }, { userId: 'system-seed-user' }],
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const designs = await prisma.design.findMany({
      where: { profileId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ designs });
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

// POST /api/designs - Create a new design
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createDesignSchema.parse(body);

    // Verify profile access
    const profile = await prisma.profile.findFirst({
      where: {
        id: data.profileId,
        OR: [{ userId: user.id }, { userId: 'system-seed-user' }],
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const design = await prisma.design.create({
      data: {
        profileId: data.profileId,
        name: data.name || 'Unbenannt',
        canvasState: data.canvasState,
        layers: data.layers,
        overlayOpacity: data.overlayOpacity || 0,
      },
    });

    return NextResponse.json({ design }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating design:', error);
    return NextResponse.json(
      { error: 'Failed to create design' },
      { status: 500 }
    );
  }
}
