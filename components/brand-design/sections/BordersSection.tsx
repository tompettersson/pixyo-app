'use client';

import React from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ColorPicker } from '@/components/ui/ColorPicker';

export default function BordersSection() {
  const { tokens, updateTokens } = useBrandDesignStore();
  const { borders } = tokens;

  const radiusKeys = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;

  return (
    <div className="space-y-4">
      {/* Radius scale */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Radius-Scale</span>
        <div className="space-y-1.5">
          {radiusKeys.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 w-8 text-right font-mono">{key}</span>
              <input
                type="text"
                value={borders.radius[key]}
                onChange={(e) =>
                  updateTokens({
                    borders: { radius: { [key]: e.target.value } },
                  } as never)
                }
                className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200
                  focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {/* Visual preview */}
              <div
                className="w-6 h-6 bg-violet-500/30 border border-violet-500/50 shrink-0"
                style={{ borderRadius: borders.radius[key] }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Default radius selection */}
      <Select
        label="Standard-Radius"
        value={borders.radius.default}
        onChange={(e) =>
          updateTokens({ borders: { radius: { default: e.target.value } } })
        }
        options={radiusKeys.map((key) => ({
          value: borders.radius[key],
          label: `${key} (${borders.radius[key]})`,
        }))}
      />

      {/* Border width */}
      <Input
        label="Border Width"
        value={borders.width}
        onChange={(e) => updateTokens({ borders: { width: e.target.value } })}
        placeholder="1px"
      />

      {/* Border color */}
      <ColorPicker
        label="Border Color"
        value={borders.color}
        onChange={(e) => updateTokens({ borders: { color: e.target.value } })}
      />
    </div>
  );
}
