import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePrompt } from '@/lib/ai/claude';
import type { GeneratePromptRequest, ApiError } from '@/types/api';

// Request validation schema
const requestSchema = z.object({
  userIdea: z.string().min(1, 'User idea is required'),
  styleId: z.string().min(1, 'Style ID is required'),
  mode: z.enum(['photo', 'illustration']),
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      const error: ApiError = {
        error: 'Validation Error',
        message: validationResult.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json(error, { status: 400 });
    }

    const promptRequest: GeneratePromptRequest = validationResult.data;

    // Generate prompt using Claude
    const response = await generatePrompt(promptRequest);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Generate prompt error:', error);

    const apiError: ApiError = {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to generate prompt',
      code: 'INTERNAL_ERROR',
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}




