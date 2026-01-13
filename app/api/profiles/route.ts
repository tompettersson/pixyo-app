import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Helper to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Schema for profile creation/update
const profileSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(), // Optional - will be auto-generated if not provided
  logo: z.string().url(),
  colors: z.object({
    dark: z.string(),
    light: z.string(),
    accent: z.string(),
  }),
  fonts: z.object({
    headline: z.object({
      family: z.string(),
      size: z.number(),
      weight: z.string().optional(),
      uppercase: z.boolean().optional(),
    }),
    body: z.object({
      family: z.string(),
      size: z.number(),
      weight: z.string().optional(),
    }),
  }),
  layout: z.object({
    padding: z.object({
      top: z.number(),
      right: z.number(),
      bottom: z.number(),
      left: z.number(),
    }),
    gaps: z.object({
      taglineToHeadline: z.number(),
      headlineToBody: z.number(),
      bodyToButton: z.number(),
    }),
    button: z.object({
      radius: z.number(),
      paddingX: z.number(),
      paddingY: z.number(),
    }),
  }),
  systemPrompt: z.string(),
});

// GET all profiles for current user (including system-seeded profiles)
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return both user's own profiles AND system-seeded profiles
    const profiles = await prisma.profile.findMany({
      where: {
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

    // Ensure slug is unique by appending timestamp if needed
    let finalSlug = slug;
    const existingProfile = await prisma.profile.findUnique({
      where: { slug },
    });
    if (existingProfile) {
      finalSlug = `${slug}-${Date.now()}`;
    }

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


