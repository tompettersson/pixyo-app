import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { z } from 'zod';

// Schema for asset creation
const assetSchema = z.object({
  profileId: z.string(),
  type: z.enum(['GENERATED', 'UNSPLASH', 'PRODUCT_SCENE']),
  width: z.number(),
  height: z.number(),
  meta: z.record(z.string(), z.any()),
  // For base64 image data
  imageData: z.string().optional(),
  // Or for URL (like Unsplash)
  url: z.string().url().optional(),
});

// GET assets for a profile (only if profile is owned by current user)
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const type = searchParams.get('type');

    // Verify profile ownership (allow system-seed-user for demo profiles)
    if (profileId) {
      const profile = await prisma.profile.findFirst({
        where: {
          id: profileId,
          OR: [
            { userId: user.id },
            { userId: 'system-seed-user' },
          ],
        },
      });
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
    }

    const where: Record<string, unknown> = {};
    if (profileId) where.profileId = profileId;
    if (type) where.type = type;

    // Only get assets for profiles owned by this user or system-seed-user
    where.profile = {
      OR: [
        { userId: user.id },
        { userId: 'system-seed-user' },
      ],
    };

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Failed to fetch assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST create new asset (only if profile is owned by current user)
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = assetSchema.parse(body);

    // Verify profile ownership (allow system-seed-user for demo profiles)
    const profile = await prisma.profile.findFirst({
      where: {
        id: validatedData.profileId,
        OR: [
          { userId: user.id },
          { userId: 'system-seed-user' },
        ],
      },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let finalUrl = validatedData.url || '';

    // If imageData is provided (base64), upload to Blob
    if (validatedData.imageData) {
      const base64Data = validatedData.imageData.split(',')[1] || validatedData.imageData;
      const buffer = Buffer.from(base64Data, 'base64');

      const blob = await put(
        `assets/${Date.now()}-${Math.random().toString(36).substring(7)}.png`,
        buffer,
        {
          access: 'public',
          contentType: 'image/png',
        }
      );

      finalUrl = blob.url;
    }

    const asset = await prisma.asset.create({
      data: {
        profileId: validatedData.profileId,
        type: validatedData.type,
        url: finalUrl,
        width: validatedData.width,
        height: validatedData.height,
        meta: validatedData.meta,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid asset data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

// DELETE asset (only if owned via profile by current user)
export async function DELETE(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
    }

    // Verify ownership via profile
    const asset = await prisma.asset.findFirst({
      where: { id },
      include: { profile: true },
    });

    if (!asset || asset.profile.userId !== user.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    await prisma.asset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}


