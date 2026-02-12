'use client';

import React, { useState, useCallback } from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import { generateCSSVariables } from '@/lib/brand-design/export-css';
import { generateLLMContext } from '@/lib/brand-design/export-llm-context';
import { generateTailwindConfig } from '@/lib/brand-design/export-tailwind';

type ExportFormat = 'json' | 'css' | 'tailwind' | 'llm';

export default function ExportPanel() {
  const { tokens, profileName, resetToDefaults } = useBrandDesignStore();
  const [copied, setCopied] = useState<ExportFormat | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleCopy = useCallback(
    async (format: ExportFormat) => {
      let content: string;
      switch (format) {
        case 'json':
          content = JSON.stringify(tokens, null, 2);
          break;
        case 'css':
          content = generateCSSVariables(tokens);
          break;
        case 'tailwind':
          content = generateTailwindConfig(tokens);
          break;
        case 'llm':
          content = generateLLMContext(tokens, profileName);
          break;
      }

      try {
        await navigator.clipboard.writeText(content);
        setCopied(format);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        console.error('Copy failed');
      }
    },
    [tokens, profileName]
  );

  const exports: Array<{ id: ExportFormat; label: string; desc: string }> = [
    { id: 'json', label: 'JSON', desc: 'Vollständiges Token-Set' },
    { id: 'css', label: 'CSS Variables', desc: 'Custom Properties' },
    { id: 'tailwind', label: 'Tailwind v4', desc: '@theme Directive' },
    { id: 'llm', label: 'LLM Context', desc: 'KI-System-Prompt' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Export</h3>
      <div className="grid grid-cols-2 gap-2">
        {exports.map((exp) => (
          <button
            key={exp.id}
            onClick={() => handleCopy(exp.id)}
            className="flex flex-col items-start px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg
              transition-colors text-left cursor-pointer"
          >
            <span className="text-xs font-medium text-zinc-200">
              {copied === exp.id ? 'Kopiert!' : exp.label}
            </span>
            <span className="text-[10px] text-zinc-500">{exp.desc}</span>
          </button>
        ))}
      </div>

      {/* Reset */}
      <div className="pt-2">
        {confirmReset ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetToDefaults();
                setConfirmReset(false);
              }}
              className="flex-1 px-3 py-2 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors cursor-pointer"
            >
              Ja, zurücksetzen
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 px-3 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full px-3 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            Auf Standard zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
