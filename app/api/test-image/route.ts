import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

/**
 * Simple test endpoint to verify Google Image API access
 * GET /api/test-image
 */
export async function GET(request: NextRequest) {
  try {
    const env = getServerEnv();
    
    if (!env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY not found in environment' },
        { status: 500 }
      );
    }

    // Use gemini-3-pro-image-preview (same as working Laravel project)
    const model = 'gemini-3-pro-image-preview';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GOOGLE_API_KEY}`;

    // Simple test prompt
    const testPrompt = 'A simple red apple on a white background';

    console.log('Testing Google Image API...');
    console.log('Model:', model);
    console.log('Endpoint:', endpoint.replace(env.GOOGLE_API_KEY, '***'));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: testPrompt }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio: '1:1',
            imageSize: '2K',
          },
        },
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return NextResponse.json(
        {
          error: 'API request failed',
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('API Response received, checking for image...');

    // Check if we got an image
    let hasImage = false;
    let imageMimeType = null;

    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
            hasImage = true;
            imageMimeType = part.inlineData.mimeType;
            break;
          }
        }
      }
    }

    if (hasImage) {
      return NextResponse.json({
        success: true,
        message: 'Image API is working!',
        imageFound: true,
        imageMimeType: imageMimeType,
        responseStructure: {
          hasCandidates: !!result.candidates,
          candidatesCount: result.candidates?.length || 0,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'API responded but no image found in response',
        imageFound: false,
        fullResponse: result,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}




