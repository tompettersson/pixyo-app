import { prisma } from '@/lib/db';
import { put, del } from '@vercel/blob';
import { z } from 'zod';
import { Prisma } from '@/lib/generated/prisma/client';
import { colorizeSvg, sanitizeSvg, isValidSvg } from '@/lib/svg/colorize';

// Maximum file size: 500KB
const MAX_FILE_SIZE = 500 * 1024;

// Schema for logo upload
export const logoUploadSchema = z.object({
  svgData: z.string().min(1, 'SVG data is required'),
  filename: z.string().optional(),
});

// Response type
export interface LogoUploadResponse {
  logo: string;
  logoVariants: {
    dark: string;
    light: string;
  };
}

/**
 * Process SVG logo upload: validate, sanitize, colorize, upload to Vercel Blob, update profile.
 * Returns the new logo URLs or throws an error.
 */
export async function processLogoUpload(
  profileId: string,
  svgData: string,
  currentProfile: { logo: string; logoVariants: unknown }
): Promise<LogoUploadResponse> {
  // Decode base64 if provided
  let svgContent = svgData;
  if (svgContent.startsWith('data:')) {
    const base64Match = svgContent.match(/base64,(.+)$/);
    if (base64Match) {
      svgContent = Buffer.from(base64Match[1], 'base64').toString('utf-8');
    }
  }

  // Check file size
  const contentSize = Buffer.byteLength(svgContent, 'utf-8');
  if (contentSize > MAX_FILE_SIZE) {
    throw new LogoError(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024}KB`, 400);
  }

  // Validate SVG structure
  if (!isValidSvg(svgContent)) {
    throw new LogoError('Invalid SVG file format', 400);
  }

  // Sanitize SVG
  const sanitizedSvg = sanitizeSvg(svgContent);

  // Generate colorized variants
  const variants = colorizeSvg(sanitizedSvg);

  // Delete old logo files if they exist
  await deleteOldLogoFiles(currentProfile);

  // Generate unique filename prefix
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const baseFilename = `logos/${profileId}/${timestamp}-${randomSuffix}`;

  // Upload all three variants to Vercel Blob
  const [originalBlob, darkBlob, lightBlob] = await Promise.all([
    put(`${baseFilename}-original.svg`, variants.original, {
      access: 'public',
      contentType: 'image/svg+xml',
    }),
    put(`${baseFilename}-dark.svg`, variants.dark, {
      access: 'public',
      contentType: 'image/svg+xml',
    }),
    put(`${baseFilename}-light.svg`, variants.light, {
      access: 'public',
      contentType: 'image/svg+xml',
    }),
  ]);

  // Update profile with new logo URLs
  await prisma.profile.update({
    where: { id: profileId },
    data: {
      logo: originalBlob.url,
      logoVariants: {
        dark: darkBlob.url,
        light: lightBlob.url,
      },
    },
  });

  return {
    logo: originalBlob.url,
    logoVariants: {
      dark: darkBlob.url,
      light: lightBlob.url,
    },
  };
}

/**
 * Delete all logo files from Vercel Blob and clear profile logo fields.
 */
export async function deleteProfileLogo(
  profileId: string,
  profile: { logo: string; logoVariants: unknown }
): Promise<void> {
  await deleteOldLogoFiles(profile);

  // Clear logo from profile
  await prisma.profile.update({
    where: { id: profileId },
    data: {
      logo: '',
      logoVariants: Prisma.JsonNull,
    },
  });
}

/**
 * Delete old logo files from Vercel Blob (ignoring errors).
 */
async function deleteOldLogoFiles(profile: { logo: string; logoVariants: unknown }): Promise<void> {
  const deletePromises: Promise<void>[] = [];

  if (profile.logo && profile.logo.includes('blob.vercel-storage.com')) {
    deletePromises.push(del(profile.logo).catch(() => {}));
  }

  const logoVariants = profile.logoVariants as { dark?: string; light?: string } | null;
  if (logoVariants?.dark && logoVariants.dark.includes('blob.vercel-storage.com')) {
    deletePromises.push(del(logoVariants.dark).catch(() => {}));
  }
  if (logoVariants?.light && logoVariants.light.includes('blob.vercel-storage.com')) {
    deletePromises.push(del(logoVariants.light).catch(() => {}));
  }

  await Promise.allSettled(deletePromises);
}

/**
 * Custom error class for logo operations with HTTP status code.
 */
export class LogoError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'LogoError';
  }
}
