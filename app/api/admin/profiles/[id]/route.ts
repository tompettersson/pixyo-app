import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma/client';
import { z } from 'zod';
import { isAdmin, type UserServerMetadata } from '@/lib/permissions';
import { profileUpdateSchema } from '@/lib/api/profile-helpers';

// Admin update schema allows userId reassignment
const adminProfileUpdateSchema = profileUpdateSchema.extend({
  userId: z.string().min(1).optional(),
});

/**
 * GET /api/admin/profiles/[id]
 * Get single profile without ownership check (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        assets: true,
        designs: true,
        _count: {
          select: {
            assets: true,
            designs: true,
          },
        },
      },
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

/**
 * PATCH /api/admin/profiles/[id]
 * Update profile without ownership check (admin only)
 * Also allows userId reassignment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Verify profile exists
    const existing = await prisma.profile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = adminProfileUpdateSchema.parse(body);

    // Build update data
    const updateData: Prisma.ProfileUpdateInput = {
      ...(validatedData.userId !== undefined && { userId: validatedData.userId }),
      ...(validatedData.name !== undefined && { name: validatedData.name }),
      ...(validatedData.logo !== undefined && { logo: validatedData.logo }),
      ...(validatedData.logoVariants !== undefined && {
        logoVariants: validatedData.logoVariants === null ? Prisma.JsonNull : validatedData.logoVariants,
      }),
      ...(validatedData.colors !== undefined && { colors: validatedData.colors }),
      ...(validatedData.fonts !== undefined && { fonts: validatedData.fonts }),
      ...(validatedData.layout !== undefined && { layout: validatedData.layout }),
      ...(validatedData.systemPrompt !== undefined && { systemPrompt: validatedData.systemPrompt }),
    };

    const profile = await prisma.profile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      console.error('Profile validation error:', details);
      return NextResponse.json(
        { error: `Validierungsfehler: ${details}`, details: error.issues },
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

/**
 * DELETE /api/admin/profiles/[id]
 * Delete profile without ownership check (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.profile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    await prisma.profile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
