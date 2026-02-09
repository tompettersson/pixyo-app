/**
 * Layout engine for the Formatizer.
 *
 * Computes text positions and sizes for a given target canvas + content level.
 * Mirrors the layout constants and position math from social-graphics/page.tsx
 * (lines 48-67, 730-783) but parameterized for arbitrary dimensions.
 *
 * Pure function – no DOM mutations, no Konva. Only uses Canvas 2D for text measurement.
 */

import type { ContentLevel, DesignSnapshot, LayoutResult } from './types';

/** Base layout constants at 1080px reference */
const BASE = {
  padding: { top: 72, right: 216, bottom: 72, left: 72 },
  taglineSize: 36,
  headlineSize: 112,
  headlineLineHeight: 1.05,
  bodySize: 32,
  bodyLineHeight: 1.5,
  buttonSize: 32,
  gapTaglineToHeadline: 20,
  gapHeadlineToBody: 24,
  gapBodyToButton: 16,
  buttonPaddingX: 48,
  buttonPaddingY: 20,
  buttonRadius: 16,
  /** Reference dimension for scale factor */
  referenceDim: 1080,
  /** Logo max dimensions as fraction of canvas */
  logoWidthFraction: 0.35,
  logoHeightFraction: 0.15,
} as const;

/**
 * Measure how many lines a text string wraps to at a given font size and width.
 * Uses Canvas 2D measureText (same approach as social-graphics/page.tsx line 734-761).
 */
