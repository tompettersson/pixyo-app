/**
 * Preload local custom fonts for Canvas/Konva rendering.
 *
 * CSS @font-face alone only triggers a download when an HTML element
 * references the font. Canvas (Konva) needs the font already loaded
 * in the browser's font system before drawing. This utility forces
 * the browser to load all local custom fonts eagerly.
 */

// Local fonts registered via @font-face in globals.css
const LOCAL_FONTS: { family: string; weights: number[] }[] = [
  { family: 'Brown', weights: [300, 400, 700] },
  { family: 'Cera Pro', weights: [400, 700] },
];

let preloaded = false;

/**
 * Preload all local custom fonts. Safe to call multiple times.
 * Returns a promise that resolves when all fonts are loaded.
 */
export async function preloadLocalFonts(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (preloaded) return;
  preloaded = true;

  const promises: Promise<FontFace[]>[] = [];

  for (const { family, weights } of LOCAL_FONTS) {
    for (const weight of weights) {
      // document.fonts.load() triggers the browser to fetch the font
      // from the matching @font-face rule and returns when ready
      promises.push(
        document.fonts.load(`${weight} 16px "${family}"`)
      );
    }
  }

  try {
    await Promise.all(promises);
  } catch {
    // Font loading failures are non-critical — Canvas will use fallback
    console.warn('Some custom fonts failed to preload');
  }
}
