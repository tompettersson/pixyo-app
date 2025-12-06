import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for profile update (all fields optional)
const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().url().optional(),
  colors: z.object({
    dark: z.string(),
    light: z.string(),
    accent: z.string(),
  }).optional(),
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
  }).optional(),
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
  }).optional(),
  systemPrompt: z.string().optional(),
});

// GET single profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: params.id },
      include: { assets: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH update profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    const profile = await prisma.profile.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// DELETE profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.profile.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}

