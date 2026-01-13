import { put, del } from '@vercel/blob';
import type Konva from 'konva';

const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_QUALITY = 0.8;

/**
 * Generate a thumbnail from a Konva stage
 * @param stage - The Konva stage to capture
 * @param designId - The design ID for naming the blob
 * @returns The URL of the uploaded thumbnail
 */
export async function generateThumbnail(
  stage: Konva.Stage,
  designId: string
): Promise<string> {
  // Get the stage dimensions
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  // Calculate thumbnail dimensions maintaining aspect ratio
  const aspectRatio = stageWidth / stageHeight;
  const thumbnailHeight = Math.round(THUMBNAIL_WIDTH / aspectRatio);

  // Export stage to data URL
  const dataUrl = stage.toDataURL({
    pixelRatio: THUMBNAIL_WIDTH / stageWidth,
    mimeType: 'image/jpeg',
    quality: THUMBNAIL_QUALITY,
  });

  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Upload to Vercel Blob
  const filename = `thumbnails/${designId}-${Date.now()}.jpg`;

  const { url } = await put(filename, blob, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  return url;
}

/**
 * Delete a thumbnail from Vercel Blob
 * @param url - The URL of the thumbnail to delete
 */
export async function deleteThumbnail(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Failed to delete thumbnail:', error);
    // Don't throw - thumbnail deletion is not critical
  }
}

/**
 * Generate thumbnail data URL (for client-side preview before upload)
 * @param stage - The Konva stage to capture
 * @returns Base64 data URL of the thumbnail
 */
export function generateThumbnailDataUrl(stage: Konva.Stage): string {
  const stageWidth = stage.width();

  return stage.toDataURL({
    pixelRatio: THUMBNAIL_WIDTH / stageWidth,
    mimeType: 'image/jpeg',
    quality: THUMBNAIL_QUALITY,
  });
}
