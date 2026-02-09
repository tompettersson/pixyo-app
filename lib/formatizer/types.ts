// Formatizer types – Batch export for Social Graphics

import type {
  DesignContent,
  DesignBackgroundImage,
  DesignOverlay,
} from '@/types/customer';

/**
 * Content reduction levels, ordered from most content to least.
 * The contentReducer tries each level top-down until the layout fits.
 */
export type ContentLevel =
  | 'FULL'              // Tagline + Headline + Body + Button + Logo
  | 'REDUCED_NO_CTA'    // Tagline + Headline + Body + Logo
  | 'HEADLINE_ONLY'     // Headline + Logo
  | 'IMAGE_ONLY_LOGO'   // Background + Overlay + Logo
  | 'SKIP';             // Format not renderable

/**
 * Snapshot of the current editor design, taken once before batch render.
 * Decoupled from the store so rendering is side-effect-free.
 */
export interface DesignSnapshot {
  content: DesignContent;
  backgroundImage: DesignBackgroundImage | null;
  overlay: DesignOverlay;
  backgroundColor: string;
  sourceCanvasWidth: number;
  sourceCanvasHeight: number;
  customer: {
    logo: string;
    logoVariants: { dark: string; light: string } | null;
    colors: { dark: string; light: string; accent: string };
    fonts: {
      headline: { family: string; weight: string; uppercase?: boolean };
      body: { family: string; weight: string };
    };
    layout: {
      padding: { top: number; right: number; bottom: number; left: number };
      gaps: { taglineToHeadline: number; headlineToBody: number; bodyToButton: number };
      button: { radius: number; paddingX: number; paddingY: number };
    };
  };
}

/**
 * A single format target (e.g. 1:1 at 1080x1080).
 */
export interface FormatTarget {
  ratioId: string;           // '1:1', '4:5', '9:16', '16:9'
  width: number;
  height: number;
  label: string;
  contentLevel: ContentLevel; // Set by contentReducer
}

/**
 * Result of layout computation for a given target + content level.
 */
export interface LayoutResult {
  padding: { top: number; right: number; bottom: number; left: number };
  contentWidth: number;
  scaleFactor: number;
  tagline?: { y: number; fontSize: number; lineHeight: number };
  headline: { y: number; fontSize: number; lineHeight: number };
  body?: { y: number; fontSize: number; lineHeight: number };
  button?: {
    y: number;
    width: number;
    height: number;
    fontSize: number;
    paddingX: number;
    paddingY: number;
    radius: number;
  };
  logoMaxWidth: number;
  logoMaxHeight: number;
  contentGroupHeight: number;
  fitsVertically: boolean;
}

/**
 * Render result for a single format.
 */
export interface RenderResult {
  ratioId: string;
  label: string;
  width: number;
  height: number;
  contentLevel: ContentLevel;
  blob: Blob | null;
  thumbnailUrl: string | null;  // objectURL for preview
  status: 'pending' | 'rendering' | 'done' | 'error' | 'skipped';
  warnings: string[];
}

/**
 * Background cover-fit result for a target canvas.
 */
export interface BackgroundFitResult {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  offsetX: number;
  offsetY: number;
}
