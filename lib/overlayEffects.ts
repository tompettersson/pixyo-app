// Overlay effect types and generators for canvas

export type OverlayType =
  | "gradient"
  | "vignette"
  | "halftone"
  | "grain"
  | "duotone"
  | "diagonal-stripes"
  | "scanlines"
  | "mesh-gradient"
  | "none";

// Blend modes that work well with each overlay
export type BlendMode = "normal" | "multiply" | "soft-light" | "overlay";

export interface OverlayPreset {
  id: OverlayType;
  label: string;
  description: string;
  blendMode: BlendMode;
}

// Rich dark blue color for overlays (instead of pure black/gray)
const OVERLAY_COLOR = {
  r: 15,
  g: 23,
  b: 42,
};

// Darker variant for stripes
const OVERLAY_COLOR_DARK = {
  r: 8,
  g: 12,
  b: 25,
};

// Helper to create rgba string
const rgba = (r: number, g: number, b: number, a: number) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;
const overlayRgba = (a: number) =>
  rgba(OVERLAY_COLOR.r, OVERLAY_COLOR.g, OVERLAY_COLOR.b, a);
const overlayDarkRgba = (a: number) =>
  rgba(OVERLAY_COLOR_DARK.r, OVERLAY_COLOR_DARK.g, OVERLAY_COLOR_DARK.b, a);

export const OVERLAY_PRESETS: OverlayPreset[] = [
  {
    id: "none",
    label: "Kein Overlay",
    description: "Kein Overlay-Effekt",
    blendMode: "normal",
  },
  {
    id: "gradient",
    label: "Gradient",
    description: "Linearer Verlauf mit Multiply-Blend für satte Farben",
    blendMode: "multiply",
  },
  {
    id: "vignette",
    label: "Vignette",
    description: "Radiale Abdunkelung von den Ecken zur Mitte",
    blendMode: "multiply",
  },
  {
    id: "halftone",
    label: "Halftone",
    description: "Retro-Punktraster im TV-Stil für einen grafischen Look",
    blendMode: "soft-light",
  },
  {
    id: "grain",
    label: "Film Grain",
    description: "Körnige Filmtextur für einen analogen, organischen Look",
    blendMode: "soft-light",
  },
  {
    id: "duotone",
    label: "Duotone",
    description: "Gradient + Grain kombiniert für maximale Tiefe",
    blendMode: "multiply",
  },
  {
    id: "diagonal-stripes",
    label: "Diagonale Streifen",
    description: "Moderne diagonale Linien mit Multiply-Blend",
    blendMode: "multiply",
  },
  {
    id: "scanlines",
    label: "Scanlines",
    description: "Horizontale Scanlines im Retro-Monitor-Stil",
    blendMode: "soft-light",
  },
  {
    id: "mesh-gradient",
    label: "Mesh Gradient",
    description: "Mehrfarbiger Mesh-Verlauf für einen modernen Look",
    blendMode: "multiply",
  },
];

