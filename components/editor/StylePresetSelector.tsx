'use client';

import { useState } from 'react';
import { STYLE_PRESETS, type StylePreset } from '@/lib/stylePresets';

interface StylePresetSelectorProps {
  mode: 'photo' | 'illustration';
  selectedPresetId: string;
  onSelect: (preset: StylePreset) => void;
}

export function StylePresetSelector({ mode, selectedPresetId, onSelect }: StylePresetSelectorProps) {
  const filteredPresets = STYLE_PRESETS.filter((p) => p.mode === mode);

  return (
    <div className="space-y-2">
      <label className="block text-sm text-zinc-400">Style Preset</label>
      <div className="grid grid-cols-2 gap-2">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`px-3 py-2 text-sm rounded-lg text-left transition-all
              ${selectedPresetId === preset.id
                ? 'bg-violet-600 text-white ring-2 ring-violet-400'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}





