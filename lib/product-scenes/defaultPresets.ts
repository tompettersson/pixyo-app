import type { SceneCategory } from '@/types/customer';

/**
 * Default scene categories used when a profile has no custom sceneConfig.
 * Extracted from the original hardcoded presets in BackgroundPrompt.tsx.
 */
export const DEFAULT_SCENE_CATEGORIES: SceneCategory[] = [
  {
    id: 'style',
    label: 'Innenarchitektur-Stil',
    presets: [
      { id: 'none', label: 'Neutral', icon: '○', prompt: '' },
      {
        id: 'mediterranean',
        label: 'Mediterran',
        icon: '🌊',
        prompt: 'Mediterranean style with warm terracotta tones, natural stone textures, olive wood accents, soft linen fabrics, and warm sunlight streaming through arched windows',
      },
      {
        id: 'scandinavian',
        label: 'Skandinavisch',
        icon: '🌲',
        prompt: 'Scandinavian style with light oak wood, white walls, minimal decor, cozy hygge atmosphere, natural textiles, and soft diffused daylight',
      },
      {
        id: 'industrial',
        label: 'Industrial',
        icon: '🏭',
        prompt: 'Industrial loft style with exposed brick walls, metal accents, polished concrete floors, Edison bulb lighting, and raw urban textures',
      },
      {
        id: 'midcentury',
        label: 'Mid-Century',
        icon: '🪑',
        prompt: 'Mid-century modern style with walnut furniture, organic curved shapes, muted earth tones, iconic statement lighting, and warm retro atmosphere',
      },
      {
        id: 'luxury',
        label: 'Luxus',
        icon: '✨',
        prompt: 'Luxury hotel style with high-end marble finishes, velvet textures, subtle gold accents, dramatic mood lighting, and sophisticated elegance',
      },
      {
        id: 'country',
        label: 'Landhaus',
        icon: '🏡',
        prompt: 'Country house style with rustic reclaimed wood beams, natural stone walls, linen curtains, dried flower arrangements, warm candlelight, and cozy farmhouse charm',
      },
      {
        id: 'colonial',
        label: 'Kolonial',
        icon: '🌴',
        prompt: 'Colonial style with dark hardwood furniture, rattan and wicker accents, tropical plants, ceiling fans, warm amber lighting, brass hardware, and elegant plantation atmosphere',
      },
      {
        id: 'shabbychic',
        label: 'Shabby Chic',
        icon: '🌸',
        prompt: 'Shabby chic style with distressed painted white furniture, vintage floral fabrics, pastel color palette, antique mirrors, soft romantic lighting, and charming imperfections',
      },
    ],
  },
  {
    id: 'room',
    label: 'Raum',
    presets: [
      { id: 'none', label: 'Keiner', icon: '○', prompt: '' },
      { id: 'living', label: 'Wohnzimmer', icon: '🛋️', prompt: 'in a modern living room' },
      { id: 'kitchen', label: 'Küche', icon: '🍳', prompt: 'in a bright kitchen' },
      { id: 'dining', label: 'Esszimmer', icon: '🍽️', prompt: 'in an elegant dining room' },
      { id: 'terrace', label: 'Terrasse', icon: '☀️', prompt: 'on a sunny terrace' },
      { id: 'garden', label: 'Garten', icon: '🌳', prompt: 'in a beautiful garden setting' },
      { id: 'office', label: 'Büro', icon: '💼', prompt: 'in a professional home office' },
    ],
  },
];
