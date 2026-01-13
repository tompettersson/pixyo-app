// Customer/Profile types for the multi-customer design editor

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
}

// Design types
export interface DesignCanvasState {
  width: number;
  height: number;
  aspectRatio: string;
  backgroundColor: string;
}

// Content state for text elements
export interface DesignContent {
  tagline: string;
  headline: string;
  body: string;
  buttonText: string;
  showButton: boolean; // Toggle for CTA button visibility
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
  type: 'none' | 'gradient' | 'halftone' | 'grain' | 'duotone' | 'diagonal-stripes' | 'scanlines' | 'mesh-gradient';
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
