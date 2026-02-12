'use client';

import React, { useCallback } from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { Slider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/Input';
import { recalculateSpacingScale } from '@/lib/brand-design/defaults';

export default function SpacingSection() {
  const { tokens, updateTokens } = useBrandDesignStore();
  const { spacing } = tokens;

  const handleBaseChange = useCallback(
    (value: number) => {
      const newScale = recalculateSpacingScale(value);
      updateTokens({
        spacing: {
          base: value,
          scale: newScale,
        },
      } as never);
    },
    [updateTokens]
  );

  return (
    <div className="space-y-4">
      <Slider
        label="Basis-Einheit"
        min={2}
        max={8}
        step={1}
        value={spacing.base}
        onChange={(e) => handleBaseChange(Number(e.target.value))}
        valueFormatter={(v) => `${v}px`}
      />

      {/* Scale preview */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Scale-Vorschau</span>
        <div className="space-y-1">
          {Object.entries(spacing.scale).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 w-8 text-right font-mono">{key}</span>
              <div
                className="h-3 bg-violet-500/30 rounded-sm"
                style={{ width: value }}
              />
              <span className="text-[10px] text-zinc-600 font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Container / Section Padding */}
      <Input
        label="Container Max-Width"
        value={spacing.container}
        onChange={(e) => updateTokens({ spacing: { container: e.target.value } })}
        placeholder="1200px"
      />
      <Input
        label="Section Padding"
        value={spacing.sectionPadding}
        onChange={(e) => updateTokens({ spacing: { sectionPadding: e.target.value } })}
        placeholder="64px"
      />
    </div>
  );
}
