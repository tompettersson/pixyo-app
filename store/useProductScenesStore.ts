'use client';

import { create } from 'zustand';

// Product image state
export interface ProductImage {
  data: string;      // Base64 encoded image data (without data URL prefix)
  mimeType: string;  // image/png, image/jpeg, image/webp
  previewUrl: string; // Full data URL for preview
  label?: string;    // Optional label like "Frontal", "Seitlich", "Rückseite"
}

// Multi-view slot labels (German)
export const PRODUCT_VIEW_LABELS = ['Hauptansicht', 'Zusatzansicht 1', 'Zusatzansicht 2'] as const;
export type ProductViewSlot = 0 | 1 | 2;

// Reference background image state
export interface ReferenceImage {
  data: string;      // Base64 encoded image data (without data URL prefix)
  mimeType: string;  // image/png, image/jpeg, image/webp
  previewUrl: string; // Full data URL for preview
}

// Generated scene result
export interface GeneratedScene {
  id: string;
  url: string;
  prompt: string;
  createdAt: Date;
  mode: 'oneshot' | 'compositing' | 'floorplan'; // Which mode generated this
}

// Product transform for compositing
export interface ProductTransform {
  x: number;      // X position (0-1, relative to canvas)
  y: number;      // Y position (0-1, relative to canvas)
  scale: number;  // Scale factor
  rotation: number; // Rotation in degrees
}

// Compositing-specific state
export interface CompositingState {
  productWithoutBg: string | null;  // Data URL of product with removed background
  generatedBackground: string | null; // Data URL of AI-generated background (no product)
  productTransform: ProductTransform;
  shadowIntensity: number;  // 0-1
  shadowBlur: number;       // pixels
  shadowOffsetY: number;    // pixels
  lightingOverlay: number;  // 0-1, intensity of lighting adjustment
  colorTint: number;        // -1 (cool/blue) to +1 (warm/orange), 0 = neutral
}

// Lens type for background generation - should match product photo's perspective
export type LensType = 'wide' | 'normal' | 'tele';

// Product Analysis result from AI - SIMPLIFIED
// Only contains essential info: focal length, product type, placement, rooms
export interface ProductAnalysis {
  analysis_version: string;
  confidence_overall: 'low' | 'medium' | 'high';
  camera: {
    focal_length: {
      estimated_mm: number;
      category: 'wide' | 'normal' | 'light_telephoto' | 'telephoto';
      confidence: 'low' | 'medium' | 'high';
    };
  };
  product: {
    category: string;
    type: string;
    type_german: string;
    brand?: string;
  };
  placement: {
    vertical_position: 'floor' | 'low_furniture' | 'table_height' | 'shelf' | 'counter' | 'wall_mounted';
    surface_type: string;
  };
  environment: {
    primary_rooms: string[];
    primary_rooms_german: string[];
    outdoor_suitable: boolean;
  };
}

// Store state interface
interface ProductScenesState {
  // Mode toggle
  mode: 'oneshot' | 'compositing' | 'floorplan';

  // Protected mode for oneshot (overlay original product after generation)
  protectedMode: boolean;

  // Product (single image - backward compatible)
  productImage: ProductImage | null;

  // Multi-view product images (1-3 images for better fidelity)
  productImages: ProductImage[];

  // Product Analysis (auto-extracted from image)
  productAnalysis: ProductAnalysis | null;
  isAnalyzing: boolean;

  // Background prompt
  backgroundPrompt: string;

  // Reference background image (optional)
  referenceImage: ReferenceImage | null;

  // Lens type for background (should match product photo)
  lensType: LensType;

  // Generation states
  isGenerating: boolean;
  isRemovingBackground: boolean;
  isApplyingProtection: boolean; // For protected mode post-processing
  generationError: string | null;

  // Results (shared between modes)
  generatedScenes: GeneratedScene[];
  activeSceneId: string | null;

  // Aspect ratio
  aspectRatio: '1:1' | '4:3' | '16:9' | '9:16';