// Generate gradient overlay
export function generateGradientOverlay(
  width: number,
  height: number,
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const alpha = intensity;
  gradient.addColorStop(0, overlayRgba(0.85 * alpha));
  gradient.addColorStop(0.35, overlayRgba(0.5 * alpha));
  gradient.addColorStop(0.65, overlayRgba(0.2 * alpha));
  gradient.addColorStop(1, overlayRgba(0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate vignette overlay
export function generateVignetteOverlay(
  width: number,
  height: number,
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const centerX = width * 0.6; // Slightly offset to bottom-right
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
  gradient.addColorStop(0, overlayRgba(0));
  gradient.addColorStop(0.5, overlayRgba(0.25 * alpha));
  gradient.addColorStop(0.8, overlayRgba(0.6 * alpha));
  gradient.addColorStop(1, overlayRgba(0.9 * alpha));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate halftone dot pattern overlay
export function generateHalftoneOverlay(
  width: number,
  height: number,
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // First, add gradient base
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const baseAlpha = intensity * 0.5;
  gradient.addColorStop(0, overlayRgba(0.6 * baseAlpha));
  gradient.addColorStop(0.5, overlayRgba(0.3 * baseAlpha));
  gradient.addColorStop(1, overlayRgba(0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Then add halftone dots
  const dotSpacing = 6;
  const maxDotRadius = 2.5;
  ctx.fillStyle = overlayRgba(intensity * 0.4);

  for (let y = 0; y < height; y += dotSpacing) {
    for (let x = 0; x < width; x += dotSpacing) {
      // Vary dot size based on position (larger in top-left)
      const distFromTopLeft =
        Math.sqrt(x * x + y * y) / Math.sqrt(width * width + height * height);
      const dotRadius = maxDotRadius * (1 - distFromTopLeft * 0.8);

      if (dotRadius > 0.3) {
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
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Create noise with dark blue tint
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const grainIntensity = intensity * 50;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * grainIntensity;
    // Use overlay color for grain
    data[i] = OVERLAY_COLOR.r; // R
    data[i + 1] = OVERLAY_COLOR.g; // G
    data[i + 2] = OVERLAY_COLOR.b; // B
    data[i + 3] = Math.max(0, noise); // A
  }

  ctx.putImageData(imageData, 0, 0);

  // Add subtle gradient on top
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, overlayRgba(0.3 * intensity));
  gradient.addColorStop(0.6, overlayRgba(0.12 * intensity));
  gradient.addColorStop(1, overlayRgba(0));

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate duotone overlay (gradient + grain combined)
export function generateDuotoneOverlay(
  width: number,
  height: number,
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Strong gradient base
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const alpha = intensity;
  gradient.addColorStop(0, overlayRgba(0.8 * alpha));
  gradient.addColorStop(0.3, overlayRgba(0.5 * alpha));
  gradient.addColorStop(0.6, overlayRgba(0.25 * alpha));
  gradient.addColorStop(1, overlayRgba(0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add grain on top
  const grainIntensity = intensity * 30;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * grainIntensity;
    // Add noise to existing alpha
    data[i + 3] = Math.min(255, Math.max(0, data[i + 3] + noise));
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

// Generate diagonal stripes overlay
export function generateDiagonalStripesOverlay(
  width: number,
  height: number,
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Create diagonal stripes pattern
  const stripeWidth = 8;
  const stripeGap = 8;
  const totalWidth = stripeWidth + stripeGap;

  // Draw diagonal lines
  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate((-45 * Math.PI) / 180);

  // Calculate the diagonal length needed to cover the canvas
  const diagonal = Math.sqrt(width * width + height * height) * 1.5;

  for (let i = -diagonal; i < diagonal; i += totalWidth) {
    // Darker stripe
    ctx.fillStyle = overlayDarkRgba(0.5 * intensity);
    ctx.fillRect(i, -diagonal, stripeWidth, diagonal * 2);

    // Lighter stripe (gap with subtle color)
    ctx.fillStyle = overlayRgba(0.15 * intensity);
    ctx.fillRect(i + stripeWidth, -diagonal, stripeGap, diagonal * 2);
  }

  ctx.restore();

  // Add gradient overlay for depth (darker top-left)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, overlayRgba(0.3 * intensity));
  gradient.addColorStop(0.5, overlayRgba(0.1 * intensity));
  gradient.addColorStop(1, overlayRgba(0));

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate scanlines overlay (horizontal lines)
export function generateScanlinesOverlay(
  width: number,
  height: number,
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Create horizontal scanlines
  const lineHeight = 2;
  const lineGap = 3;

  for (let y = 0; y < height; y += lineHeight + lineGap) {
    // Calculate position-based opacity (stronger at top-left)
    const positionFactor = 1 - (y / height) * 0.5;
    ctx.fillStyle = overlayRgba(0.35 * intensity * positionFactor);
    ctx.fillRect(0, y, width, lineHeight);
  }

  // Add subtle gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, width * 0.7, height);
  gradient.addColorStop(0, overlayRgba(0.25 * intensity));
  gradient.addColorStop(0.6, overlayRgba(0.08 * intensity));
  gradient.addColorStop(1, overlayRgba(0));

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Generate mesh gradient overlay (modern multi-point gradient)
export function generateMeshGradientOverlay(
  width: number,
  height: number,
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Create multiple gradient layers for mesh effect
  // Layer 1: Top-left blob
  const gradient1 = ctx.createRadialGradient(
    width * 0.2,
    height * 0.2,
    0,
    width * 0.2,
    height * 0.2,
    width * 0.6
  );
  gradient1.addColorStop(0, overlayRgba(0.7 * intensity));
  gradient1.addColorStop(0.5, overlayRgba(0.35 * intensity));
  gradient1.addColorStop(1, overlayRgba(0));
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, width, height);

  // Layer 2: Add a secondary gradient point
  ctx.globalCompositeOperation = "source-over";
  const gradient2 = ctx.createRadialGradient(
    width * 0.7,
    height * 0.3,
    0,
    width * 0.7,
    height * 0.3,
    width * 0.4
  );
  // Slightly different hue - more purple tint
  gradient2.addColorStop(0, rgba(25, 23, 52, 0.4 * intensity));
  gradient2.addColorStop(0.6, rgba(25, 23, 52, 0.15 * intensity));
  gradient2.addColorStop(1, rgba(25, 23, 52, 0));
  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, width, height);

  // Layer 3: Bottom accent
  const gradient3 = ctx.createRadialGradient(
    width * 0.4,
    height * 0.85,
    0,
    width * 0.4,
    height * 0.85,
    width * 0.5
  );
  // Slight teal tint
  gradient3.addColorStop(0, rgba(15, 35, 42, 0.3 * intensity));
  gradient3.addColorStop(0.7, rgba(15, 35, 42, 0.1 * intensity));
  gradient3.addColorStop(1, rgba(15, 35, 42, 0));
  ctx.fillStyle = gradient3;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Get blend mode for a given overlay type
export function getOverlayBlendMode(type: OverlayType): BlendMode {
  const preset = OVERLAY_PRESETS.find((p) => p.id === type);
  return preset?.blendMode ?? "normal";
}

// Main generator function
export function generateOverlay(
  type: OverlayType,
  width: number,
  height: number,
  intensity: number
): HTMLCanvasElement | null {
  if (type === "none" || intensity <= 0) return null;

  switch (type) {
    case "gradient":
      return generateGradientOverlay(width, height, intensity);
    case "vignette":
      return generateVignetteOverlay(width, height, intensity);
    case "halftone":
      return generateHalftoneOverlay(width, height, intensity);
    case "grain":
      return generateGrainOverlay(width, height, intensity);
    case "duotone":
      return generateDuotoneOverlay(width, height, intensity);
    case "diagonal-stripes":
      return generateDiagonalStripesOverlay(width, height, intensity);
    case "scanlines":
      return generateScanlinesOverlay(width, height, intensity);
    case "mesh-gradient":
      return generateMeshGradientOverlay(width, height, intensity);
    default:
      return null;
  }
}
