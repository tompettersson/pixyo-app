import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for profile creation/update
const profileSchema = z.object({
  name: z.string().min(1),
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

// GET all profiles
export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
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

// POST create new profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    const profile = await prisma.profile.create({
      data: {
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
        { error: 'Invalid profile data', details: error.errors },
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