  // Image resolution
  imageSize: '1K' | '2K' | '4K';

  // Product scale adjustment (-2 to +2, 0 = default)
  productScaleLevel: number;

  // Compositing-specific state
  compositing: CompositingState;
}

// Store actions interface
interface ProductScenesActions {
  // Mode
  setMode: (mode: 'oneshot' | 'compositing' | 'floorplan') => void;
  setProtectedMode: (enabled: boolean) => void;

  // Product image (single - backward compatible)
  setProductImage: (image: ProductImage | null) => void;

  // Multi-view product images
  setProductImageAtSlot: (slot: ProductViewSlot, image: ProductImage | null) => void;
  clearProductImages: () => void;

  // Product Analysis
  setProductAnalysis: (analysis: ProductAnalysis | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;

  // Background prompt
  setBackgroundPrompt: (prompt: string) => void;

  // Reference image
  setReferenceImage: (image: ReferenceImage | null) => void;

  // Generation
  setIsGenerating: (isGenerating: boolean) => void;
  setIsRemovingBackground: (isRemoving: boolean) => void;
  setIsApplyingProtection: (isApplying: boolean) => void;
  setGenerationError: (error: string | null) => void;

  // Results
  addGeneratedScene: (scene: GeneratedScene) => void;
  setActiveScene: (sceneId: string | null) => void;
  clearScenes: () => void;

  // Aspect ratio
  setAspectRatio: (ratio: '1:1' | '4:3' | '16:9' | '9:16') => void;

  // Image resolution
  setImageSize: (size: '1K' | '2K' | '4K') => void;

  // Lens type
  setLensType: (lens: LensType) => void;

  // Product scale
  setProductScaleLevel: (level: number) => void;
  adjustProductScale: (delta: number) => void;

  // Compositing actions
  setProductWithoutBg: (url: string | null) => void;
  setGeneratedBackground: (url: string | null) => void;
  setProductTransform: (transform: Partial<ProductTransform>) => void;
  setShadowSettings: (settings: { intensity?: number; blur?: number; offsetY?: number }) => void;
  setLightingOverlay: (intensity: number) => void;
  setColorTint: (tint: number) => void;
  resetCompositingState: () => void;

  // Reset
  reset: () => void;
}

// Default product transform
const defaultProductTransform: ProductTransform = {
  x: 0.5,      // Center
  y: 0.6,      // Slightly below center
  scale: 0.6,  // 60% of canvas size
  rotation: 0,
};

// Default compositing state
const defaultCompositingState: CompositingState = {
  productWithoutBg: null,
  generatedBackground: null,
  productTransform: defaultProductTransform,
  shadowIntensity: 0,    // Default OFF - Google generates better shadows
  shadowBlur: 30,
  shadowOffsetY: 20,
  lightingOverlay: 0,
  colorTint: 0,  // Neutral
};

// Initial state
const initialState: ProductScenesState = {
  mode: 'oneshot',
  protectedMode: true, // Default ON - preserves original product pixels
  productImage: null,
  productImages: [],
  productAnalysis: null,
  isAnalyzing: false,
  backgroundPrompt: '',
  referenceImage: null,
  lensType: 'normal', // Default: 50mm equivalent, natural perspective
  isGenerating: false,
  isRemovingBackground: false,
  isApplyingProtection: false,
  generationError: null,
  generatedScenes: [],
  activeSceneId: null,
  aspectRatio: '1:1',
  imageSize: '2K',
  productScaleLevel: 0,
  compositing: defaultCompositingState,
};

// Create the store
export const useProductScenesStore = create<ProductScenesState & ProductScenesActions>()((set) => ({
  ...initialState,

  // Mode
  setMode: (mode) => set({ mode }),
  setProtectedMode: (protectedMode) => set({ protectedMode }),

  // Product image (single - backward compatible, also updates slot 0)
  setProductImage: (productImage) => set((state) => ({
    productImage,
    productImages: productImage
      ? [{ ...productImage, label: PRODUCT_VIEW_LABELS[0] }, ...state.productImages.slice(1)]
      : [],
    productAnalysis: null,
  })),

  // Multi-view product images
  setProductImageAtSlot: (slot, image) => set((state) => {
    const newImages = [...state.productImages];

    if (image) {
      // Ensure array is large enough
      while (newImages.length <= slot) {
        newImages.push(null as unknown as ProductImage);
      }
      newImages[slot] = { ...image, label: PRODUCT_VIEW_LABELS[slot] };
    } else {
      // Remove image at slot
      if (slot < newImages.length) {
        newImages.splice(slot, 1);
      }
    }

    // Filter out null entries and update productImage for backward compatibility
    const filteredImages = newImages.filter(Boolean);
    return {
      productImages: filteredImages,
      productImage: filteredImages[0] || null,
      productAnalysis: slot === 0 ? null : state.productAnalysis, // Reset analysis only if primary image changed
    };
  }),

  clearProductImages: () => set({ productImages: [], productImage: null, productAnalysis: null }),

  // Product Analysis
  setProductAnalysis: (productAnalysis) => set({ productAnalysis }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  // Background prompt
  setBackgroundPrompt: (backgroundPrompt) => set({ backgroundPrompt }),

  // Reference image
  setReferenceImage: (referenceImage) => set({ referenceImage }),

  // Generation
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIsRemovingBackground: (isRemovingBackground) => set({ isRemovingBackground }),
  setIsApplyingProtection: (isApplyingProtection) => set({ isApplyingProtection }),
  setGenerationError: (generationError) => set({ generationError }),

  // Results
  addGeneratedScene: (scene) =>
    set((state) => ({
      generatedScenes: [scene, ...state.generatedScenes],
      activeSceneId: scene.id,
    })),

  setActiveScene: (activeSceneId) => set({ activeSceneId }),

  clearScenes: () => set({ generatedScenes: [], activeSceneId: null }),

  // Aspect ratio
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),

  // Image resolution
  setImageSize: (imageSize) => set({ imageSize }),

  // Lens type
  setLensType: (lensType) => set({ lensType }),

  // Product scale (-2 to +2)
  setProductScaleLevel: (productScaleLevel) => set({ productScaleLevel: Math.max(-2, Math.min(2, productScaleLevel)) }),
  adjustProductScale: (delta) => set((state) => ({
    productScaleLevel: Math.max(-2, Math.min(2, state.productScaleLevel + delta)),
  })),

  // Compositing actions
  setProductWithoutBg: (productWithoutBg) =>
    set((state) => ({
      compositing: { ...state.compositing, productWithoutBg },
    })),

  setGeneratedBackground: (generatedBackground) =>
    set((state) => ({
      compositing: { ...state.compositing, generatedBackground },
    })),

  setProductTransform: (transform) =>
    set((state) => ({
      compositing: {
        ...state.compositing,
        productTransform: { ...state.compositing.productTransform, ...transform },
      },
    })),

  setShadowSettings: (settings) =>
    set((state) => ({
      compositing: {
        ...state.compositing,
        ...(settings.intensity !== undefined && { shadowIntensity: settings.intensity }),
        ...(settings.blur !== undefined && { shadowBlur: settings.blur }),
        ...(settings.offsetY !== undefined && { shadowOffsetY: settings.offsetY }),
      },
    })),

  setLightingOverlay: (lightingOverlay) =>
    set((state) => ({
      compositing: { ...state.compositing, lightingOverlay },
    })),

  setColorTint: (colorTint) =>
    set((state) => ({
      compositing: { ...state.compositing, colorTint: Math.max(-1, Math.min(1, colorTint)) },
    })),

  resetCompositingState: () =>
    set((state) => ({
      compositing: defaultCompositingState,
    })),

  // Reset
  reset: () => set(initialState),
}));
