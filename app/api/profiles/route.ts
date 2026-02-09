import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { isAdmin, type UserServerMetadata } from '@/lib/permissions';
import { profileSchema, generateSlug, ensureUniqueSlug } from '@/lib/api/profile-helpers';

// GET profiles: admins see ALL, regular users see only their own
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    const admin = isAdmin(serverMetadata);

    const profiles = await prisma.profile.findMany({
      where: admin
        ? undefined // Admins see all profiles
        : {
            OR: [
              { userId: user.id },
              { userId: 'system-seed-user' },
            ],
          },
      orderBy: { updatedAt: 'desc' },
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

// POST create new profile for current user
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // Generate slug from name if not provided
    const slug = validatedData.slug || generateSlug(validatedData.name);
    const finalSlug = await ensureUniqueSlug(slug);

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
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
