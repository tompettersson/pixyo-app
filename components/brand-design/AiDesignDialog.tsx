'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import type { DeepPartial, DesignTokens } from '@/types/designTokens';

interface AiDesignDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AiDesignDialog({ open, onClose }: AiDesignDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { tokens, updateTokens, setTokens } = useBrandDesignStore();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/brand-design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          currentTokens: tokens,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Generierung fehlgeschlagen');
      }

      const { tokens: generatedTokens } = await res.json();

      // Deep-merge generated tokens into current state
      updateTokens(generatedTokens as DeepPartial<DesignTokens>);
      onClose();
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, [prompt, tokens, updateTokens, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">KI Design-Generierung</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Beschreibe die Marke oder den gewünschten Stil. Die KI generiert passende Design Tokens.
            </p>
          </div>

          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="z.B. &quot;Modernes Fintech-Startup, dunkelblau + gold, professionell aber nahbar&quot; oder &quot;Bio-Laden, warm und natürlich, erdige Töne&quot;"
            rows={4}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200
              placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Example prompts */}
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Beispiele</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Premium SaaS, minimal, viel Weißraum',
                'Handwerksbäckerei, warm, traditionell',
                'Modernes Fitnessstudio, energisch, dunkel',
                'Kinder-App, bunt, verspielt, rund',
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="px-2 py-1 bg-zinc-800/50 hover:bg-zinc-800 text-[10px] text-zinc-400 rounded-md transition-colors cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-zinc-800/50 border-t border-zinc-800">
          <span className="text-[10px] text-zinc-600">Cmd+Enter zum Generieren</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg
                hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Generiere...
                </span>
              ) : (
                'Generieren'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
