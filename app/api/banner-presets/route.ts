import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateSchema = z.object({
  profileId: z.string(),
  name: z.string().optional(),
  config: z.record(z.string(), z.any()),
});

// GET /api/banner-presets?profileId=xxx
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileId = request.nextUrl.searchParams.get('profileId');
    if (!profileId) {
      return NextResponse.json({ error: 'profileId required' }, { status: 400 });
    }

    const presets = await prisma.bannerPreset.findMany({
      where: { profileId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ presets });
  } catch (error) {
    console.error('Failed to fetch banner presets:', error);
    return NextResponse.json({ error: 'Failed to fetch banner presets' }, { status: 500 });
  }
}

// POST /api/banner-presets
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = CreateSchema.parse(body);

    const preset = await prisma.bannerPreset.create({
      data: {
        profileId: data.profileId,
        name: data.name ?? 'Unbenannt',
        config: data.config,
      },
    });

    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    console.error('Failed to create banner preset:', error);
    return NextResponse.json({ error: 'Failed to create banner preset' }, { status: 500 });
  }
}
