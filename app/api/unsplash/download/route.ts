import { NextRequest, NextResponse } from 'next/server';

// Unsplash requires tracking downloads when a photo is used
// This helps photographers get credit for their work
export async function POST(request: NextRequest) {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: 'Unsplash API key not configured' },
      { status: 503 }
    );
  }

  try {
    const { downloadLocation } = await request.json();

    if (!downloadLocation) {
      return NextResponse.json(
        { error: 'downloadLocation is required' },
        { status: 400 }
      );
    }

    // Trigger download tracking (required by Unsplash API guidelines)
    const response = await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to track download:', await response.text());
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking download:', error);
    // Don't fail - tracking is best effort
    return NextResponse.json({ success: true });
  }
}

