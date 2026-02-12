'use client';

import React, { useCallback, useState } from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { Select } from '@/components/ui/Select';

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm text-zinc-400">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-1">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-xs text-zinc-300 rounded-md"
          >
            {tag}
            <button
              onClick={() => removeTag(i)}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200
          placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
    </div>
  );
}

export default function VoiceSection() {
  const { tokens, updateTokens } = useBrandDesignStore();
  const { voice } = tokens;

  return (
    <div className="space-y-4">
      {/* Formality */}
      <Select
        label="Formalität"
        value={voice.formality}
        onChange={(e) =>
          updateTokens({ voice: { formality: e.target.value as 'formal' | 'neutral' | 'casual' } })
        }
        options={[
          { value: 'formal', label: 'Formell (Sie)' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'casual', label: 'Locker (du)' },
        ]}
      />

      {/* Address */}
      <Select
        label="Anrede"
        value={voice.address}
        onChange={(e) =>
          updateTokens({ voice: { address: e.target.value as 'du' | 'Sie' | 'ihr' } })
        }
        options={[
          { value: 'du', label: 'du' },
          { value: 'Sie', label: 'Sie' },
          { value: 'ihr', label: 'ihr' },
        ]}
      />

      {/* Tone tags */}
      <TagInput
        label="Tonalität"
        tags={voice.tone}
        onChange={(tone) => updateTokens({ voice: { tone } })}
        placeholder="z.B. freundlich, professionell... (Enter)"
      />

      {/* Languages */}
      <TagInput
        label="Sprachen"
        tags={voice.languages}
        onChange={(languages) => updateTokens({ voice: { languages } })}
        placeholder="z.B. de, en... (Enter)"
      />

      {/* Dos / Don'ts */}
      <TagInput
        label="Dos"
        tags={voice.dos}
        onChange={(dos) => updateTokens({ voice: { dos } })}
        placeholder="z.B. Kurze Sätze verwenden (Enter)"
      />
      <TagInput
        label="Don'ts"
        tags={voice.donts}
        onChange={(donts) => updateTokens({ voice: { donts } })}
        placeholder="z.B. Keine Fachbegriffe ohne Erklärung (Enter)"
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">Brand Voice Beschreibung</label>
        <textarea
          value={voice.description}
          onChange={(e) => updateTokens({ voice: { description: e.target.value } })}
          placeholder="Freitext-Beschreibung der Markenstimme..."
          rows={3}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200
            placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>
    </div>
  );
}
