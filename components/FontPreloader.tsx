'use client';

import { useEffect } from 'react';
import { preloadLocalFonts } from '@/lib/fonts/preload';

/**
 * Client component that eagerly preloads local custom fonts.
 * This ensures fonts are available for Canvas/Konva rendering
 * even when no HTML element references them yet.
 */
export function FontPreloader() {
  useEffect(() => {
    preloadLocalFonts();
  }, []);

  return null;
}
