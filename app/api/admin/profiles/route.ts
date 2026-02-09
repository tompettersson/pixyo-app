import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { isAdmin, type UserServerMetadata } from '@/lib/permissions';
import { profileSchema, generateSlug, ensureUniqueSlug } from '@/lib/api/profile-helpers';

/**
 * GET /api/admin/profiles
 * List all profiles (admin only) with asset/design counts
 */
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profiles = await prisma.profile.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            assets: true,
            designs: true,
          },
        },
      },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

// Admin creation schema extends profileSchema with optional userId
const adminProfileSchema = profileSchema.extend({
  userId: z.string().min(1, 'User ID is required'),
});

/**
 * POST /api/admin/profiles
 * Create profile with explicit userId (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = adminProfileSchema.parse(body);

    const slug = validatedData.slug || generateSlug(validatedData.name);
    const finalSlug = await ensureUniqueSlug(slug);

    const profile = await prisma.profile.create({
      data: {
        userId: validatedData.userId,
        slug: finalSlug,
        name: validatedData.name,
        logo: validatedData.logo,
        colors: validatedData.colors,
        fonts: validatedData.fonts,
        layout: validatedData.layout,
        systemPrompt: validatedData.systemPrompt,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
