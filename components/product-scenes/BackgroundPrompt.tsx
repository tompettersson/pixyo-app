'use client';

import { useCallback, useState } from 'react';
import { useProductScenesStore } from '@/store/useProductScenesStore';
import type { SceneCategory } from '@/types/customer';
import { DEFAULT_SCENE_CATEGORIES } from '@/lib/product-scenes/defaultPresets';

// Generated prompt type
interface GeneratedPrompt {
  title: string;
  prompt: string;
}

// Color palette for category chips (cycles through these)
const CATEGORY_COLORS = [
  { active: 'bg-violet-500/20 text-violet-300 border-violet-500/50', label: 'text-zinc-500' },
  { active: 'bg-blue-500/20 text-blue-300 border-blue-500/50', label: 'text-zinc-500' },
  { active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', label: 'text-zinc-500' },
  { active: 'bg-amber-500/20 text-amber-300 border-amber-500/50', label: 'text-zinc-500' },
] as const;

interface BackgroundPromptProps {
  onGenerate: () => void;
  sceneCategories?: SceneCategory[];
}

export function BackgroundPrompt({ onGenerate, sceneCategories }: BackgroundPromptProps) {
  const backgroundPrompt = useProductScenesStore((state) => state.backgroundPrompt);
  const setBackgroundPrompt = useProductScenesStore((state) => state.setBackgroundPrompt);
  const productImage = useProductScenesStore((state) => state.productImage);
  const productAnalysis = useProductScenesStore((state) => state.productAnalysis);
  const isGenerating = useProductScenesStore((state) => state.isGenerating);
  const generationError = useProductScenesStore((state) => state.generationError);

  // Prompt generation state
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [promptError, setPromptError] = useState<string | null>(null);

  // Dynamic categories: use provided scene categories or fall back to defaults
  const categories = sceneCategories ?? DEFAULT_SCENE_CATEGORIES;

  // Selected preset per category: Record<categoryId, presetId>
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const cat of categories) {
      initial[cat.id] = cat.presets[0]?.id ?? 'none';
    }
    return initial;
  });

  // Reset selections when categories change (profile switch)
  const [prevCategoriesKey, setPrevCategoriesKey] = useState(() =>
    categories.map((c) => c.id).join(',')
  );
  const currentKey = categories.map((c) => c.id).join(',');
  if (currentKey !== prevCategoriesKey) {
    const initial: Record<string, string> = {};
    for (const cat of categories) {
      initial[cat.id] = cat.presets[0]?.id ?? 'none';
    }
    setSelections(initial);
    setPrevCategoriesKey(currentKey);
  }

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (productImage && backgroundPrompt.trim()) {
      // Collect prompt fragments from all selected presets
      const promptParts = [backgroundPrompt.trim()];
      for (const cat of categories) {
        const selectedId = selections[cat.id];
        if (selectedId && selectedId !== 'none') {
          const preset = cat.presets.find((p) => p.id === selectedId);
          if (preset?.prompt) {
            promptParts.push(preset.prompt);
          }
        }
      }

      const combinedPrompt = promptParts.join('. ');

      if (combinedPrompt !== backgroundPrompt.trim()) {
        setBackgroundPrompt(combinedPrompt);
        setTimeout(() => {
          onGenerate();
          setTimeout(() => setBackgroundPrompt(backgroundPrompt.trim()), 100);
        }, 10);
      } else {
        onGenerate();
      }
    }
  }, [productImage, backgroundPrompt, categories, selections, setBackgroundPrompt, onGenerate]);

  // Generate 3 optimized prompts via Claude
  const handleGeneratePrompts = useCallback(async () => {
    if (!backgroundPrompt.trim()) return;

    setIsGeneratingPrompts(true);
    setPromptError(null);
    setGeneratedPrompts([]);

    try {
      const response = await fetch('/api/generate-scene-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: backgroundPrompt.trim(),
          productType: productAnalysis?.product?.type_german,
          productBrand: productAnalysis?.product?.brand,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Prompt-Generierung fehlgeschlagen');
      }

      const data = await response.json();
      setGeneratedPrompts(data.prompts);
    } catch (error) {
      console.error('Prompt generation error:', error);
      setPromptError(
        error instanceof Error ? error.message : 'Prompt-Generierung fehlgeschlagen'
      );
    } finally {
      setIsGeneratingPrompts(false);
    }
  }, [backgroundPrompt, productAnalysis]);

  // Select a generated prompt
  const handleSelectPrompt = useCallback((prompt: string) => {
    setBackgroundPrompt(prompt);
    setGeneratedPrompts([]);
  }, [setBackgroundPrompt]);

  const canGenerate = productImage && backgroundPrompt.trim() && !isGenerating;
  const canGeneratePrompts = backgroundPrompt.trim().length >= 3 && !isGeneratingPrompts;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Dynamic Scene Category Selectors */}
      {categories.map((category, catIdx) => {
        const colorScheme = CATEGORY_COLORS[catIdx % CATEGORY_COLORS.length];
        const selectedId = selections[category.id] ?? 'none';

        return (
          <div key={category.id}>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
              {category.label}
            </label>
            <div className="flex flex-wrap gap-1">
              {category.presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    setSelections((prev) => ({ ...prev, [category.id]: preset.id }))
                  }
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1
                    ${selectedId === preset.id
                      ? `${colorScheme.active} border`
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300'
                    }`}
                >
                  <span className="text-xs">{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
            {selectedId !== 'none' && (() => {
              const preset = category.presets.find((p) => p.id === selectedId);
              return preset?.prompt ? (
                <p className="mt-1.5 text-[10px] text-zinc-500">
                  {preset.prompt.slice(0, 60)}...
                </p>
              ) : null;
            })()}
          </div>
        );
      })}

      {/* Custom prompt input */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
          Szene beschreiben
        </label>
        <textarea
          value={backgroundPrompt}
          onChange={(e) => setBackgroundPrompt(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-xl bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100
                     focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-sm resize-none
                     placeholder:text-zinc-600"
          placeholder="z.B. 'Modernes Wohnzimmer mit Bergblick' oder 'Minimalistisches Loft'"
        />
      </div>

      {/* Generate Prompts Button */}
      <button
        type="button"
        onClick={handleGeneratePrompts}
        disabled={!canGeneratePrompts}
        className={`w-full px-3 py-2 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2
          ${canGeneratePrompts
            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
            : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
          }`}
      >
        {isGeneratingPrompts ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generiere Varianten...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            3 Prompt-Varianten generieren
          </>
        )}
      </button>

      {/* Prompt Error */}
      {promptError && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400">{promptError}</p>
        </div>
      )}

      {/* Generated Prompts Selection */}
      {generatedPrompts.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs text-zinc-500 uppercase tracking-wider">
            Variante auswählen
          </label>
          <div className="space-y-2">
            {generatedPrompts.map((gp, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectPrompt(gp.prompt)}
                className="w-full text-left p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50
                           hover:bg-zinc-700/50 hover:border-violet-500/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400
                                   flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white">
                      {gp.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {gp.prompt}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 flex-shrink-0 mt-1"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setGeneratedPrompts([])}
            className="w-full text-xs text-zinc-500 hover:text-zinc-400 py-1"
          >
            Varianten ausblenden
          </button>
        </div>
      )}

      {/* Error message */}
      {generationError && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{generationError}</p>
        </div>
      )}

      {/* Generate Image button */}
      <button
        type="submit"
        disabled={!canGenerate}
        className={`w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2
          ${canGenerate
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
      >
        {isGenerating ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generiere Szene...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            Bild mit KI generieren
          </>
        )}
      </button>

      {/* Help text */}
      {!productImage && (
        <p className="text-xs text-zinc-500 text-center">
          Lade zuerst ein Produktbild hoch
        </p>
      )}
    </form>
  );
}
