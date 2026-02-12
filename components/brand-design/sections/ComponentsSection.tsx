'use client';

import React from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { ButtonStyle } from '@/types/designTokens';

function ButtonEditor({
  label,
  style,
  onChange,
}: {
  label: string;
  style: ButtonStyle;
  onChange: (patch: Partial<ButtonStyle>) => void;
}) {
  return (
    <div className="space-y-2 bg-zinc-800/30 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        {/* Live preview button */}
        <button
          className="text-xs px-3 py-1 transition-colors"
          style={{
            background: style.background,
            color: style.color,
            border: style.border === 'none' ? 'none' : style.border,
            borderRadius: style.borderRadius,
            fontWeight: style.fontWeight,
            textTransform: style.textTransform,
          }}
        >
          Button
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorPicker label="Background" value={style.background === 'transparent' ? '#000000' : style.background} onChange={(e) => onChange({ background: e.target.value })} />
        <ColorPicker label="Text" value={style.color} onChange={(e) => onChange({ color: e.target.value })} />
      </div>
      <Input
        label="Border Radius"
        value={style.borderRadius}
        onChange={(e) => onChange({ borderRadius: e.target.value })}
      />
      <Select
        label="Text Transform"
        value={style.textTransform}
        onChange={(e) => onChange({ textTransform: e.target.value as 'none' | 'uppercase' })}
        options={[
          { value: 'none', label: 'Normal' },
          { value: 'uppercase', label: 'UPPERCASE' },
        ]}
      />
    </div>
  );
}

export default function ComponentsSection() {
  const { tokens, updateTokens } = useBrandDesignStore();
  const { components } = tokens;

  const updateButton = (variant: keyof typeof components.button, patch: Partial<ButtonStyle>) => {
    updateTokens({
      components: {
        button: {
          [variant]: { ...components.button[variant], ...patch },
        },
      },
    } as never);
  };

  return (
    <div className="space-y-4">
      {/* Buttons */}
      <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Buttons</span>
      <ButtonEditor label="Primary" style={components.button.primary} onChange={(p) => updateButton('primary', p)} />
      <ButtonEditor label="Secondary" style={components.button.secondary} onChange={(p) => updateButton('secondary', p)} />
      <ButtonEditor label="Outline" style={components.button.outline} onChange={(p) => updateButton('outline', p)} />
      <ButtonEditor label="Ghost" style={components.button.ghost} onChange={(p) => updateButton('ghost', p)} />

      {/* Card */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Card</span>
        <Input
          label="Border Radius"
          value={components.card.borderRadius}
          onChange={(e) => updateTokens({ components: { card: { borderRadius: e.target.value } } })}
        />
        <Input
          label="Padding"
          value={components.card.padding}
          onChange={(e) => updateTokens({ components: { card: { padding: e.target.value } } })}
        />
      </div>

      {/* Link */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Link</span>
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            label="Farbe"
            value={components.link.color}
            onChange={(e) => updateTokens({ components: { link: { color: e.target.value } } })}
          />
          <ColorPicker
            label="Hover"
            value={components.link.hoverColor}
            onChange={(e) => updateTokens({ components: { link: { hoverColor: e.target.value } } })}
          />
        </div>
      </div>
    </div>
  );
}
