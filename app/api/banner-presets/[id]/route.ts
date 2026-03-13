import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { put, del } from '@vercel/blob';
import { z } from 'zod';
const UpdateSchema = z.object({
  name: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

async function getPresetWithAuth(id: string, userId: string) {
  const preset = await prisma.bannerPreset.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!preset) return null;
  if (preset.profile.userId !== userId && preset.profile.userId !== 'system-seed-user') {
    return null;
  }
  return preset;
}

// GET /api/banner-presets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const preset = await prisma.bannerPreset.findUnique({ where: { id } });
    if (!preset) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ preset });
  } catch (error) {
    console.error('Failed to fetch banner preset:', error);
    return NextResponse.json({ error: 'Failed to fetch banner preset' }, { status: 500 });
  }
}

// PUT /api/banner-presets/[id]
// Accepts JSON or multipart/form-data (with optional thumbnail file)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await getPresetWithAuth(id, user.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const contentType = request.headers.get('content-type') || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const name = formData.get('name') as string | null;
      const configStr = formData.get('config') as string | null;
      const thumbnail = formData.get('thumbnail') as File | null;

      if (name) updateData.name = name;
      if (configStr) updateData.config = JSON.parse(configStr);

      if (thumbnail) {
        // Delete old thumbnail
        if (existing.thumbnailUrl) {
          try { await del(existing.thumbnailUrl); } catch { /* ignore */ }
        }
        // Upload new
        const filename = `banner-presets/${id}-${Date.now()}.jpg`;
        const { url } = await put(filename, thumbnail, {
          access: 'public',
          contentType: 'image/jpeg',
        });
        updateData.thumbnailUrl = url;
      }
    } else {
      const body = await request.json();
      const data = UpdateSchema.parse(body);
      if (data.name !== undefined) updateData.name = data.name;
      if (data.config !== undefined) updateData.config = data.config;
    }

    const preset = await prisma.bannerPreset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ preset });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    console.error('Failed to update banner preset:', error);
    return NextResponse.json({ error: 'Failed to update banner preset' }, { status: 500 });
  }
}

// DELETE /api/banner-presets/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await getPresetWithAuth(id, user.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete thumbnail from blob storage
    if (existing.thumbnailUrl) {
      try { await del(existing.thumbnailUrl); } catch { /* ignore */ }
    }

    await prisma.bannerPreset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete banner preset:', error);
    return NextResponse.json({ error: 'Failed to delete banner preset' }, { status: 500 });
  }
}
