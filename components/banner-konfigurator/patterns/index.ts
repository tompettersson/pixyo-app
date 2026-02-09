import type { PatternId } from '@/lib/banner/formats';
import PatternSplit from './PatternSplit';
import PatternDiagonal from './PatternDiagonal';
import PatternCircleAccent from './PatternCircleAccent';
import PatternBottomFade from './PatternBottomFade';
import PatternMinimalGradient from './PatternMinimalGradient';
import PatternPhotoOverlay from './PatternPhotoOverlay';
import PatternDuotone from './PatternDuotone';
import type { PatternProps } from './shared';

export type { PatternProps } from './shared';

// ─── Pattern metadata ──────────────────────────────────────────
export interface PatternMeta {
  id: PatternId;
  labelDe: string;
  labelEn: string;
  needsImage: boolean;
  component: React.ComponentType<PatternProps>;
}

export const PATTERNS: PatternMeta[] = [
  { id: 'P1', labelDe: 'Split-Layout', labelEn: 'Split Layout', needsImage: true, component: PatternSplit },
  { id: 'P2', labelDe: 'Diagonale', labelEn: 'Diagonal', needsImage: true, component: PatternDiagonal },
  { id: 'P3', labelDe: 'Kreis-Akzent', labelEn: 'Circle Accent', needsImage: false, component: PatternCircleAccent },
  { id: 'P4', labelDe: 'Verlauf unten', labelEn: 'Bottom Fade', needsImage: true, component: PatternBottomFade },
  { id: 'P5', labelDe: 'Minimaler Gradient', labelEn: 'Minimal Gradient', needsImage: false, component: PatternMinimalGradient },
  { id: 'P6', labelDe: 'Foto-Overlay', labelEn: 'Photo Overlay', needsImage: true, component: PatternPhotoOverlay },
  { id: 'P7', labelDe: 'Duotone', labelEn: 'Duotone', needsImage: true, component: PatternDuotone },
];

// ─── Pattern lookup map ────────────────────────────────────────
const PATTERN_MAP = new Map<PatternId, PatternMeta>(
  PATTERNS.map((p) => [p.id, p])
);

/**
 * Get pattern metadata by ID.
 */
export function getPattern(id: PatternId): PatternMeta | undefined {
  return PATTERN_MAP.get(id);
}

/**
 * Get the React component for a pattern ID.
 */
export function getPatternComponent(id: PatternId): React.ComponentType<PatternProps> | undefined {
  return PATTERN_MAP.get(id)?.component;
}
