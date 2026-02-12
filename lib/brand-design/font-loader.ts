// ─── Dynamic Google Font Loader ───────────────────────────────
// Loads Google Fonts via CSS link elements. Deduplicates requests.

const loadedFonts = new Set<string>();

/**
 * Load a Google Font dynamically by injecting a <link> element.
 * Safe to call multiple times — already-loaded fonts are skipped.
 */
export function loadGoogleFont(family: string, weights: number[] = [400, 500, 600, 700]) {
  if (typeof window === 'undefined') return;
  if (loadedFonts.has(family)) return;

  // Skip system fonts
  const systemFonts = ['sans-serif', 'serif', 'monospace', 'system-ui', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman'];
  if (systemFonts.includes(family)) return;

  loadedFonts.add(family);

  const weightStr = weights.join(';');
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightStr}&display=swap`;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.dataset.brandDesignFont = family;
  document.head.appendChild(link);
}

/**
 * Load multiple font families at once.
 */
export function loadFonts(families: string[]) {
  families.forEach((f) => loadGoogleFont(f));
}

/**
 * Remove all dynamically loaded brand design fonts.
 */
export function unloadBrandDesignFonts() {
  if (typeof window === 'undefined') return;
  const links = document.querySelectorAll('link[data-brand-design-font]');
  links.forEach((link) => link.remove());
  loadedFonts.clear();
}

/**
 * Popular Google Fonts grouped by category.
 */
export const GOOGLE_FONT_OPTIONS = [
  // Sans-serif
  { value: 'Inter', label: 'Inter', category: 'sans-serif' },
  { value: 'Roboto', label: 'Roboto', category: 'sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'sans-serif' },
  { value: 'Lato', label: 'Lato', category: 'sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'sans-serif' },
  { value: 'Raleway', label: 'Raleway', category: 'sans-serif' },
  { value: 'Nunito', label: 'Nunito', category: 'sans-serif' },
  { value: 'Work Sans', label: 'Work Sans', category: 'sans-serif' },
  { value: 'DM Sans', label: 'DM Sans', category: 'sans-serif' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'sans-serif' },
  { value: 'Manrope', label: 'Manrope', category: 'sans-serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'sans-serif' },
  { value: 'Outfit', label: 'Outfit', category: 'sans-serif' },
  { value: 'Sora', label: 'Sora', category: 'sans-serif' },
  { value: 'Bebas Neue', label: 'Bebas Neue', category: 'display' },
  // Serif
  { value: 'Playfair Display', label: 'Playfair Display', category: 'serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'serif' },
  { value: 'Lora', label: 'Lora', category: 'serif' },
  { value: 'PT Serif', label: 'PT Serif', category: 'serif' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', category: 'serif' },
  { value: 'DM Serif Display', label: 'DM Serif Display', category: 'serif' },
  { value: 'Fraunces', label: 'Fraunces', category: 'serif' },
  // Monospace
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'monospace' },
  { value: 'Fira Code', label: 'Fira Code', category: 'monospace' },
  { value: 'Source Code Pro', label: 'Source Code Pro', category: 'monospace' },
] as const;
