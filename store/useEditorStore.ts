'use client';

import { create } from 'zustand';
import { temporal } from 'zundo';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { TemporalState } from 'zundo';
import type { Layer, BackgroundLayer, TextLayer, LogoLayer } from '@/types/layers';
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from '@/types/layers';
import type { GeneratedImage } from '@/types/api';
import type { Customer, Design, DesignContent, DesignBackgroundImage, DesignOverlay, DesignProductImage } from '@/types/customer';

// Canvas state interface
interface CanvasState {
  width: number;
  height: number;
  aspectRatio: string;
  backgroundColor: string;
}

// Customer state interface
interface CustomerState {
  customers: Customer[];
  activeCustomerId: string | null;
  isLoadingCustomers: boolean;
}

// Design state interface
interface DesignState {
  designs: Design[];
  activeDesignId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isLoadingDesigns: boolean;
  isLoadingDesign: boolean; // Blocks autosave while design is being loaded
  lastSavedAt: Date | null;
}

// Default overlay state
const defaultOverlay: DesignOverlay = {
  type: 'gradient',
  mode: 'darken',
  intensity: 0.7,
};

// Editor state interface
interface EditorState {
  // Canvas
  canvas: CanvasState;

  // Layers
  layers: Layer[];
  selectedLayerId: string | null;

  // Overlay (legacy - now using designOverlay)
  overlayOpacity: number;

  // NEW: Complete visual state per design
  backgroundImageState: DesignBackgroundImage | null;
  designOverlay: DesignOverlay;
  productImageState: DesignProductImage | null;

  // Content (text elements)
  content: DesignContent;

  // Generated images history
  generatedImages: GeneratedImage[];

  // Prompt state
  currentPrompt: string;
  isGeneratingPrompt: boolean;
  isGeneratingImage: boolean;

  // Customer & Design state
  customer: CustomerState;
  design: DesignState;
}

// Editor actions interface
interface EditorActions {
  // Canvas actions
  setAspectRatio: (ratio: string) => void;
  setBackgroundColor: (color: string) => void;

  // Layer actions
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  duplicateLayer: (id: string) => void;

  // Background actions
  setBackgroundImage: (src: string, width: number, height: number) => void;
  clearBackgroundImage: () => void;

  // Overlay actions
  setOverlayOpacity: (opacity: number) => void;

  // Text layer helpers
  addTextLayer: (text?: string) => void;

  // Logo layer helpers
  addLogoLayer: (src: string, width: number, height: number, isSvg?: boolean) => void;

  // Generated images
  addGeneratedImage: (image: GeneratedImage) => void;
  clearGeneratedImages: () => void;

  // Prompt state
  setCurrentPrompt: (prompt: string) => void;
  setIsGeneratingPrompt: (value: boolean) => void;
  setIsGeneratingImage: (value: boolean) => void;

  // Content actions
  setContent: (content: Partial<DesignContent>) => void;

  // NEW: Background image state actions
  setBackgroundImageState: (state: DesignBackgroundImage | null) => void;
  updateBackgroundTransform: (transform: Partial<DesignBackgroundImage['transform']>) => void;

  // NEW: Overlay state actions
  setDesignOverlay: (overlay: Partial<DesignOverlay>) => void;

  // NEW: Product image actions
  setProductImage: (image: DesignProductImage | null) => void;

  // Reset
  resetEditor: () => void;

  // Customer actions
  setCustomers: (customers: Customer[]) => void;
  setActiveCustomer: (customerId: string) => void;
  setIsLoadingCustomers: (loading: boolean) => void;

  // Design actions
  setDesigns: (designs: Design[]) => void;
  setActiveDesign: (designId: string | null) => void;
  loadDesignIntoEditor: (design: Design) => void;
  markDirty: () => void;
  markClean: () => void;
  setIsSaving: (saving: boolean) => void;
  setIsLoadingDesigns: (loading: boolean) => void;
  addDesign: (design: Design) => void;
  updateDesignInList: (designId: string, updates: Partial<Design>) => void;
  removeDesignFromList: (designId: string) => void;

  // Helper to get current editor state for saving
  getDesignState: () => {
    canvasState: CanvasState;
    layers: Layer[];
    overlayOpacity: number;
    content: DesignContent;
    backgroundImage: DesignBackgroundImage | null;
    overlay: DesignOverlay;
    productImage: DesignProductImage | null;
  };
}

