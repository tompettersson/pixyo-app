export interface StylePreset {
  id: string;
  label: string;
  mode: 'photo' | 'illustration';
  promptDirectives: string;
  typography: {
    defaultFont: string;
    headingSizePx: number;
    textColor: string;
  };
  layoutHints: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  // Photo styles
  {
    id: 'cinematic',
    label: 'Cinematic Photo',
    mode: 'photo',
    promptDirectives: 'cinematic photography, dramatic lighting, shallow depth of field, film grain, anamorphic lens flare, professional color grading',
    typography: {
      defaultFont: 'Playfair Display',
      headingSizePx: 56,
      textColor: '#ffffff',
    },
    layoutHints: 'Dark, moody atmosphere with dramatic shadows. Leave space for text in less detailed areas.',
  },
  {
    id: 'editorial',
    label: 'Editorial Fashion',
    mode: 'photo',
    promptDirectives: 'high-end editorial photography, studio lighting, clean composition, fashion magazine aesthetic, professional retouching',
    typography: {
      defaultFont: 'Bebas Neue',
      headingSizePx: 64,
      textColor: '#ffffff',
    },
    layoutHints: 'Clean, minimalist backgrounds. Strong subject focus with ample negative space for headlines.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    mode: 'photo',
    promptDirectives: 'natural lifestyle photography, warm golden hour lighting, authentic candid moments, soft focus background, warm color palette',
    typography: {
      defaultFont: 'Poppins',
      headingSizePx: 48,
      textColor: '#2d2d2d',
    },
    layoutHints: 'Warm, inviting atmosphere. Soft backgrounds suitable for overlaid text.',
  },
  {
    id: 'product',
    label: 'Product Shot',
    mode: 'photo',
    promptDirectives: 'professional product photography, clean white or gradient background, perfect lighting, sharp focus, commercial quality',
    typography: {
      defaultFont: 'Inter',
      headingSizePx: 42,
      textColor: '#1a1a1a',
    },
    layoutHints: 'Clean, distraction-free background. Product centered with space around for text.',
  },
  // Illustration styles
  {
    id: 'flat',
    label: 'Flat Illustration',
    mode: 'illustration',
    promptDirectives: 'flat design illustration, minimal shapes, bold colors, geometric style, vector art aesthetic, no gradients',
    typography: {
      defaultFont: 'Space Grotesk',
      headingSizePx: 52,
      textColor: '#ffffff',
    },
    layoutHints: 'Simple, bold color blocks. Clear areas for text placement.',
  },
  {
    id: 'modern-3d',
    label: 'Modern 3D',
    mode: 'illustration',
    promptDirectives: '3D render illustration, soft gradients, floating objects, pastel colors, smooth surfaces, studio lighting, clay render style',
    typography: {
      defaultFont: 'Poppins',
      headingSizePx: 48,
      textColor: '#333333',
    },
    layoutHints: 'Soft, dimensional feel with gradient backgrounds. Space for text in empty areas.',
  },
  {
    id: 'line-art',
    label: 'Line Art',
    mode: 'illustration',
    promptDirectives: 'minimalist line art illustration, single continuous line, black ink on white, elegant simplicity, hand-drawn feel',
    typography: {
      defaultFont: 'Playfair Display',
      headingSizePx: 44,
      textColor: '#1a1a1a',
    },
    layoutHints: 'Clean white background with delicate line work. Plenty of white space for text.',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    mode: 'illustration',
    promptDirectives: 'watercolor illustration, soft washes, organic textures, flowing colors, artistic brushstrokes, dreamy atmosphere',
    typography: {
      defaultFont: 'Lora',
      headingSizePx: 46,
      textColor: '#2d2d2d',
    },
    layoutHints: 'Soft, organic textures with areas of lighter washes suitable for text overlay.',
  },
];

// Get presets by mode
export const getPresetsByMode = (mode: 'photo' | 'illustration'): StylePreset[] => {
  return STYLE_PRESETS.filter((preset) => preset.mode === mode);
};

// Get preset by ID
export const getPresetById = (id: string): StylePreset | undefined => {
  return STYLE_PRESETS.find((preset) => preset.id === id);
};

// Available fonts list (for font picker)
export const AVAILABLE_FONTS = [
  { value: 'Inter', label: 'Inter', category: 'sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'sans-serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'sans-serif' },
  { value: 'Bebas Neue', label: 'Bebas Neue', category: 'display' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'serif' },
  { value: 'Lora', label: 'Lora', category: 'serif' },
  { value: 'Oswald', label: 'Oswald', category: 'sans-serif' },
];



