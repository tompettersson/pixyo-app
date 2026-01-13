'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { Design } from '@/types/customer';

// Helper to format relative time
function formatRelativeTime(date: Date | null): string {
  if (!date) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 5) return 'Gerade gespeichert';
  if (diffSeconds < 60) return `Vor ${diffSeconds}s gespeichert`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Vor ${diffMinutes}m gespeichert`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Vor ${diffHours}h gespeichert`;
  return `Vor ${Math.floor(diffHours / 24)}T gespeichert`;
}

interface DesignThumbnailsProps {
  onCreateNew?: () => void;
}

export function DesignThumbnails({ onCreateNew }: DesignThumbnailsProps) {
  const {
    customer: { activeCustomerId },
    design: { designs, activeDesignId, isLoadingDesigns, isSaving, isDirty, lastSavedAt },
    setActiveDesign,
    loadDesignIntoEditor,
    addDesign,
    removeDesignFromList,
    markClean,
  } = useEditorStore();

  // Update relative time display every 10 seconds
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const [contextMenu, setContextMenu] = useState<{
    designId: string;
    x: number;
    y: number;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Create new design
  const handleCreateNew = async () => {
    if (!activeCustomerId || isCreating) return;

    setIsCreating(true);
    try {
      // Default canvas state for new designs
      const defaultCanvasState = {
        width: 1200,
        height: 1200,
        aspectRatio: '1:1',
        backgroundColor: '#1a1a1a',
      };

      // Default layers: just a background layer
      const defaultLayers = [
        {
          id: 'background',
          type: 'background',
          visible: true,
          locked: false,
          backgroundColor: '#1a1a1a',
        },
      ];

      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeCustomerId,
          name: `Design ${designs.length + 1}`,
          canvasState: defaultCanvasState,
          layers: defaultLayers,
        }),
      });

      if (!response.ok) throw new Error('Failed to create design');

      const data = await response.json();
      addDesign(data.design);
      loadDesignIntoEditor(data.design);
      markClean();

      if (onCreateNew) {
        onCreateNew();
      }
    } catch (error) {
      console.error('Failed to create design:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Load design into editor
  const handleLoadDesign = (design: Design) => {
    loadDesignIntoEditor(design);
    markClean();
  };

  // Duplicate design
  const handleDuplicate = async (designId: string) => {
    setContextMenu(null);
    try {
      const response = await fetch(`/api/designs/${designId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to duplicate design');

      const data = await response.json();
      addDesign(data.design);
      loadDesignIntoEditor(data.design);
    } catch (error) {
      console.error('Failed to duplicate design:', error);
    }
  };

  // Delete design
  const handleDelete = async (designId: string) => {
    setContextMenu(null);

    // Confirm deletion
    if (!window.confirm('Design wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete design');

      removeDesignFromList(designId);

      // If deleted design was active, clear the editor
      if (activeDesignId === designId) {
        setActiveDesign(null);
      }
    } catch (error) {
      console.error('Failed to delete design:', error);
    }
  };

  // Rename design
  const handleStartRename = (design: Design) => {
    setContextMenu(null);
    setEditingName(design.id);
    setTempName(design.name);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleFinishRename = async (designId: string) => {
    if (!tempName.trim()) {
      setEditingName(null);
      return;
    }

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to rename design');

      // Update local state (optimistic)
      const { updateDesignInList } = useEditorStore.getState();
      updateDesignInList(designId, { name: tempName.trim() });
    } catch (error) {
      console.error('Failed to rename design:', error);
    } finally {
      setEditingName(null);
    }
  };

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, designId: string) => {
    e.preventDefault();

    // Menühöhe ca. 140px (3 Einträge + Trennlinie)
    const menuHeight = 140;
    const menuWidth = 160;

    // Position berechnen - nach oben öffnen wenn nicht genug Platz unten
    let y = e.clientY;
    let x = e.clientX;

    if (y + menuHeight > window.innerHeight) {
      y = e.clientY - menuHeight;
    }
    if (x + menuWidth > window.innerWidth) {
      x = e.clientX - menuWidth;
    }

    setContextMenu({
      designId,
      x,
      y,
    });
  };

  // Close context menu on click outside
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  if (!activeCustomerId) {
    return null;
  }

  return (
    <>
      <div className="h-20 bg-zinc-900 border-t border-zinc-800/50 flex items-center px-4 gap-3 overflow-x-auto">
        {/* Create New Button */}
        <button
          onClick={handleCreateNew}
          disabled={isCreating}
          className={`
            flex-shrink-0 w-14 h-14 rounded-lg border-2 border-dashed
            flex items-center justify-center transition-all
            ${isCreating
              ? 'border-zinc-600 bg-zinc-800/50 cursor-wait'
              : 'border-zinc-600 hover:border-zinc-400 hover:bg-zinc-800/50 cursor-pointer'
            }
          `}
          title="Neues Design erstellen"
        >
          {isCreating ? (
            <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-6 h-6 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>

        {/* Separator */}
        {designs.length > 0 && (
          <div className="w-px h-12 bg-zinc-700/50 flex-shrink-0" />
        )}

        {/* Loading State */}
        {isLoadingDesigns && (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-lg bg-zinc-800/50 animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        )}

        {/* Design Thumbnails */}
        {!isLoadingDesigns &&
          designs.map((design) => {
            const isActive = design.id === activeDesignId;
            const isEditing = editingName === design.id;

            return (
              <div
                key={design.id}
                className="flex-shrink-0 relative group"
                onContextMenu={(e) => handleContextMenu(e, design.id)}
              >
                <button
                  onClick={() => handleLoadDesign(design)}
                  className={`
                    w-14 h-14 rounded-lg overflow-hidden transition-all
                    ${isActive
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                      : 'hover:ring-2 hover:ring-zinc-500 hover:ring-offset-2 hover:ring-offset-zinc-900'
                    }
                  `}
                  title={design.name}
                >
                  {design.thumbnailUrl ? (
                    <img
                      src={design.thumbnailUrl}
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-zinc-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Inline rename input (appears above thumbnail when editing) */}
                {isEditing && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                    <input
                      ref={inputRef}
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={() => handleFinishRename(design.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFinishRename(design.id);
                        if (e.key === 'Escape') setEditingName(null);
                      }}
                      className="w-24 px-2 py-1 text-xs text-center bg-zinc-800 border border-zinc-600 rounded text-zinc-200 shadow-lg"
                      autoFocus
                    />
                  </div>
                )}

                {/* Status indicators */}
                {isActive && (
                  <>
                    {/* Saving spinner */}
                    {isSaving && (
                      <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {/* Unsaved indicator */}
                    {!isSaving && isDirty && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" title="Ungespeicherte Änderungen" />
                    )}
                    {/* Saved checkmark */}
                    {!isSaving && !isDirty && lastSavedAt && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500/80 rounded-full flex items-center justify-center" title={formatRelativeTime(lastSavedAt)}>
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

        {/* Save Status Text */}
        {activeDesignId && (
          <div className="flex-shrink-0 flex items-center gap-2 ml-auto pl-4">
            {isSaving ? (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Speichert...
              </span>
            ) : isDirty ? (
              <span className="text-xs text-amber-500">Ungespeichert</span>
            ) : lastSavedAt ? (
              <span className="text-xs text-zinc-500">{formatRelativeTime(lastSavedAt)}</span>
            ) : null}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingDesigns && designs.length === 0 && (
          <div className="text-zinc-500 text-sm">
            Noch keine Designs. Klicke auf +, um ein neues zu erstellen.
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={handleCloseContextMenu}
          />
          {/* Menu */}
          <div
            className="fixed z-50 bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl overflow-hidden min-w-40"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              onClick={() => {
                const design = designs.find((d) => d.id === contextMenu.designId);
                if (design) handleStartRename(design);
              }}
              className="w-full px-4 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Umbenennen
            </button>
            <button
              onClick={() => handleDuplicate(contextMenu.designId)}
              className="w-full px-4 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplizieren
            </button>
            <div className="border-t border-zinc-700" />
            <button
              onClick={() => handleDelete(contextMenu.designId)}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/30 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Löschen
            </button>
          </div>
        </>
      )}
    </>
  );
}