export function measureTextLines(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontFamily: string = 'Inter',
  fontWeight: string = 'bold',
): number {
  if (typeof window === 'undefined' || !text.trim()) return 1;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 1;

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}, sans-serif`;

  const words = text.split(' ');
  let lines = 1;
  let currentLineWidth = 0;
  const spaceWidth = ctx.measureText(' ').width;

  for (const word of words) {
    const wordWidth = ctx.measureText(word).width;

    if (currentLineWidth + wordWidth > maxWidth && currentLineWidth > 0) {
      lines++;
      currentLineWidth = wordWidth + spaceWidth;
    } else {
      currentLineWidth += wordWidth + spaceWidth;
    }
  }

  return lines;
}

/**
 * Compute layout for a target canvas at a given content level.
 *
 * Scale factor: `Math.min(targetWidth, targetHeight) / 1080`
 * This normalizes on the shorter edge so that 16:9 (1920×1080) gets scaleFactor=1.0,
 * keeping text the same size as 1:1 (1080×1080).
 */
export function computeLayout(
  targetWidth: number,
  targetHeight: number,
  contentLevel: ContentLevel,
  snapshot: DesignSnapshot,
): LayoutResult {
  const sf = Math.min(targetWidth, targetHeight) / BASE.referenceDim;

  // Use customer layout if available, otherwise fall back to BASE
  const customerLayout = snapshot.customer.layout;
  const basePadding = customerLayout?.padding ?? BASE.padding;
  const baseGaps = customerLayout?.gaps ?? {
    taglineToHeadline: BASE.gapTaglineToHeadline,
    headlineToBody: BASE.gapHeadlineToBody,
    bodyToButton: BASE.gapBodyToButton,
  };
  const baseButton = customerLayout?.button ?? {
    radius: BASE.buttonRadius,
    paddingX: BASE.buttonPaddingX,
    paddingY: BASE.buttonPaddingY,
  };

  // Scale padding
  const padding = {
    top: Math.round(basePadding.top * sf),
    right: Math.round(basePadding.right * sf),
    bottom: Math.round(basePadding.bottom * sf),
    left: Math.round(basePadding.left * sf),
  };

  const contentWidth = targetWidth - padding.left - padding.right;

  // Scale font sizes
  const taglineFontSize = Math.round(BASE.taglineSize * sf);
  const headlineFontSize = Math.round(BASE.headlineSize * sf);
  const bodyFontSize = Math.round(BASE.bodySize * sf);
  const buttonFontSize = Math.round(BASE.buttonSize * sf);

  // Scale gaps
  const gapTaglineToHeadline = Math.round(baseGaps.taglineToHeadline * sf);
  const gapHeadlineToBody = Math.round(baseGaps.headlineToBody * sf);
  const gapBodyToButton = Math.round(baseGaps.bodyToButton * sf);

  // Scale button
  const buttonPaddingX = Math.round(baseButton.paddingX * sf);
  const buttonPaddingY = Math.round(baseButton.paddingY * sf);
  const buttonRadius = Math.round(baseButton.radius * sf);

  // Logo space
  const logoMaxWidth = Math.round(targetWidth * BASE.logoWidthFraction);
  const logoMaxHeight = Math.round(targetHeight * BASE.logoHeightFraction);

  // Font info for measurement
  const headlineFont = snapshot.customer.fonts.headline;

  // Build layout top-down based on content level
  let yPos = 0;
  let taglineResult: LayoutResult['tagline'];
  let bodyResult: LayoutResult['body'];
  let buttonResult: LayoutResult['button'];

  const includeTagline = contentLevel === 'FULL' || contentLevel === 'REDUCED_NO_CTA';
  const includeBody = contentLevel === 'FULL' || contentLevel === 'REDUCED_NO_CTA';
  const includeButton = contentLevel === 'FULL' && snapshot.content.showButton;

  // Tagline
  if (includeTagline && snapshot.content.tagline.trim()) {
    taglineResult = {
      y: yPos,
      fontSize: taglineFontSize,
      lineHeight: 1.2,
    };
    yPos += taglineFontSize * 1.2 + gapTaglineToHeadline;
  }

  // Headline (always present except IMAGE_ONLY_LOGO and SKIP)
  const headlineY = yPos;
  const headlineLines = measureTextLines(
    snapshot.content.headline,
    headlineFontSize,
    contentWidth,
    headlineFont.family || 'Inter',
    headlineFont.weight || 'bold',
  );
  const headlineHeight = headlineLines * headlineFontSize * BASE.headlineLineHeight;
  yPos += headlineHeight + gapHeadlineToBody;

  // Body
  if (includeBody && snapshot.content.body.trim()) {
    bodyResult = {
      y: yPos,
      fontSize: bodyFontSize,
      lineHeight: BASE.bodyLineHeight,
    };
    const bodyLines = measureTextLines(
      snapshot.content.body,
      bodyFontSize,
      contentWidth,
      snapshot.customer.fonts.body.family || 'Inter',
      snapshot.customer.fonts.body.weight || 'normal',
    );
    const bodyHeight = Math.max(bodyLines * bodyFontSize * BASE.bodyLineHeight, bodyFontSize * BASE.bodyLineHeight);
    yPos += bodyHeight + (includeButton ? gapBodyToButton : 0);
  }

  // Button
  if (includeButton && snapshot.content.buttonText.trim()) {
    const buttonWidth =
      snapshot.content.buttonText.length * buttonFontSize * 0.7 + buttonPaddingX * 2;
    const buttonHeight = buttonFontSize + buttonPaddingY * 2;

    buttonResult = {
      y: yPos,
      width: buttonWidth,
      height: buttonHeight,
      fontSize: buttonFontSize,
      paddingX: buttonPaddingX,
      paddingY: buttonPaddingY,
      radius: buttonRadius,
    };
    yPos += buttonHeight;
  }

  const contentGroupHeight = yPos;

  // Check if everything fits
  const totalVertical = padding.top + contentGroupHeight + logoMaxHeight + padding.bottom;
  const fitsVertically = totalVertical <= targetHeight;

  return {
    padding,
    contentWidth,
    scaleFactor: sf,
    tagline: taglineResult,
    headline: {
      y: headlineY,
      fontSize: headlineFontSize,
      lineHeight: BASE.headlineLineHeight,
    },
    body: bodyResult,
    button: buttonResult,
    logoMaxWidth,
    logoMaxHeight,
    contentGroupHeight,
    fitsVertically,
  };
}
