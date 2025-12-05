'use client';

import { create } from 'zustand';
import { temporal } from 'zundo';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { TemporalState } from 'zundo';
import type { Layer, BackgroundLayer, TextLayer, LogoLayer } from '@/types/layers';
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from '@/types/layers';
import type { GeneratedImage } from '@/types/api';

// Canvas state interface
interface CanvasState {
  width: number;
  height: number;
  aspectRatio: string;
  backgroundColor: string;
}

// Editor state interface
interface EditorState {
  // Canvas
  canvas: CanvasState;
  
  // Layers
  layers: Layer[];
  selectedLayerId: string | null;
  
  // Overlay
  overlayOpacity: number;
  
  // Generated images history
  generatedImages: GeneratedImage[];
  
  // Prompt state
  currentPrompt: string;
  isGeneratingPrompt: boolean;
  isGeneratingImage: boolean;
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
  
  // Reset
  resetEditor: () => void;
}

// Generate unique ID
const generateId = () => `layer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Get canvas dimensions from aspect ratio
const getCanvasDimensions = (ratio: string): { width: number; height: number } => {
  const config = ASPECT_RATIOS[ratio] || ASPECT_RATIOS[DEFAULT_ASPECT_RATIO];
  return { width: config.width, height: config.height };
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
  generatedImages: [],
  currentPrompt: '',
  isGeneratingPrompt: false,
  isGeneratingImage: false,
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
            layer.id === id ? { ...layer, ...updates } : layer
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

      // Reset
      resetEditor: () => {
        set(initialState);
      },
    }),
    {
      // Zundo options - limit history and exclude non-essential state
      limit: 50,
      partialize: (state) => {
        // Only track canvas and layers for undo/redo
        const { isGeneratingPrompt, isGeneratingImage, ...rest } = state;
        return rest;
      },
    }
  )
);

// Type for the partialized state
type PartializedState = Omit<EditorState & EditorActions, 'isGeneratingPrompt' | 'isGeneratingImage'>;

// Create a reactive hook for temporal store
export function useTemporalStore<T>(
  selector: (state: TemporalState<PartializedState>) => T
): T {
  return useStoreWithEqualityFn(useEditorStore.temporal, selector);
}
