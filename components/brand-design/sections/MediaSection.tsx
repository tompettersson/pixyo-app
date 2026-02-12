'use client';

import React from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { Input } from '@/components/ui/Input';

export default function MediaSection() {
  const { tokens, updateTokens } = useBrandDesignStore();
  const { media } = tokens;

  return (
    <div className="space-y-4">
      {/* Logo variants */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Logo-Varianten</span>
        {media.logoVariants.primary && (
          <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
            <img
              src={media.logoVariants.primary}
              alt="Primary Logo"
              className="w-12 h-12 object-contain"
              crossOrigin="anonymous"
            />
            <span className="text-xs text-zinc-400">Primäres Logo (aus Profil)</span>
          </div>
        )}
      </div>

      {/* Image style */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Bildsprache</span>
        <textarea
          value={media.imageStyle}
          onChange={(e) => updateTokens({ media: { imageStyle: e.target.value } })}
          placeholder="z.B. Warme, natürliche Lifestyle-Fotografie mit weichem Licht"
          rows={2}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200
            placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>

      {/* Icon style */}
      <Input
        label="Icon-Stil"
        value={media.iconStyle}
        onChange={(e) => updateTokens({ media: { iconStyle: e.target.value } })}
        placeholder="z.B. Outlined, 1.5px stroke, rounded"
      />
    </div>
  );
}
