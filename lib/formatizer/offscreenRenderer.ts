/**
 * Offscreen renderer using imperative Konva API.
 *
 * Creates a hidden Konva.Stage, renders the design for a target format,
 * exports to Blob, then immediately destroys the stage.
 *
 * Mirrors the Konva tree from social-graphics/page.tsx (lines 1186-1306)
 * but using the raw Konva API instead of react-konva components.
 */

import type { DesignSnapshot, FormatTarget, LayoutResult, RenderResult } from './types';
import { computeLayout } from './layoutEngine';
import { computeBackgroundFit } from './backgroundFit';
import {
  generateOverlay,
  getOverlayBlendMode,
  type BlendMode,
} from '@/lib/overlayEffects';

/** Map blend modes to Canvas globalCompositeOperation */
const blendModeToComposite: Record<BlendMode, GlobalCompositeOperation> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  'soft-light': 'soft-light',
  overlay: 'overlay',
};

/** Load an image with CORS enabled. Returns null on error. */
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('[Formatizer] Failed to load image:', url);
      resolve(null);
    };
    img.src = url;
  });
}

/** Wait for all fonts to be ready */
async function ensureFontsReady(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }
}

/**
 * Render a single format target to a Blob using offscreen Konva.
 *
 * The stage is created in a hidden container and destroyed after export.
 * This keeps memory usage bounded – only one stage exists at a time.
 */