// Generate unique ID
const generateId = () => `layer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Get canvas dimensions from aspect ratio
const getCanvasDimensions = (ratio: string): { width: number; height: number } => {
  const config = ASPECT_RATIOS[ratio] || ASPECT_RATIOS[DEFAULT_ASPECT_RATIO];
  return { width: config.width, height: config.height };
};

// Default content
const defaultContent: DesignContent = {
  tagline: 'JETZT NEU',
  headline: 'Deine große Überschrift hier',
  headlineSize: 112, // Default headline font size (matches LAYOUT.headlineSize)
  body: 'Hier kommt dein Fließtext. Er kann mehrere Zeilen umfassen und wird automatisch umgebrochen.',
  buttonText: 'MEHR ERFAHREN',
  showButton: false, // Default: Button hidden for social media
};

// Initial state
const initialState: EditorState = {
  canvas: {
    ...getCanvasDimensions(DEFAULT_ASPECT_RATIO),
    aspectRatio: DEFAULT_ASPECT_RATIO,
    backgroundColor: '#1a1a1a',
  },
  layers: [],
  selectedLayerId: null,
  overlayOpacity: 0,
  // NEW: Complete visual state
  backgroundImageState: null,
  designOverlay: defaultOverlay,
  productImageState: null,
  content: defaultContent,
  generatedImages: [],
  currentPrompt: '',
  isGeneratingPrompt: false,
  isGeneratingImage: false,
  customer: {
    customers: [],
    activeCustomerId: null,
    isLoadingCustomers: false,
  },
  design: {
    designs: [],
    activeDesignId: null,
    isDirty: false,
    isSaving: false,
    isLoadingDesigns: false,
    isLoadingDesign: false,
    lastSavedAt: null,
  },
};

// Create the store with temporal (undo/redo) middleware
export const useEditorStore = create<EditorState & EditorActions>()(
  temporal(
    (set, get) => ({
      ...initialState,

      // Canvas actions
      setAspectRatio: (ratio: string) => {
        const dimensions = getCanvasDimensions(ratio);
        set((state) => ({
          canvas: {
            ...state.canvas,
            ...dimensions,
            aspectRatio: ratio,
          },
        }));
      },

      setBackgroundColor: (color: string) => {
        set((state) => ({
          canvas: { ...state.canvas, backgroundColor: color },
        }));
      },

      // Layer actions
      addLayer: (layer: Layer) => {
        set((state) => ({
          layers: [...state.layers, layer],
        }));
      },

      updateLayer: (id: string, updates: Partial<Layer>) => {
        set((state) => ({
          layers: state.layers.map((layer) =>
            layer.id === id ? ({ ...layer, ...updates } as Layer) : layer
          ),
        }));
      },

      removeLayer: (id: string) => {
        set((state) => ({
          layers: state.layers.filter((layer) => layer.id !== id),
          selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        }));
      },

      selectLayer: (id: string | null) => {
        set({ selectedLayerId: id });
      },

      moveLayer: (id: string, direction: 'up' | 'down') => {
        set((state) => {
          const layers = [...state.layers];
          const index = layers.findIndex((l) => l.id === id);
          if (index === -1) return state;

          const newIndex = direction === 'up' ? index + 1 : index - 1;
          if (newIndex < 0 || newIndex >= layers.length) return state;

          // Swap layers
          [layers[index], layers[newIndex]] = [layers[newIndex], layers[index]];
          return { layers };
        });
      },

      duplicateLayer: (id: string) => {
        const state = get();
        const layer = state.layers.find((l) => l.id === id);
        if (!layer) return;

        const newLayer = {
          ...layer,
          id: generateId(),
          x: layer.x + 20,
          y: layer.y + 20,
        };
        set((state) => ({
          layers: [...state.layers, newLayer],
          selectedLayerId: newLayer.id,
        }));
      },

      // Background actions
      setBackgroundImage: (src: string, width: number, height: number) => {
        const state = get();
        const canvasRatio = state.canvas.width / state.canvas.height;
        const imageRatio = width / height;

        // Calculate scale to cover the canvas
        let scaleX = 1;
        let scaleY = 1;
        if (imageRatio > canvasRatio) {
          // Image is wider, scale by height
          scaleY = state.canvas.height / height;
          scaleX = scaleY;
        } else {
          // Image is taller, scale by width
          scaleX = state.canvas.width / width;
          scaleY = scaleX;
        }

        const backgroundLayer: BackgroundLayer = {
          id: 'background',
          type: 'background',
          src,
          x: (state.canvas.width - width * scaleX) / 2,
          y: (state.canvas.height - height * scaleY) / 2,
          width,
          height,
          scaleX,
          scaleY,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: true,
        };

        set((state) => ({
          layers: [
            backgroundLayer,
            ...state.layers.filter((l) => l.type !== 'background'),
          ],
        }));
      },

      clearBackgroundImage: () => {
        set((state) => ({
          layers: state.layers.filter((l) => l.type !== 'background'),
        }));
      },

      // Overlay actions
      setOverlayOpacity: (opacity: number) => {
        set({ overlayOpacity: Math.max(0, Math.min(100, opacity)) });
      },

      // Text layer helpers
      addTextLayer: (text: string = 'Dein Text') => {
        const state = get();
        const textLayer: TextLayer = {
          id: generateId(),
          type: 'text',
          text,
          x: state.canvas.width / 2,
          y: state.canvas.height / 2,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 'bold',
          fill: '#ffffff',
          align: 'center',
          lineHeight: 1.2,
        };
        set((state) => ({
          layers: [...state.layers, textLayer],
          selectedLayerId: textLayer.id,
        }));
      },

      // Logo layer helpers
      addLogoLayer: (src: string, width: number, height: number, isSvg: boolean = false) => {
        const state = get();
        // Scale down if larger than 200px
        const maxSize = 200;
        let scale = 1;
        if (width > maxSize || height > maxSize) {
          scale = maxSize / Math.max(width, height);
        }

        const logoLayer: LogoLayer = {
          id: generateId(),
          type: 'logo',
          src,
          x: state.canvas.width - 100,
          y: state.canvas.height - 100,
          width,
          height,
          scaleX: scale,
          scaleY: scale,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          isSvg,
          backgroundShape: 'none',
          backgroundPadding: 10,
        };
        set((state) => ({
          layers: [...state.layers, logoLayer],
          selectedLayerId: logoLayer.id,
        }));
      },

      // Generated images
      addGeneratedImage: (image: GeneratedImage) => {
        set((state) => ({
          generatedImages: [image, ...state.generatedImages],
        }));
      },

      clearGeneratedImages: () => {
        set({ generatedImages: [] });
      },

      // Prompt state
      setCurrentPrompt: (prompt: string) => {
        set({ currentPrompt: prompt });
      },

      setIsGeneratingPrompt: (value: boolean) => {
        set({ isGeneratingPrompt: value });
      },

      setIsGeneratingImage: (value: boolean) => {
        set({ isGeneratingImage: value });
      },

      // Content actions
      setContent: (updates: Partial<DesignContent>) => {
        set((state) => ({
          content: { ...state.content, ...updates },
        }));
      },

      // NEW: Background image state actions
      setBackgroundImageState: (backgroundImageState: DesignBackgroundImage | null) => {
        set({ backgroundImageState });
      },

      updateBackgroundTransform: (transform: Partial<DesignBackgroundImage['transform']>) => {
        set((state) => {
          if (!state.backgroundImageState) return state;
          return {
            backgroundImageState: {
              ...state.backgroundImageState,
              transform: { ...state.backgroundImageState.transform, ...transform },
            },
          };
        });
      },

      // NEW: Overlay state actions
      setDesignOverlay: (overlay: Partial<DesignOverlay>) => {
        set((state) => ({
          designOverlay: { ...state.designOverlay, ...overlay },
        }));
      },

      // NEW: Product image actions
      setProductImage: (productImageState: DesignProductImage | null) => {
        set({ productImageState });
      },

      // Reset
      resetEditor: () => {
        set(initialState);
      },

      // Customer actions
      setCustomers: (customers: Customer[]) => {
        set((state) => ({
          customer: { ...state.customer, customers },
        }));
      },

      setActiveCustomer: (customerId: string) => {
        set((state) => ({
          customer: { ...state.customer, activeCustomerId: customerId },
        }));
      },

      setIsLoadingCustomers: (loading: boolean) => {
        set((state) => ({
          customer: { ...state.customer, isLoadingCustomers: loading },
        }));
      },

      // Design actions
      setDesigns: (designs: Design[]) => {
        set((state) => ({
          design: { ...state.design, designs },
        }));
      },

      setActiveDesign: (designId: string | null) => {
        set((state) => ({
          design: { ...state.design, activeDesignId: designId },
        }));
      },

      loadDesignIntoEditor: (design: Design) => {
        // SCHRITT 1: Flag setzen BEVOR state geändert wird (blockiert Autosave)
        set((state) => ({
          design: { ...state.design, isLoadingDesign: true },
        }));

        // SCHRITT 2: Design-State laden
        const canvasState = design.canvasState as CanvasState;
        const layers = design.layers as Layer[];
        const content = { ...defaultContent, ...(design.content as Partial<DesignContent>) };
        // NEW: Load complete visual state
        const backgroundImageState = design.backgroundImage as DesignBackgroundImage | null;
        const overlay = (design.overlay as DesignOverlay) || defaultOverlay;
        const productImageState = design.productImage as DesignProductImage | null;

        set({
          canvas: canvasState,
          layers: layers,
          overlayOpacity: design.overlayOpacity,
          content: content,
          // NEW: Set complete visual state
          backgroundImageState: backgroundImageState,
          designOverlay: overlay,
          productImageState: productImageState,
          selectedLayerId: null,
        });

        // SCHRITT 3: Flag und dirty reset (verzögert für React-Batching)
        setTimeout(() => {
          set((state) => ({
            design: {
              ...state.design,
              activeDesignId: design.id,
              isLoadingDesign: false,
              isDirty: false,
            },
          }));
        }, 0);
      },

      markDirty: () => {
        set((state) => ({
          design: { ...state.design, isDirty: true },
        }));
      },

      markClean: () => {
        set((state) => ({
          design: { ...state.design, isDirty: false, lastSavedAt: new Date() },
        }));
      },

      setIsSaving: (saving: boolean) => {
        set((state) => ({
          design: { ...state.design, isSaving: saving },
        }));
      },

      setIsLoadingDesigns: (loading: boolean) => {
        set((state) => ({
          design: { ...state.design, isLoadingDesigns: loading },
        }));
      },

      addDesign: (design: Design) => {
        set((state) => ({
          design: {
            ...state.design,
            designs: [design, ...state.design.designs],
          },
        }));
      },

      updateDesignInList: (designId: string, updates: Partial<Design>) => {
        set((state) => ({
          design: {
            ...state.design,
            designs: state.design.designs.map((d) =>
              d.id === designId ? { ...d, ...updates } : d
            ),
          },
        }));
      },

      removeDesignFromList: (designId: string) => {
        set((state) => ({
          design: {
            ...state.design,
            designs: state.design.designs.filter((d) => d.id !== designId),
            activeDesignId:
              state.design.activeDesignId === designId
                ? null
                : state.design.activeDesignId,
          },
        }));
      },

      getDesignState: () => {
        const state = get();
        return {
          canvasState: state.canvas,
          layers: state.layers,
          overlayOpacity: state.overlayOpacity,
          content: state.content,
          // NEW: Include complete visual state
          backgroundImage: state.backgroundImageState,
          overlay: state.designOverlay,
          productImage: state.productImageState,
        };
      },
    }),
    {
      // Zundo options - limit history and exclude non-essential state
      limit: 50,
      partialize: (state) => {
        // Only track canvas and layers for undo/redo
        // Exclude customer, design, and generation state
        const {
          isGeneratingPrompt,
          isGeneratingImage,
          customer,
          design,
          ...rest
        } = state;
        return rest;
      },
    }
  )
);

// Type for the partialized state
type PartializedState = Omit<
  EditorState & EditorActions,
  'isGeneratingPrompt' | 'isGeneratingImage' | 'customer' | 'design'
>;

// Create a reactive hook for temporal store
export function useTemporalStore<T>(
  selector: (state: TemporalState<PartializedState>) => T
): T {
  return useStoreWithEqualityFn(useEditorStore.temporal, selector);
}
