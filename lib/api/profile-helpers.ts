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

// Lenient weight: accept string or number, coerce to string
const weightSchema = z.union([z.string(), z.number()]).transform(String).optional();

// Schema for profile update (all fields optional, lenient types for DB data)
export const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().optional(), // Don't require .url() — can be empty or data URI
  logoVariants: z.object({
    dark: z.string(),
    light: z.string(),
  }).nullable().optional(),
  colors: z.object({
    dark: z.string(),
    light: z.string(),
    accent: z.string(),
  }).optional(),
  fonts: z.object({
    headline: z.object({
      family: z.string(),
      size: z.union([z.number(), z.string()]).transform(Number),
      weight: weightSchema,
      uppercase: z.boolean().optional(),
    }),
    body: z.object({
      family: z.string(),
      size: z.union([z.number(), z.string()]).transform(Number),
      weight: weightSchema,
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
  designTokens: z.any().optional(),
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
