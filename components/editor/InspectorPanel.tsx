'use client';

import { useEditorStore, useTemporalStore } from '@/store/useEditorStore';
import { Button, Slider, ColorPicker, Select, Input } from '@/components/ui';
import { AVAILABLE_FONTS } from '@/lib/stylePresets';
import type { TextLayer, LogoLayer, Layer } from '@/types/layers';

export function InspectorPanel() {
  const {
    canvas,
    layers,
    selectedLayerId,
    overlayOpacity,
    setOverlayOpacity,
    setBackgroundColor,
    updateLayer,
    removeLayer,
    addTextLayer,
    moveLayer,
    duplicateLayer,
  } = useEditorStore();

  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    pastStates: state.pastStates,
    futureStates: state.futureStates,
  }));

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const fontOptions = AVAILABLE_FONTS.map((f) => ({ value: f.value, label: f.label }));
  const alignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];
  const weightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
  ];
  const bgShapeOptions = [
    { value: 'none', label: 'None' },
    { value: 'pill', label: 'Pill' },
    { value: 'circle', label: 'Circle' },
    { value: 'rect', label: 'Rectangle' },
  ];

  const handleUpdateLayer = (updates: Partial<Layer>) => {
    if (selectedLayerId) {
      updateLayer(selectedLayerId, updates);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Inspector</h2>
        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => undo()}
            disabled={pastStates.length === 0}
            title="Undo (Ctrl+Z)"
          >
            ↩️
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => redo()}
            disabled={futureStates.length === 0}
            title="Redo (Ctrl+Shift+Z)"
          >
            ↪️
          </Button>
        </div>
      </div>

      {/* Global Controls */}
      <div className="space-y-4 pb-4 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300">Canvas</h3>
        
        <ColorPicker
          label="Background Color"
          value={canvas.backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />

        <Slider
          label="Darkening Overlay"
          min={0}
          max={100}
          value={overlayOpacity}
          onChange={(e) => setOverlayOpacity(Number(e.target.value))}
          valueFormatter={(v) => `${v}%`}
        />
      </div>

      {/* Add Elements */}
      <div className="space-y-2 pb-4 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300">Add Elements</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => addTextLayer()}>
            + Text
          </Button>
          <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-all">
            + Logo
            <input
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const src = event.target?.result as string;
                    const isSvg = file.type === 'image/svg+xml';
                    const img = new Image();
                    img.onload = () => {
                      useEditorStore.getState().addLogoLayer(src, img.width, img.height, isSvg);
                    };
                    img.src = src;
                  };
                  reader.readAsDataURL(file);
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {/* Layer List */}
      <div className="space-y-2 pb-4 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300">Layers</h3>
        <div className="space-y-1">
          {[...layers].reverse().map((layer) => (
            <button
              key={layer.id}
              onClick={() => useEditorStore.getState().selectLayer(layer.id)}
              className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between
                ${selectedLayerId === layer.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
            >
              <span className="truncate">
                {layer.type === 'text' ? `"${(layer as TextLayer).text.substring(0, 15)}..."` :
                 layer.type === 'background' ? '🖼️ Background' :
                 layer.type === 'logo' ? '📌 Logo' :
                 layer.type}
              </span>
              {!layer.visible && <span className="text-zinc-500">👁️‍🗨️</span>}
            </button>
          ))}
          {layers.length === 0 && (
            <p className="text-sm text-zinc-500 py-2">No layers yet</p>
          )}
        </div>
      </div>

      {/* Selected Layer Controls */}
      {selectedLayer && selectedLayer.type !== 'background' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-300">
              {selectedLayer.type.charAt(0).toUpperCase() + selectedLayer.type.slice(1)} Properties
            </h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveLayer(selectedLayer.id, 'up')}
                title="Move Up"
              >
                ⬆️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveLayer(selectedLayer.id, 'down')}
                title="Move Down"
              >
                ⬇️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateLayer(selectedLayer.id)}
                title="Duplicate"
              >
                📋
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeLayer(selectedLayer.id)}
                title="Delete"
              >
                🗑️
              </Button>
            </div>
          </div>

          {/* Common Controls */}
          <Slider
            label="Opacity"
            min={0}
            max={100}
            value={selectedLayer.opacity * 100}
            onChange={(e) => handleUpdateLayer({ opacity: Number(e.target.value) / 100 })}
            valueFormatter={(v) => `${v}%`}
          />

          {/* Text Layer Controls */}
          {selectedLayer.type === 'text' && (
            <>
              <Input
                label="Text"
                value={(selectedLayer as TextLayer).text}
                onChange={(e) => handleUpdateLayer({ text: e.target.value })}
              />
              <Select
                label="Font"
                options={fontOptions}
                value={(selectedLayer as TextLayer).fontFamily}
                onChange={(e) => handleUpdateLayer({ fontFamily: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Size"
                  type="number"
                  min={8}
                  max={200}
                  value={(selectedLayer as TextLayer).fontSize}
                  onChange={(e) => handleUpdateLayer({ fontSize: Number(e.target.value) })}
                />
                <Select
                  label="Weight"
                  options={weightOptions}
                  value={(selectedLayer as TextLayer).fontWeight}
                  onChange={(e) => handleUpdateLayer({ fontWeight: e.target.value as 'normal' | 'bold' })}
                />
              </div>
              <Select
                label="Alignment"
                options={alignOptions}
                value={(selectedLayer as TextLayer).align}
                onChange={(e) => handleUpdateLayer({ align: e.target.value as 'left' | 'center' | 'right' })}
              />
              <ColorPicker
                label="Color"
                value={(selectedLayer as TextLayer).fill}
                onChange={(e) => handleUpdateLayer({ fill: e.target.value })}
              />
            </>
          )}

          {/* Logo Layer Controls */}
          {selectedLayer.type === 'logo' && (
            <>
              <Slider
                label="Scale"
                min={10}
                max={300}
                value={(selectedLayer as LogoLayer).scaleX * 100}
                onChange={(e) => {
                  const scale = Number(e.target.value) / 100;
                  handleUpdateLayer({ scaleX: scale, scaleY: scale });
                }}
                valueFormatter={(v) => `${v}%`}
              />
              {(selectedLayer as LogoLayer).isSvg && (
                <ColorPicker
                  label="Tint Color"
                  value={(selectedLayer as LogoLayer).tintColor || '#ffffff'}
                  onChange={(e) => handleUpdateLayer({ tintColor: e.target.value })}
                />
              )}
              <Select
                label="Background Shape"
                options={bgShapeOptions}
                value={(selectedLayer as LogoLayer).backgroundShape}
                onChange={(e) => handleUpdateLayer({ backgroundShape: e.target.value as 'none' | 'pill' | 'circle' | 'rect' })}
              />
              {(selectedLayer as LogoLayer).backgroundShape !== 'none' && (
                <>
                  <ColorPicker
                    label="Background Color"
                    value={(selectedLayer as LogoLayer).backgroundColor || '#000000'}
                    onChange={(e) => handleUpdateLayer({ backgroundColor: e.target.value })}
                  />
                  <Slider
                    label="Padding"
                    min={0}
                    max={50}
                    value={(selectedLayer as LogoLayer).backgroundPadding}
                    onChange={(e) => handleUpdateLayer({ backgroundPadding: Number(e.target.value) })}
                    valueFormatter={(v) => `${v}px`}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

