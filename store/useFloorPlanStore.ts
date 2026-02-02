import { create } from 'zustand';
import {
  FloorPlanElement,
  ElementSubType,
  createFloorPlanElement
} from '@/types/floorplan';

interface FloorPlanState {
  // Room dimensions in meters
  roomWidth: number;
  roomHeight: number;

  // Elements in the room
  elements: FloorPlanElement[];

  // Currently selected element
  selectedElementId: string | null;

  // View settings
  gridEnabled: boolean;
  showLabels: boolean;
  zoom: number;
}

interface FloorPlanActions {
  // Room
  setRoomDimensions: (width: number, height: number) => void;

  // Elements
  addElement: (subType: ElementSubType) => void;
  updateElement: (id: string, updates: Partial<FloorPlanElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  clearElements: () => void;

  // Selection
  selectElement: (id: string | null) => void;

  // View
  toggleGrid: () => void;
  toggleLabels: () => void;
  setZoom: (zoom: number) => void;

  // Product position
  setAsProductPosition: (id: string) => void;
  clearProductPositions: () => void;

  // Export
  exportAsPromptDescription: () => string;

  // Reset
  reset: () => void;
}

const initialState: FloorPlanState = {
  roomWidth: 5,
  roomHeight: 4,
  elements: [],
  selectedElementId: null,
  gridEnabled: true,
  showLabels: true,
  zoom: 1,
};

export const useFloorPlanStore = create<FloorPlanState & FloorPlanActions>((set, get) => ({
  ...initialState,

  setRoomDimensions: (width, height) => set({ roomWidth: width, roomHeight: height }),

  addElement: (subType) => {
    const element = createFloorPlanElement(subType);
    if (element) {
      set((state) => ({
        elements: [...state.elements, element],
        selectedElementId: element.id,
      }));
    }
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    }));
  },

  duplicateElement: (id) => {
    const element = get().elements.find((el) => el.id === id);
    if (element) {
      const newElement: FloorPlanElement = {
        ...element,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: Math.min(element.x + 0.05, 0.95),
        y: Math.min(element.y + 0.05, 0.95),
      };
      set((state) => ({
        elements: [...state.elements, newElement],
        selectedElementId: newElement.id,
      }));
    }
  },

  clearElements: () => set({ elements: [], selectedElementId: null }),

  selectElement: (id) => set({ selectedElementId: id }),

  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),

  setAsProductPosition: (id) => {
    set((state) => ({
      elements: state.elements.map((el) => ({
        ...el,
        isProductPosition: el.id === id,
      })),
    }));
  },

  clearProductPositions: () => {
    set((state) => ({
      elements: state.elements.map((el) => ({
        ...el,
        isProductPosition: false,
      })),
    }));
  },

  exportAsPromptDescription: () => {
    const { roomWidth, roomHeight, elements } = get();

    if (elements.length === 0) {
      return '';
    }

    const productElement = elements.find((el) => el.isProductPosition);
    const otherElements = elements.filter((el) => !el.isProductPosition);

    let description = `Room layout (${roomWidth}m × ${roomHeight}m viewed from above):\n`;

    if (productElement) {
      const posX = productElement.x < 0.33 ? 'left' : productElement.x > 0.66 ? 'right' : 'center';
      const posY = productElement.y < 0.33 ? 'front' : productElement.y > 0.66 ? 'back' : 'middle';
      description += `- Product placement: ${posX}-${posY} of room\n`;
    }

    // Group elements by category
    const furniture = otherElements.filter((el) => el.category === 'furniture');
    const decor = otherElements.filter((el) => el.category === 'decor');
    const architecture = otherElements.filter((el) => el.category === 'architecture');
    const speakers = otherElements.filter((el) => el.category === 'speaker' && !el.isProductPosition);

    if (furniture.length > 0) {
      description += `- Furniture: ${furniture.map((el) => el.label).join(', ')}\n`;
    }

    if (speakers.length > 0) {
      description += `- Additional speakers: ${speakers.map((el) => el.label).join(', ')}\n`;
    }

    if (decor.length > 0) {
      description += `- Decor: ${decor.map((el) => el.label).join(', ')}\n`;
    }

    if (architecture.length > 0) {
      const windows = architecture.filter((el) => el.subType === 'window');
      const doors = architecture.filter((el) => el.subType === 'door');

      if (windows.length > 0) {
        const windowPositions = windows.map((w) => {
          if (w.y < 0.2) return 'front wall';
          if (w.y > 0.8) return 'back wall';
          if (w.x < 0.2) return 'left wall';
          if (w.x > 0.8) return 'right wall';
          return 'wall';
        });
        description += `- Windows: ${windowPositions.join(', ')}\n`;
      }

      if (doors.length > 0) {
        description += `- Doors: ${doors.length}\n`;
      }
    }

    return description;
  },

  reset: () => set(initialState),
}));
