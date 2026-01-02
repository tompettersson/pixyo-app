import { z } from 'zod';

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
  UNSPLASH_ACCESS_KEY: z.string().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_MOCK_AI: z.string().optional().transform(val => val === 'true'),
});

// Server-side environment variables (only accessible in API routes)
export function getServerEnv() {
  const parsed = envSchema.safeParse({
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  });

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid server environment variables');
  }

  return parsed.data;
}

// Client-side environment variables (accessible everywhere)
export function getClientEnv() {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_MOCK_AI: process.env.NEXT_PUBLIC_MOCK_AI,
  });
}

// Type exports
export type ServerEnv = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;





