// Overlay effect types and generators for canvas

export type OverlayType =
  | "gradient"
  | "halftone"
  | "grain"
  | "duotone"
  | "diagonal-stripes"
  | "scanlines"
  | "mesh-gradient"
  | "none";

// Overlay mode: darken or lighten
export type OverlayMode = "darken" | "lighten";

// Blend modes that work well with each overlay
export type BlendMode = "normal" | "multiply" | "screen" | "soft-light" | "overlay";

export interface OverlayPreset {
  id: OverlayType;
  label: string;
  description: string;
  darkenBlendMode: BlendMode;
  lightenBlendMode: BlendMode;
}

// Rich dark blue color for darkening overlays
const DARK_COLOR = {
  r: 15,
  g: 23,
  b: 42,
};

// Darker variant for stripes (darken mode)
const DARK_COLOR_DEEP = {
  r: 8,
  g: 12,
  b: 25,
};

// Light cream/white color for lightening overlays
const LIGHT_COLOR = {
  r: 255,
  g: 253,
  b: 248,
};

// Slightly darker light for stripes (lighten mode)
const LIGHT_COLOR_SOFT = {
  r: 245,
  g: 243,
  b: 238,
};

// Helper to create rgba string
const rgba = (r: number, g: number, b: number, a: number) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;

// Get color based on mode
const getColor = (mode: OverlayMode) => 
  mode === "darken" ? DARK_COLOR : LIGHT_COLOR;
const getDeepColor = (mode: OverlayMode) => 
  mode === "darken" ? DARK_COLOR_DEEP : LIGHT_COLOR_SOFT;

// Mode-aware rgba helper
const modeRgba = (mode: OverlayMode, a: number) => {
  const c = getColor(mode);
  return rgba(c.r, c.g, c.b, a);
};
const modeDeepRgba = (mode: OverlayMode, a: number) => {
  const c = getDeepColor(mode);
  return rgba(c.r, c.g, c.b, a);
};

export const OVERLAY_PRESETS: OverlayPreset[] = [
  {
    id: "none",
    label: "Kein Overlay",
    description: "Kein Overlay-Effekt",
    darkenBlendMode: "normal",
    lightenBlendMode: "normal",
  },
  {
    id: "gradient",
    label: "Gradient",
    description: "Linearer Verlauf für Tiefe und Kontrast",
    darkenBlendMode: "multiply",
    lightenBlendMode: "screen",
  },
  {
    id: "halftone",
    label: "Halftone",
    description: "Retro-Punktraster im TV-Stil",
    darkenBlendMode: "soft-light",
    lightenBlendMode: "soft-light",
  },
  {
    id: "grain",
    label: "Film Grain",
    description: "Körnige Filmtextur für einen analogen Look",
    darkenBlendMode: "soft-light",
    lightenBlendMode: "soft-light",
  },
  {
    id: "duotone",
    label: "Duotone",
    description: "Gradient + Grain kombiniert für maximale Tiefe",
    darkenBlendMode: "multiply",
    lightenBlendMode: "screen",
  },
  {
    id: "diagonal-stripes",
    label: "Diagonale Streifen",
    description: "Moderne diagonale Linien",
    darkenBlendMode: "multiply",
    lightenBlendMode: "screen",
  },
  {
    id: "scanlines",
    label: "Scanlines",
    description: "Horizontale Scanlines im Retro-Monitor-Stil",
    darkenBlendMode: "soft-light",
    lightenBlendMode: "soft-light",
  },
  {
    id: "mesh-gradient",
    label: "Mesh Gradient",
    description: "Mehrfarbiger Mesh-Verlauf für einen modernen Look",
    darkenBlendMode: "multiply",
    lightenBlendMode: "screen",
  },
];

