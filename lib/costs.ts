/**
 * Estimated EUR costs per AI API operation.
 * Based on current API pricing (approximate, includes input + output tokens/images).
 */
export const AI_COSTS_EUR: Record<string, number> = {
  // Product Scenes
  "analyze-product": 0.005, // Gemini 2.0 Flash (cheap, text-only output)
  "generate-product-scene": 0.03, // Gemini 3 Pro Image
  "generate-product-scene-vertex": 0.04, // Vertex AI Imagen
  "generate-background": 0.03, // Gemini 3 Pro Image
  "harmonize-composite": 0.03, // Gemini 3 Pro Image
  "generate-scene-prompts": 0.015, // Claude Sonnet 4

  // Social Graphics
  "generate-prompt": 0.015, // Claude Sonnet 4
  "generate-image": 0.03, // Gemini 3 Pro Image
  "generate-text": 0.015, // Claude Sonnet 4.5
};

/**
 * Model names for usage logging (human-readable).
 */
export const AI_MODELS: Record<string, string> = {
  "analyze-product": "gemini-2.0-flash",
  "generate-product-scene": "gemini-3-pro-image",
  "generate-product-scene-vertex": "vertex-ai-imagen",
  "generate-background": "gemini-3-pro-image",
  "harmonize-composite": "gemini-3-pro-image",
  "generate-scene-prompts": "claude-sonnet-4",
  "generate-prompt": "claude-sonnet-4",
  "generate-image": "gemini-3-pro-image",
  "generate-text": "claude-sonnet-4.5",
};
