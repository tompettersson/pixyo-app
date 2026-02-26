/**
 * Preload local custom fonts for Canvas/Konva rendering.
 *
 * next/font/local registers fonts under auto-generated names (e.g. "brown", "ceraBasic").
 * Canvas/Konva uses human-readable names (e.g. "Brown", "Cera Basic").
 * This module bridges the gap by creating FontFace aliases.
 */

// Maps human-readable font names (used by Konva) to next/font internal names.
// The internal names come from the `localFont()` variable names in layout.tsx.
const FONT_ALIASES: { displayName: string; internalName: string; weights: string[] }[] = [
  { displayName: 'Brown', internalName: 'brown', weights: ['300', '400', '700'] },
  { displayName: 'Cera Basic', internalName: 'ceraBasic', weights: ['400', '700'] },
];

let preloadPromise: Promise<void> | null = null;

/**
 * Preload custom fonts and register aliases for Canvas/Konva.
 *
 * 1. Waits for stylesheets to be parsed (document.fonts.ready)
 * 2. Triggers download of fonts registered by next/font/local
 * 3. Creates FontFace aliases with the human-readable names
 *
 * Safe to call multiple times — returns the same promise.
 */
export function preloadLocalFonts(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (preloadPromise) return preloadPromise;

  preloadPromise = (async () => {
    // Wait for @font-face rules to be parsed
    await document.fonts.ready;

    const results = await Promise.allSettled(
      FONT_ALIASES.flatMap(({ displayName, internalName, weights }) =>
        weights.map(async (weight) => {
          // Check if the display name is already registered
          let hasAlias = false;
          for (const f of document.fonts) {
            if (f.family === displayName && f.weight === weight) {
              hasAlias = true;
              break;
            }
          }
          if (hasAlias) return;

          // Find the internal FontFace registered by next/font/local
          let internalFont: FontFace | null = null;
          for (const f of document.fonts) {
            if (f.family === internalName && f.weight === weight) {
              internalFont = f;
              break;
            }
          }

          if (!internalFont) return;

          // Trigger download of the internal font if not already loaded
          if (internalFont.status !== 'loaded') {
            await internalFont.load();
          }

          // Find the @font-face src URL from stylesheets and resolve it
          // relative to the stylesheet's own URL (not the page URL).
          let absoluteSrc: string | null = null;
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (!(rule instanceof CSSFontFaceRule)) continue;
                const family = rule.style.getPropertyValue('font-family');
                const ruleWeight = rule.style.getPropertyValue('font-weight');
                if (family === internalName && ruleWeight === weight) {
                  const rawSrc = rule.style.getPropertyValue('src');
                  // Extract the URL from the src value: url("../media/xxx.woff2") format("woff2")
                  const urlMatch = rawSrc.match(/url\("([^"]+)"\)/);
                  if (urlMatch && sheet.href) {
                    // Resolve relative URL against the stylesheet's URL
                    const resolved = new URL(urlMatch[1], sheet.href).href;
                    absoluteSrc = `url("${resolved}")`;
                  } else if (urlMatch) {
                    // Inline stylesheet — URL is already absolute or relative to page
                    absoluteSrc = rawSrc;
                  }
                  break;
                }
              }
            } catch {
              // Cross-origin stylesheet
            }
            if (absoluteSrc) break;
          }

          if (!absoluteSrc) return;

          // Create a FontFace alias with the human-readable name
          const alias = new FontFace(displayName, absoluteSrc, {
            weight,
            style: 'normal',
            display: 'swap',
          });

          const loaded = await alias.load();
          document.fonts.add(loaded);
        })
      )
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`${failed.length}/${results.length} font aliases failed to create`);
    }
  })();

  return preloadPromise;
}
