// Floor Plan Types for 2D Room Configurator

export type ElementCategory = 'speaker' | 'furniture' | 'decor' | 'architecture';

export type SpeakerType = 'floor-speaker' | 'subwoofer' | 'center-speaker' | 'bookshelf-speaker';
export type FurnitureType = 'lowboard' | 'sideboard' | 'couch' | 'armchair' | 'coffee-table' | 'dining-table' | 'floor-lamp';
export type DecorType = 'plant-large' | 'plant-small' | 'wall-art' | 'rug';
export type ArchitectureType = 'window' | 'door';

export type ElementSubType = SpeakerType | FurnitureType | DecorType | ArchitectureType;

export interface FloorPlanElement {
  id: string;
  category: ElementCategory;
  subType: ElementSubType;
  label: string;

  // Position (0-1 normalized relative to room)
  x: number;
  y: number;

  // Dimensions in meters
  width: number;
  height: number;

  // Rotation in degrees (0, 90, 180, 270)
  rotation: number;

  // Visual
  color: string;
  icon: string;

  // Is this where the product should be placed?
  isProductPosition: boolean;
}

export interface ElementTemplate {
  category: ElementCategory;
  subType: ElementSubType;
  label: string;
  labelDe: string;
  icon: string;
  color: string;
  defaultWidth: number;  // meters
  defaultHeight: number; // meters
}

// Element library with default sizes
export const ELEMENT_TEMPLATES: ElementTemplate[] = [
  // Speakers (Products)
  { category: 'speaker', subType: 'floor-speaker', label: 'Floor Speaker', labelDe: 'Standlautsprecher', icon: '🔊', color: '#6366f1', defaultWidth: 0.3, defaultHeight: 0.4 },
  { category: 'speaker', subType: 'subwoofer', label: 'Subwoofer', labelDe: 'Subwoofer', icon: '🔈', color: '#8b5cf6', defaultWidth: 0.4, defaultHeight: 0.4 },
  { category: 'speaker', subType: 'center-speaker', label: 'Center Speaker', labelDe: 'Center Speaker', icon: '📢', color: '#a78bfa', defaultWidth: 0.5, defaultHeight: 0.15 },
  { category: 'speaker', subType: 'bookshelf-speaker', label: 'Bookshelf Speaker', labelDe: 'Regallautsprecher', icon: '🔉', color: '#c4b5fd', defaultWidth: 0.2, defaultHeight: 0.3 },

  // Furniture
  { category: 'furniture', subType: 'lowboard', label: 'TV Stand', labelDe: 'Lowboard', icon: '📺', color: '#78716c', defaultWidth: 1.8, defaultHeight: 0.45 },
  { category: 'furniture', subType: 'sideboard', label: 'Sideboard', labelDe: 'Sideboard', icon: '🗄️', color: '#a8a29e', defaultWidth: 1.5, defaultHeight: 0.4 },
  { category: 'furniture', subType: 'couch', label: 'Couch', labelDe: 'Couch', icon: '🛋️', color: '#57534e', defaultWidth: 2.2, defaultHeight: 0.9 },
  { category: 'furniture', subType: 'armchair', label: 'Armchair', labelDe: 'Sessel', icon: '🪑', color: '#44403c', defaultWidth: 0.8, defaultHeight: 0.8 },
  { category: 'furniture', subType: 'coffee-table', label: 'Coffee Table', labelDe: 'Couchtisch', icon: '☕', color: '#292524', defaultWidth: 1.2, defaultHeight: 0.6 },
  { category: 'furniture', subType: 'dining-table', label: 'Dining Table', labelDe: 'Esstisch', icon: '🍽️', color: '#1c1917', defaultWidth: 1.8, defaultHeight: 0.9 },
  { category: 'furniture', subType: 'floor-lamp', label: 'Floor Lamp', labelDe: 'Stehlampe', icon: '🪔', color: '#fbbf24', defaultWidth: 0.3, defaultHeight: 0.3 },

  // Decor
  { category: 'decor', subType: 'plant-large', label: 'Large Plant', labelDe: 'Pflanze (groß)', icon: '🪴', color: '#22c55e', defaultWidth: 0.5, defaultHeight: 0.5 },
  { category: 'decor', subType: 'plant-small', label: 'Small Plant', labelDe: 'Pflanze (klein)', icon: '🌿', color: '#4ade80', defaultWidth: 0.25, defaultHeight: 0.25 },
  { category: 'decor', subType: 'wall-art', label: 'Wall Art', labelDe: 'Wandbild', icon: '🖼️', color: '#f59e0b', defaultWidth: 1.0, defaultHeight: 0.7 },
  { category: 'decor', subType: 'rug', label: 'Rug', labelDe: 'Teppich', icon: '🟫', color: '#d97706', defaultWidth: 2.0, defaultHeight: 1.5 },

  // Architecture
  { category: 'architecture', subType: 'window', label: 'Window', labelDe: 'Fenster', icon: '═', color: '#60a5fa', defaultWidth: 1.5, defaultHeight: 0.1 },
  { category: 'architecture', subType: 'door', label: 'Door', labelDe: 'Tür', icon: '▢', color: '#94a3b8', defaultWidth: 0.9, defaultHeight: 0.1 },
];

export function getElementTemplate(subType: ElementSubType): ElementTemplate | undefined {
  return ELEMENT_TEMPLATES.find(t => t.subType === subType);
}

export function createFloorPlanElement(
  subType: ElementSubType,
  x: number = 0.5,
  y: number = 0.5
): FloorPlanElement | null {
  const template = getElementTemplate(subType);
  if (!template) return null;

  return {
    id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    category: template.category,
    subType: template.subType,
    label: template.labelDe,
    x,
    y,
    width: template.defaultWidth,
    height: template.defaultHeight,
    rotation: 0,
    color: template.color,
    icon: template.icon,
    isProductPosition: template.category === 'speaker',
  };
}
