// Base layer interface - all layers share these properties
export interface BaseLayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
}

export type LayerType = 'background' | 'image' | 'rect' | 'text' | 'logo';

// Background image layer
export interface BackgroundLayer extends BaseLayer {
  type: 'background';
  src: string;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
}

// Generic image layer
export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
}

// Rectangle layer (for overlays)
export interface RectLayer extends BaseLayer {
  type: 'rect';
  width: number;
  height: number;
  fill: string;
}

// Text layer
export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fill: string;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  maxWidth?: number;
}

// Logo layer (PNG or SVG)
export interface LogoLayer extends BaseLayer {
  type: 'logo';
  src: string;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  // SVG-specific properties
  isSvg: boolean;
  tintColor?: string;
  // Background shape for logo
  backgroundShape: 'none' | 'pill' | 'circle' | 'rect';
  backgroundColor?: string;
  backgroundPadding: number;
}

// Union type of all layers
export type Layer = BackgroundLayer | ImageLayer | RectLayer | TextLayer | LogoLayer;

// Aspect ratio configuration
export interface AspectRatioConfig {
  id: string;
  width: number;
  height: number;
  label: string;
}

// Available aspect ratios for social media
export const ASPECT_RATIOS: Record<string, AspectRatioConfig> = {
  '1:1': { id: '1:1', width: 1080, height: 1080, label: 'Square (Instagram Post)' },
  '4:5': { id: '4:5', width: 1080, height: 1350, label: 'Portrait (Instagram Feed)' },
  '9:16': { id: '9:16', width: 1080, height: 1920, label: 'Story (Instagram/TikTok)' },
  '16:9': { id: '16:9', width: 1920, height: 1080, label: 'Landscape (YouTube/LinkedIn)' },
};

// Default aspect ratio
export const DEFAULT_ASPECT_RATIO = '1:1';





