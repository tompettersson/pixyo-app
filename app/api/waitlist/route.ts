import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const waitlistSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
  source: z.string().optional().default('landing'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = waitlistSchema.parse(body);

    // Upsert to handle duplicate emails gracefully
    await prisma.waitlistEntry.upsert({
      where: { email },
      update: {}, // No update needed if already exists
      create: { email, source },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Ungültige Eingabe' },
        { status: 400 }
      );
    }

    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    );
  }
}
