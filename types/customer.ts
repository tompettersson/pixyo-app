// Customer/Profile types for the multi-customer design editor

// Scene preset configuration for Product Scenes tool
export interface ScenePreset {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export interface SceneCategory {
  id: string;
  label: string;
  presets: ScenePreset[];
}

export interface SceneConfig {
  categories: SceneCategory[];
}

export interface CustomerColors {
  dark: string;
  light: string;
  accent: string;
}

export interface CustomerFont {
  family: string;
  weight: string;
  uppercase?: boolean;
}

export interface CustomerFonts {
  headline: CustomerFont;
  body: CustomerFont;
}

export interface CustomerLogoVariants {
  dark: string;
  light: string;
}

export interface CustomerLayout {
  padding: { top: number; right: number; bottom: number; left: number };
  gaps: { taglineToHeadline: number; headlineToBody: number; bodyToButton: number };
  button: { radius: number; paddingX: number; paddingY: number };
}

export interface Customer {
  id: string;
  slug: string;
  name: string;
  logo: string;
  logoVariants: CustomerLogoVariants | null;
  colors: CustomerColors;
  fonts: CustomerFonts;
  layout: CustomerLayout;
  systemPrompt: string;
  designTokens?: import('@/types/designTokens').DesignTokens | null;
  sceneConfig?: SceneConfig | null;
}

// Design types
export interface DesignCanvasState {
  width: number;
  height: number;
  aspectRatio: string;
  backgroundColor: string;
}

// Text shadow presets (re-export from layers for convenience)
export type { TextShadowPreset } from './layers';

// Content state for text elements
export interface DesignContent {
  tagline: string;
  headline: string;
  headlineSize: number; // Font size for headline (default: 112, range: 48–160)
  body: string;
  bodySize?: number; // Font size for body text (default: 32, range: 16–64)
  bodyWeight?: number; // Font weight for body text (default: 400, range: 300–700)
  bodyShadowEnabled?: boolean;
  bodyShadowPreset?: import('./layers').TextShadowPreset;
  bodyBgEnabled?: boolean;
  bodyBgColor?: string;
  bodyBgOpacity?: number;
  buttonText: string;
  showButton: boolean; // Toggle for CTA button visibility
  // Sale badge
  saleBadgeEnabled?: boolean;
  saleBadgePercent?: number;  // e.g., 20, 50
  saleBadgeLabel?: string;    // e.g., "Sale", "Rabatt", "Reduziert"
  saleBadgeSize?: number;     // radius in px (default 110, range 60–160)
  saleBadgeTextScale?: number; // text size multiplier in % (default 100, range 50–200)
  saleBadgeColor?: string;    // hex color (default #d93025, classic red)
  saleBadgeX?: number;        // x position 0–100 (% of canvas width, default 85)
  saleBadgeY?: number;        // y position 0–100 (% of canvas height, default 15)
}

// Background image state
export interface DesignBackgroundImage {
  url: string;
  source: 'GENERATED' | 'UNSPLASH';
  credit?: {
    name: string;
    username: string;
    link: string;
  };
  transform: {
    scale: number;
    positionX: number;
    positionY: number;
    flipX: boolean;
  };
}

// Overlay settings - must match OverlayType from lib/overlayEffects.ts
export interface DesignOverlay {
  type: 'none' | 'solid' | 'gradient' | 'halftone' | 'grain' | 'duotone' | 'diagonal-stripes' | 'scanlines' | 'mesh-gradient';
  mode: 'darken' | 'lighten';
  intensity: number;
}

// Product image for Gemini Image-to-Image generation
export interface DesignProductImage {
  data: string;      // Base64 encoded image data
  mimeType: string;  // image/png, image/jpeg, image/webp
}

export interface Design {
  id: string;
  profileId: string;
  name: string;
  thumbnailUrl: string | null;
  canvasState: DesignCanvasState;
  layers: unknown[]; // Layer[] from types/layers.ts
  overlayOpacity: number;
  content: DesignContent;
  // Complete visual state
  backgroundImage: DesignBackgroundImage | null;
  overlay: DesignOverlay;
  productImage: DesignProductImage | null; // For Gemini Image-to-Image
  createdAt: string;
  updatedAt: string;
}
