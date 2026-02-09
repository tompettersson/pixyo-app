import { z } from 'zod';
import { prisma } from '@/lib/db';

// Helper to generate slug from name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Schema for profile creation
export const profileSchema = z.object({
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

// Schema for profile update (all fields optional)
export const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().url().optional(),
  logoVariants: z.object({
    dark: z.string().url(),
    light: z.string().url(),
  }).nullable().optional(),
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

// Ensure slug is unique, appending timestamp if needed
export async function ensureUniqueSlug(slug: string): Promise<string> {
  const existingProfile = await prisma.profile.findUnique({
    where: { slug },
  });
  if (existingProfile) {
    return `${slug}-${Date.now()}`;
  }
  return slug;
}
