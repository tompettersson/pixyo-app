'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import { FloorPlanToolbar } from './FloorPlanToolbar';

// Dynamically import canvas to avoid SSR issues with Konva
const FloorPlanCanvas = dynamic(
  () => import('./FloorPlanCanvas').then((mod) => mod.FloorPlanCanvas),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-900 animate-pulse" /> }
);

interface FloorPlanEditorProps {
  onExportLayout: (description: string, imageDataUrl: string | null) => void;
}

export function FloorPlanEditor({ onExportLayout }: FloorPlanEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  const roomWidth = useFloorPlanStore((s) => s.roomWidth);
  const roomHeight = useFloorPlanStore((s) => s.roomHeight);
  const elements = useFloorPlanStore((s) => s.elements);
  const selectedElementId = useFloorPlanStore((s) => s.selectedElementId);
  const gridEnabled = useFloorPlanStore((s) => s.gridEnabled);
  const showLabels = useFloorPlanStore((s) => s.showLabels);

  const setRoomDimensions = useFloorPlanStore((s) => s.setRoomDimensions);
  const removeElement = useFloorPlanStore((s) => s.removeElement);
  const duplicateElement = useFloorPlanStore((s) => s.duplicateElement);
  const updateElement = useFloorPlanStore((s) => s.updateElement);
  const toggleGrid = useFloorPlanStore((s) => s.toggleGrid);
  const toggleLabels = useFloorPlanStore((s) => s.toggleLabels);
  const setAsProductPosition = useFloorPlanStore((s) => s.setAsProductPosition);
  const clearElements = useFloorPlanStore((s) => s.clearElements);
  const exportAsPromptDescription = useFloorPlanStore((s) => s.exportAsPromptDescription);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Resize observer for canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const description = exportAsPromptDescription();

      // Get floor plan image
      const exportFn = (window as any).__exportFloorPlanImage;
      let imageDataUrl: string | null = null;

      if (exportFn) {
        imageDataUrl = await exportFn();
      }

      onExportLayout(description, imageDataUrl);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRotate = () => {
    if (selectedElement) {
      const newRotation = (selectedElement.rotation + 90) % 360;
      // Swap width/height for 90/270 degree rotations
      if (newRotation === 90 || newRotation === 270) {
        updateElement(selectedElementId!, {
          rotation: newRotation,
          width: selectedElement.height,
          height: selectedElement.width,
        });
      } else {
        updateElement(selectedElementId!, { rotation: newRotation });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top controls */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          {/* Room dimensions */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Raum:</label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomDimensions(Number(e.target.value) || 1, roomHeight)}
              className="w-14 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 text-center"
              min={1}
              max={20}
            />
            <span className="text-xs text-zinc-500">×</span>
            <input
              type="number"
              value={roomHeight}
              onChange={(e) => setRoomDimensions(roomWidth, Number(e.target.value) || 1)}
              className="w-14 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 text-center"
              min={1}
              max={20}
            />
            <span className="text-xs text-zinc-500">m</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggles */}
          <button
            onClick={toggleGrid}
            className={`p-2 rounded-lg text-xs transition-colors ${
              gridEnabled ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-500'
            }`}
            title="Raster anzeigen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M6 4v16M12 4v16M18 4v16" />
            </svg>
          </button>
          <button
            onClick={toggleLabels}
            className={`p-2 rounded-lg text-xs transition-colors ${
              showLabels ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-500'
            }`}
            title="Labels anzeigen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>

          {/* Clear all */}
          <button
            onClick={clearElements}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
            title="Alles löschen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Toolbar */}
        <div className="w-48 p-3 border-r border-zinc-800 overflow-y-auto">
          <FloorPlanToolbar />
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 min-w-0">
          <FloorPlanCanvas width={canvasSize.width} height={canvasSize.height} />
        </div>

        {/* Element properties */}
        <div className="w-56 p-3 border-l border-zinc-800 overflow-y-auto">
          {selectedElement ? (
            <div className="space-y-4">
              <h4 className="text-xs text-zinc-500 uppercase tracking-wider">
                Ausgewählt: {selectedElement.label}
              </h4>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleRotate}
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  90°
                </button>
                <button
                  onClick={() => duplicateElement(selectedElementId!)}
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => removeElement(selectedElementId!)}
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-500/20 text-xs flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Mark as product position */}
              {selectedElement.category === 'speaker' && (
                <button
                  onClick={() => setAsProductPosition(selectedElementId!)}
                  className={`w-full px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 ${
                    selectedElement.isProductPosition
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {selectedElement.isProductPosition ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Produktposition
                    </>
                  ) : (
                    'Als Produktposition markieren'
                  )}
                </button>
              )}

              {/* Size info */}
              <div className="text-xs text-zinc-500">
                <p>Größe: {selectedElement.width.toFixed(2)}m × {selectedElement.height.toFixed(2)}m</p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 text-center py-8">
              Klicke auf ein Element um es zu bearbeiten
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="p-3 border-t border-zinc-800 flex items-center justify-between">
        <div className="text-xs text-zinc-500">
          {elements.length} Element{elements.length !== 1 ? 'e' : ''} im Raum
        </div>
        <button
          onClick={handleExport}
          disabled={elements.length === 0 || isExporting}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            elements.length > 0 && !isExporting
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {isExporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Exportiere...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Layout für KI übernehmen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