// Generate gradient overlay
export function generateGradientOverlay(
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const alpha = intensity;
  gradient.addColorStop(0, modeRgba(mode, 0.85 * alpha));
  gradient.addColorStop(0.35, modeRgba(mode, 0.5 * alpha));
  gradient.addColorStop(0.65, modeRgba(mode, 0.2 * alpha));
  gradient.addColorStop(1, modeRgba(mode, 0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate vignette overlay
export function generateVignetteOverlay(
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const centerX = width * 0.6;
  const centerY = height * 0.6;
  const radius = Math.max(width, height) * 0.8;

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  );
  const alpha = intensity;
  gradient.addColorStop(0, modeRgba(mode, 0));
  gradient.addColorStop(0.5, modeRgba(mode, 0.25 * alpha));
  gradient.addColorStop(0.8, modeRgba(mode, 0.6 * alpha));
  gradient.addColorStop(1, modeRgba(mode, 0.9 * alpha));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate halftone dot pattern overlay
export function generateHalftoneOverlay(
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Stärkere Gradient-Basis
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const baseAlpha = intensity * 0.7;
  gradient.addColorStop(0, modeRgba(mode, 0.7 * baseAlpha));
  gradient.addColorStop(0.5, modeRgba(mode, 0.4 * baseAlpha));
  gradient.addColorStop(1, modeRgba(mode, 0.05));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Größere, auffälligere Halftone-Punkte
  const dotSpacing = 8;
  const maxDotRadius = 4;
  ctx.fillStyle = modeRgba(mode, intensity * 0.7);

  for (let y = 0; y < height; y += dotSpacing) {
    for (let x = 0; x < width; x += dotSpacing) {
      const distFromTopLeft =
        Math.sqrt(x * x + y * y) / Math.sqrt(width * width + height * height);
      const dotRadius = maxDotRadius * (1 - distFromTopLeft * 0.7);

      if (dotRadius > 0.5) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  return canvas;
}

// Generate film grain overlay
export function generateGrainOverlay(
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const color = getColor(mode);
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  // Deutlich höhere Grain-Intensität für sichtbareren Effekt
  const grainIntensity = intensity * 120;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * grainIntensity;
    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
    // Höherer Alpha-Wert für mehr Sichtbarkeit
    data[i + 3] = Math.max(0, Math.abs(noise) * 1.5);
  }

  ctx.putImageData(imageData, 0, 0);

  // Stärkerer Gradient für mehr Tiefe
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, modeRgba(mode, 0.45 * intensity));
  gradient.addColorStop(0.6, modeRgba(mode, 0.2 * intensity));
  gradient.addColorStop(1, modeRgba(mode, 0));

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate duotone overlay (gradient + grain combined)
export function generateDuotoneOverlay(
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Strong gradient base
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const alpha = intensity;
  gradient.addColorStop(0, modeRgba(mode, 0.8 * alpha));
  gradient.addColorStop(0.3, modeRgba(mode, 0.5 * alpha));
  gradient.addColorStop(0.6, modeRgba(mode, 0.25 * alpha));
  gradient.addColorStop(1, modeRgba(mode, 0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add grain on top
  const grainIntensity = intensity * 30;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * grainIntensity;
    data[i + 3] = Math.min(255, Math.max(0, data[i + 3] + noise));
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

// Generate diagonal stripes overlay
export function generateDiagonalStripesOverlay(
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const stripeWidth = 8;
  const stripeGap = 8;
  const totalWidth = stripeWidth + stripeGap;

  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate((-45 * Math.PI) / 180);

  const diagonal = Math.sqrt(width * width + height * height) * 1.5;

  for (let i = -diagonal; i < diagonal; i += totalWidth) {
    // Darker/lighter stripe
    ctx.fillStyle = modeDeepRgba(mode, 0.5 * intensity);
    ctx.fillRect(i, -diagonal, stripeWidth, diagonal * 2);

    // Softer stripe (gap)
    ctx.fillStyle = modeRgba(mode, 0.15 * intensity);
    ctx.fillRect(i + stripeWidth, -diagonal, stripeGap, diagonal * 2);
  }

  ctx.restore();

  // Add gradient overlay for depth
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, modeRgba(mode, 0.3 * intensity));
  gradient.addColorStop(0.5, modeRgba(mode, 0.1 * intensity));
  gradient.addColorStop(1, modeRgba(mode, 0));

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate scanlines overlay (horizontal lines)
export function generateScanlinesOverlay(
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Dickere Linien, weniger Abstand für deutlicheren Effekt
  const lineHeight = 3;
  const lineGap = 4;

  for (let y = 0; y < height; y += lineHeight + lineGap) {
    const positionFactor = 1 - (y / height) * 0.3;
    // Deutlich höhere Deckkraft
    ctx.fillStyle = modeRgba(mode, 0.65 * intensity * positionFactor);
    ctx.fillRect(0, y, width, lineHeight);
  }

  // Stärkerer Gradient
  const gradient = ctx.createLinearGradient(0, 0, width * 0.7, height);
  gradient.addColorStop(0, modeRgba(mode, 0.4 * intensity));
  gradient.addColorStop(0.6, modeRgba(mode, 0.15 * intensity));
  gradient.addColorStop(1, modeRgba(mode, 0));

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate mesh gradient overlay (modern multi-point gradient)
export function generateMeshGradientOverlay(
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Layer 1: Top-left blob
  const gradient1 = ctx.createRadialGradient(
    width * 0.2,
    height * 0.2,
    0,
    width * 0.2,
    height * 0.2,
    width * 0.6
  );
  gradient1.addColorStop(0, modeRgba(mode, 0.7 * intensity));
  gradient1.addColorStop(0.5, modeRgba(mode, 0.35 * intensity));
  gradient1.addColorStop(1, modeRgba(mode, 0));
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, width, height);

  // Layer 2: Secondary gradient point with slight color variation
  ctx.globalCompositeOperation = "source-over";
  const gradient2 = ctx.createRadialGradient(
    width * 0.7,
    height * 0.3,
    0,
    width * 0.7,
    height * 0.3,
    width * 0.4
  );
  // Purple/pink tint for variation
  const tint2 = mode === "darken" 
    ? rgba(25, 23, 52, 0.4 * intensity)
    : rgba(255, 245, 250, 0.4 * intensity);
  const tint2Mid = mode === "darken"
    ? rgba(25, 23, 52, 0.15 * intensity)
    : rgba(255, 245, 250, 0.15 * intensity);
  gradient2.addColorStop(0, tint2);
  gradient2.addColorStop(0.6, tint2Mid);
  gradient2.addColorStop(1, mode === "darken" ? rgba(25, 23, 52, 0) : rgba(255, 245, 250, 0));
  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, width, height);

  // Layer 3: Bottom accent with teal/warm tint
  const gradient3 = ctx.createRadialGradient(
    width * 0.4,
    height * 0.85,
    0,
    width * 0.4,
    height * 0.85,
    width * 0.5
  );
  const tint3 = mode === "darken"
    ? rgba(15, 35, 42, 0.3 * intensity)
    : rgba(255, 250, 240, 0.3 * intensity);
  const tint3Mid = mode === "darken"
    ? rgba(15, 35, 42, 0.1 * intensity)
    : rgba(255, 250, 240, 0.1 * intensity);
  gradient3.addColorStop(0, tint3);
  gradient3.addColorStop(0.7, tint3Mid);
  gradient3.addColorStop(1, mode === "darken" ? rgba(15, 35, 42, 0) : rgba(255, 250, 240, 0));
  ctx.fillStyle = gradient3;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Get blend mode for a given overlay type and mode
export function getOverlayBlendMode(type: OverlayType, mode: OverlayMode = "darken"): BlendMode {
  const preset = OVERLAY_PRESETS.find((p) => p.id === type);
  if (!preset) return "normal";
  return mode === "darken" ? preset.darkenBlendMode : preset.lightenBlendMode;
}

// Main generator function
export function generateOverlay(
  type: OverlayType,
  width: number,
  height: number,
  intensity: number,
  mode: OverlayMode = "darken"
): HTMLCanvasElement | null {
  if (type === "none" || intensity <= 0) return null;

  switch (type) {
    case "gradient":
      return generateGradientOverlay(width, height, intensity, mode);
    case "halftone":
      return generateHalftoneOverlay(width, height, intensity, mode);
    case "grain":
      return generateGrainOverlay(width, height, intensity, mode);
    case "duotone":
      return generateDuotoneOverlay(width, height, intensity, mode);
    case "diagonal-stripes":
      return generateDiagonalStripesOverlay(width, height, intensity, mode);
    case "scanlines":
      return generateScanlinesOverlay(width, height, intensity, mode);
    case "mesh-gradient":
      return generateMeshGradientOverlay(width, height, intensity, mode);
    default:
      return null;
  }
}
