'use client';

import React from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';

const SHADOW_KEYS = ['sm', 'md', 'lg', 'xl'] as const;

export default function ShadowsSection() {
  const { tokens, updateTokens } = useBrandDesignStore();
  const { shadows } = tokens;

  return (
    <div className="space-y-4">
      {SHADOW_KEYS.map((key) => (
        <div key={key} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400 uppercase font-mono w-6">{key}</label>
            <input
              type="text"
              value={shadows[key]}
              onChange={(e) =>
                updateTokens({ shadows: { [key]: e.target.value } } as never)
              }
              className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200
                font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          {/* Visual preview */}
          <div className="flex justify-center py-2">
            <div
              className="w-16 h-16 bg-zinc-100 rounded-lg"
              style={{ boxShadow: shadows[key] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