export async function renderFormat(
  target: FormatTarget,
  snapshot: DesignSnapshot,
  layout: LayoutResult,
): Promise<{ blob: Blob | null; thumbnailUrl: string | null }> {
  // Dynamic import to avoid SSR issues
  const Konva = (await import('konva')).default;

  await ensureFontsReady();

  // Create offscreen container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = `${target.width}px`;
  container.style.height = `${target.height}px`;
  document.body.appendChild(container);

  let stage: InstanceType<typeof Konva.Stage> | null = null;

  try {
    stage = new Konva.Stage({
      container,
      width: target.width,
      height: target.height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // 1. Background color rect
    const bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: target.width,
      height: target.height,
      fill: snapshot.backgroundColor,
    });
    layer.add(bgRect);

    // 2. Background image (cover fit)
    if (snapshot.backgroundImage?.url) {
      const bgImg = await loadImage(snapshot.backgroundImage.url);
      if (bgImg) {
        const fit = computeBackgroundFit({
          imageWidth: bgImg.naturalWidth || bgImg.width,
          imageHeight: bgImg.naturalHeight || bgImg.height,
          targetWidth: target.width,
          targetHeight: target.height,
          transform: snapshot.backgroundImage.transform,
          sourceWidth: snapshot.sourceCanvasWidth,
          sourceHeight: snapshot.sourceCanvasHeight,
        });

        const bgKonva = new Konva.Image({
          image: bgImg,
          x: fit.x,
          y: fit.y,
          width: fit.width,
          height: fit.height,
          scaleX: fit.scaleX,
          offsetX: fit.offsetX,
          offsetY: fit.offsetY,
        });
        layer.add(bgKonva);
      }
    }

    // 3. Overlay
    if (snapshot.overlay.type !== 'none' && snapshot.overlay.intensity > 0) {
      const overlayCanvas = generateOverlay(
        snapshot.overlay.type,
        target.width,
        target.height,
        snapshot.overlay.intensity,
        snapshot.overlay.mode,
      );
      if (overlayCanvas) {
        const overlayImg = new Image();
        overlayImg.src = overlayCanvas.toDataURL();
        await new Promise<void>((resolve) => {
          overlayImg.onload = () => resolve();
          overlayImg.onerror = () => resolve();
        });

        const blendMode = getOverlayBlendMode(snapshot.overlay.type, snapshot.overlay.mode);
        const overlayKonva = new Konva.Image({
          image: overlayImg,
          x: 0,
          y: 0,
          width: target.width,
          height: target.height,
          globalCompositeOperation: blendModeToComposite[blendMode],
        });
        layer.add(overlayKonva);
      }
    }

    // Determine text color based on overlay mode
    const textColor = snapshot.overlay.mode === 'darken' ? '#ffffff' : '#111111';
    const buttonBgColor = snapshot.overlay.mode === 'darken' ? '#ffffff' : '#111111';
    const buttonTextColor = snapshot.overlay.mode === 'darken'
      ? (snapshot.backgroundImage ? '#000000' : snapshot.backgroundColor)
      : '#ffffff';

    // 4. Content group (only if not IMAGE_ONLY_LOGO or SKIP)
    if (target.contentLevel !== 'IMAGE_ONLY_LOGO' && target.contentLevel !== 'SKIP') {
      const contentGroup = new Konva.Group({
        x: layout.padding.left,
        y: layout.padding.top,
      });

      // Tagline
      if (layout.tagline && snapshot.content.tagline.trim()) {
        const taglineText = new Konva.Text({
          x: 0,
          y: layout.tagline.y,
          width: layout.contentWidth,
          text: snapshot.content.tagline.toUpperCase(),
          fontFamily: snapshot.customer.fonts.headline.family || 'Inter',
          fontSize: layout.tagline.fontSize,
          fontStyle: 'bold',
          fill: textColor,
          opacity: 0.9,
        });
        contentGroup.add(taglineText);
      }

      // Headline
      const headlineText = new Konva.Text({
        x: 0,
        y: layout.headline.y,
        width: layout.contentWidth,
        text: snapshot.content.headline,
        fontFamily: snapshot.customer.fonts.headline.family || 'Inter',
        fontSize: layout.headline.fontSize,
        fontStyle: snapshot.customer.fonts.headline.weight || 'bold',
        fill: textColor,
        lineHeight: layout.headline.lineHeight,
        wrap: 'word',
      });
      contentGroup.add(headlineText);

      // Body
      if (layout.body && snapshot.content.body.trim()) {
        const bodyText = new Konva.Text({
          x: 0,
          y: layout.body.y,
          width: layout.contentWidth,
          text: snapshot.content.body,
          fontFamily: snapshot.customer.fonts.body.family || 'Inter',
          fontSize: layout.body.fontSize,
          fontStyle: snapshot.customer.fonts.body.weight || 'normal',
          fill: textColor,
          opacity: 0.85,
          lineHeight: layout.body.lineHeight,
          wrap: 'word',
        });
        contentGroup.add(bodyText);
      }

      // Button
      if (layout.button && snapshot.content.buttonText.trim()) {
        const buttonGroup = new Konva.Group({
          x: 0,
          y: layout.button.y,
        });

        const buttonRect = new Konva.Rect({
          x: 0,
          y: 0,
          width: layout.button.width,
          height: layout.button.height,
          fill: buttonBgColor,
          cornerRadius: layout.button.radius,
        });
        buttonGroup.add(buttonRect);

        const buttonLabel = new Konva.Text({
          x: layout.button.paddingX,
          y: layout.button.paddingY,
          text: snapshot.content.buttonText.toUpperCase(),
          fontFamily: snapshot.customer.fonts.headline.family || 'Inter',
          fontSize: layout.button.fontSize,
          fontStyle: 'bold',
          fill: buttonTextColor,
        });
        buttonGroup.add(buttonLabel);

        contentGroup.add(buttonGroup);
      }

      layer.add(contentGroup);
    }

    // 5. Logo (bottom left)
    const logoUrl = getLogoUrl(snapshot);
    if (logoUrl) {
      const logoImg = await loadImage(logoUrl);
      if (logoImg) {
        const logoNatW = logoImg.naturalWidth || logoImg.width;
        const logoNatH = logoImg.naturalHeight || logoImg.height;

        // Scale logo to fit within max bounds, preserving aspect ratio
        const logoScale = Math.min(
          layout.logoMaxWidth / logoNatW,
          layout.logoMaxHeight / logoNatH,
          1, // Don't upscale
        );

        const logoW = logoNatW * logoScale;
        const logoH = logoNatH * logoScale;

        const logoKonva = new Konva.Image({
          image: logoImg,
          x: layout.padding.left,
          y: target.height - logoH - layout.padding.bottom,
          width: logoW,
          height: logoH,
        });
        layer.add(logoKonva);
      }
    }

    // 6. Photo credit (Unsplash)
    if (snapshot.backgroundImage?.credit) {
      const credit = snapshot.backgroundImage.credit;
      const creditFontSize = Math.round(18 * layout.scaleFactor);
      const creditWidth = Math.round(300 * layout.scaleFactor);

      const creditText = new Konva.Text({
        x: target.width - layout.padding.right / 2,
        y: target.height - Math.round(32 * layout.scaleFactor),
        text: `📷 ${credit.name} / Unsplash`,
        fontFamily: 'Inter',
        fontSize: creditFontSize,
        fill: textColor,
        opacity: 0.5,
        align: 'right',
        width: creditWidth,
        offsetX: creditWidth,
      });
      layer.add(creditText);
    }

    // Draw
    layer.draw();

    // Export to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      stage!.toBlob({
        mimeType: 'image/jpeg',
        quality: 0.92,
        pixelRatio: 2,
        callback: (b: Blob | null) => resolve(b),
      });
    });

    // Create thumbnail
    let thumbnailUrl: string | null = null;
    if (blob) {
      thumbnailUrl = URL.createObjectURL(blob);
    }

    return { blob, thumbnailUrl };
  } finally {
    // Always clean up
    if (stage) {
      stage.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Get the appropriate logo URL based on overlay mode.
 * Uses dark variant for lighten mode, light variant for darken mode.
 */
function getLogoUrl(snapshot: DesignSnapshot): string | null {
  const { logo, logoVariants } = snapshot.customer;

  if (logoVariants) {
    // Darken mode = white/light text → use light logo variant
    // Lighten mode = dark text → use dark logo variant
    return snapshot.overlay.mode === 'darken'
      ? logoVariants.light
      : logoVariants.dark;
  }

  return logo || null;
}

/**
 * Render all format targets sequentially.
 * Yields progress updates via callback.
 */
export async function renderAllFormats(
  targets: FormatTarget[],
  snapshot: DesignSnapshot,
  onProgress: (index: number, result: RenderResult) => void,
): Promise<RenderResult[]> {
  const results: RenderResult[] = [];

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];

    const result: RenderResult = {
      ratioId: target.ratioId,
      label: target.label,
      width: target.width,
      height: target.height,
      contentLevel: target.contentLevel,
      blob: null,
      thumbnailUrl: null,
      status: 'rendering',
      warnings: [],
    };

    // Notify start
    onProgress(i, { ...result });

    if (target.contentLevel === 'SKIP') {
      result.status = 'skipped';
      result.warnings = ['Format übersprungen'];
      onProgress(i, result);
      results.push(result);
      continue;
    }

    try {
      // Compute layout for this target
      const layout = computeLayout(
        target.width,
        target.height,
        target.contentLevel,
        snapshot,
      );

      const { blob, thumbnailUrl } = await renderFormat(target, snapshot, layout);
      result.blob = blob;
      result.thumbnailUrl = thumbnailUrl;
      result.status = blob ? 'done' : 'error';
      if (!blob) {
        result.warnings.push('Export fehlgeschlagen');
      }
    } catch (err) {
      console.error(`[Formatizer] Error rendering ${target.ratioId}:`, err);
      result.status = 'error';
      result.warnings.push(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    }

    onProgress(i, result);
    results.push(result);
  }

  return results;
}
