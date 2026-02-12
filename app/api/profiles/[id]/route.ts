import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma/client';
import { z } from 'zod';
import { profileUpdateSchema } from '@/lib/api/profile-helpers';

// GET single profile (only if owned by current user)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const profile = await prisma.profile.findFirst({
      where: { id, userId: user.id },
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

// PATCH update profile (only if owned by current user)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.profile.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Build update data, converting null to Prisma.JsonNull for JSON fields
    const updateData: Prisma.ProfileUpdateInput = {
      ...(validatedData.name !== undefined && { name: validatedData.name }),
      ...(validatedData.logo !== undefined && { logo: validatedData.logo }),
      ...(validatedData.logoVariants !== undefined && {
        logoVariants: validatedData.logoVariants === null ? Prisma.JsonNull : validatedData.logoVariants,
      }),
      ...(validatedData.colors !== undefined && { colors: validatedData.colors }),
      ...(validatedData.fonts !== undefined && { fonts: validatedData.fonts }),
      ...(validatedData.layout !== undefined && { layout: validatedData.layout }),
      ...(validatedData.systemPrompt !== undefined && { systemPrompt: validatedData.systemPrompt }),
      ...(validatedData.designTokens !== undefined && {
        designTokens: validatedData.designTokens === null ? Prisma.JsonNull : validatedData.designTokens,
      }),
    };

    const profile = await prisma.profile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.issues },
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

// DELETE profile (only if owned by current user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.profile.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    await prisma.profile.delete({
      where: { id },
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
