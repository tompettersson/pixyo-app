/**
 * Background cover-fit math for arbitrary target dimensions.
 *
 * Mirrors the logic in social-graphics/page.tsx (lines 243-261, 1187-1198)
 * but parameterized for any canvas size.
 */

import type { BackgroundFitResult } from './types';

export interface BackgroundFitInput {
  /** Natural image dimensions */
  imageWidth: number;
  imageHeight: number;
  /** Target canvas dimensions */
  targetWidth: number;
  targetHeight: number;
  /** User transform from editor */
  transform: {
    scale: number;
    positionX: number;
    positionY: number;
    flipX: boolean;
  };
  /** Source canvas dimensions (for proportional position scaling) */
  sourceWidth: number;
  sourceHeight: number;
}

/**
 * Compute the cover-fit position and size for a background image
 * on an arbitrary target canvas, applying the user's transform.
 */
export function computeBackgroundFit(input: BackgroundFitInput): BackgroundFitResult {
  const {
    imageWidth,
    imageHeight,
    targetWidth,
    targetHeight,
    transform,
    sourceWidth,
    sourceHeight,
  } = input;

  if (!imageWidth || !imageHeight) {
    return {
      x: 0,
      y: 0,
      width: targetWidth,
      height: targetHeight,
      scaleX: 1,
      offsetX: 0,
      offsetY: 0,
    };
  }

  const canvasRatio = targetWidth / targetHeight;
  const imgRatio = imageWidth / imageHeight;

  // Cover scale: smallest scale that fills the entire canvas
  const coverScale =
    imgRatio > canvasRatio
      ? targetHeight / imageHeight
      : targetWidth / imageWidth;

  // Apply user scale on top of cover scale
  const finalWidth = imageWidth * coverScale * transform.scale;
  const finalHeight = imageHeight * coverScale * transform.scale;

  // Scale user position proportionally to target dimensions
  const scaledPositionX = (transform.positionX / sourceWidth) * targetWidth;
  const scaledPositionY = (transform.positionY / sourceHeight) * targetHeight;

  // Center offset
  const overflowX = (finalWidth - targetWidth) / 2;
  const overflowY = (finalHeight - targetHeight) / 2;

  const flipX = transform.flipX;

  return {
    x: flipX ? targetWidth - scaledPositionX : scaledPositionX,
    y: scaledPositionY,
    width: finalWidth,
    height: finalHeight,
    scaleX: flipX ? -1 : 1,
    offsetX: flipX ? -overflowX : overflowX,
    offsetY: overflowY,
  };
}
