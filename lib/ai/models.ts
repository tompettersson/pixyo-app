// Centralized image generation model definitions

export const IMAGE_MODELS = {
  pro: {
    id: 'gemini-3-pro-image-preview',
    label: 'Profi',
    costEur: 0.03,
  },
  flash: {
    id: 'gemini-3.1-flash-image-preview',
    label: 'Schnell',
    costEur: 0.015,
  },
} as const;

export type ImageModelKey = keyof typeof IMAGE_MODELS;

/** Resolve a model key to the Gemini model ID */
export function resolveImageModelId(key?: ImageModelKey): string {
  return IMAGE_MODELS[key ?? 'pro'].id;
}
