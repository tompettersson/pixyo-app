import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { z } from 'zod';

// Schema for asset creation
const assetSchema = z.object({
  profileId: z.string(),
  type: z.enum(['GENERATED', 'UNSPLASH']),
  width: z.number(),
  height: z.number(),
  meta: z.record(z.any()),
  // For base64 image data
  imageData: z.string().optional(),
  // Or for URL (like Unsplash)
  url: z.string().url().optional(),
});

// GET assets for a profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const type = searchParams.get('type');

    const where: any = {};
    if (profileId) where.profileId = profileId;
    if (type) where.type = type;

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

// POST create new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = assetSchema.parse(body);

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
        { error: 'Invalid asset data', details: error.errors },
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

// DELETE asset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
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

