'use client';

import { useCallback, useState } from 'react';
import { useProductScenesStore } from '@/store/useProductScenesStore';

// =============================================================================
// INTERIOR DESIGN STYLE PRESETS
// These add atmosphere/style keywords to the user's prompt
// =============================================================================
const STYLE_PRESETS = [
  {
    id: 'none',
    label: 'Neutral',
    icon: '○',
    prompt: '', // No additional style
  },
  {
    id: 'mediterranean',
    label: 'Mediterran',
    icon: '🌊',
    prompt: 'Mediterranean style with warm terracotta tones, natural stone textures, olive wood accents, soft linen fabrics, and warm sunlight streaming through arched windows',
  },
  {
    id: 'scandinavian',
    label: 'Skandinavisch',
    icon: '🌲',
    prompt: 'Scandinavian style with light oak wood, white walls, minimal decor, cozy hygge atmosphere, natural textiles, and soft diffused daylight',
  },
  {
    id: 'industrial',
    label: 'Industrial',
    icon: '🏭',
    prompt: 'Industrial loft style with exposed brick walls, metal accents, polished concrete floors, Edison bulb lighting, and raw urban textures',
  },
  {
    id: 'midcentury',
    label: 'Mid-Century',
    icon: '🪑',
    prompt: 'Mid-century modern style with walnut furniture, organic curved shapes, muted earth tones, iconic statement lighting, and warm retro atmosphere',
  },
  {
    id: 'luxury',
    label: 'Luxus',
    icon: '✨',
    prompt: 'Luxury hotel style with high-end marble finishes, velvet textures, subtle gold accents, dramatic mood lighting, and sophisticated elegance',
  },
  {
    id: 'country',
    label: 'Landhaus',
    icon: '🏡',
    prompt: 'Country house style with rustic reclaimed wood beams, natural stone walls, linen curtains, dried flower arrangements, warm candlelight, and cozy farmhouse charm',
  },
  {
    id: 'colonial',
    label: 'Kolonial',
    icon: '🌴',
    prompt: 'Colonial style with dark hardwood furniture, rattan and wicker accents, tropical plants, ceiling fans, warm amber lighting, brass hardware, and elegant plantation atmosphere',
  },
  {
    id: 'shabbychic',
    label: 'Shabby Chic',
    icon: '🌸',
    prompt: 'Shabby chic style with distressed painted white furniture, vintage floral fabrics, pastel color palette, antique mirrors, soft romantic lighting, and charming imperfections',
  },
] as const;

type StylePresetId = typeof STYLE_PRESETS[number]['id'];

// =============================================================================
// ROOM TYPE PRESETS
// Common room types - can be combined with style presets
// =============================================================================
const ROOM_PRESETS = [
  {
    id: 'none',
    label: 'Keiner',
    icon: '○',
    prompt: '', // No room specified - user defines in prompt
  },
  {
    id: 'living',
    label: 'Wohnzimmer',
    icon: '🛋️',
    prompt: 'in a modern living room',
  },
  {
    id: 'kitchen',
    label: 'Küche',
    icon: '🍳',
    prompt: 'in a bright kitchen',
  },
  {
    id: 'dining',
    label: 'Esszimmer',
    icon: '🍽️',
    prompt: 'in an elegant dining room',
  },
  {
    id: 'terrace',
    label: 'Terrasse',
    icon: '☀️',
    prompt: 'on a sunny terrace',
  },
  {
    id: 'garden',
    label: 'Garten',
    icon: '🌳',
    prompt: 'in a beautiful garden setting',
  },
  {
    id: 'office',
    label: 'Büro',
    icon: '💼',
    prompt: 'in a professional home office',
  },
] as const;

type RoomPresetId = typeof ROOM_PRESETS[number]['id'];

// Generated prompt type
interface GeneratedPrompt {
  title: string;
  prompt: string;
}

interface BackgroundPromptProps {
  onGenerate: () => void;
}

export function BackgroundPrompt({ onGenerate }: BackgroundPromptProps) {
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

  // Selected presets
  const [selectedStyle, setSelectedStyle] = useState<StylePresetId>('none');
  const [selectedRoom, setSelectedRoom] = useState<RoomPresetId>('none');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (productImage && backgroundPrompt.trim()) {
      // Combine user prompt with room and style presets
      const stylePreset = STYLE_PRESETS.find(s => s.id === selectedStyle);
      const roomPreset = ROOM_PRESETS.find(r => r.id === selectedRoom);
      const stylePrompt = stylePreset?.prompt || '';
      const roomPrompt = roomPreset?.prompt || '';

      // Build combined prompt: [user prompt] [room] [style]
      const parts = [backgroundPrompt.trim()];
      if (roomPrompt) parts.push(roomPrompt);
      if (stylePrompt) parts.push(stylePrompt);
      const combinedPrompt = parts.join('. ');

      if (combinedPrompt !== backgroundPrompt.trim()) {
        // Temporarily set combined prompt for generation
        setBackgroundPrompt(combinedPrompt);
        // Use timeout to ensure state update before generation
        setTimeout(() => {
          onGenerate();
          // Restore original prompt after a short delay
          setTimeout(() => setBackgroundPrompt(backgroundPrompt.trim()), 100);
        }, 10);
      } else {
        onGenerate();
      }
    }
  }, [productImage, backgroundPrompt, selectedStyle, selectedRoom, setBackgroundPrompt, onGenerate]);

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
    setGeneratedPrompts([]); // Clear suggestions after selection
  }, [setBackgroundPrompt]);

  const canGenerate = productImage && backgroundPrompt.trim() && !isGenerating;
  const canGeneratePrompts = backgroundPrompt.trim().length >= 3 && !isGeneratingPrompts;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Interior Design Style Selector */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
          Innenarchitektur-Stil
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setSelectedStyle(style.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                ${selectedStyle === style.id
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50'
                  : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300'
                }`}
            >
              <span>{style.icon}</span>
              <span>{style.label}</span>
            </button>
          ))}
        </div>
        {selectedStyle !== 'none' && (
          <p className="mt-1.5 text-[10px] text-zinc-500">
            {STYLE_PRESETS.find(s => s.id === selectedStyle)?.prompt.slice(0, 60)}...
          </p>
        )}
      </div>

      {/* Room Type Selector */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
          Raum
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ROOM_PRESETS.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelectedRoom(room.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                ${selectedRoom === room.id
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300'
                }`}
            >
              <span>{room.icon}</span>
              <span>{room.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom prompt input */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
          Szene beschreiben
        </label>
        <textarea
          value={backgroundPrompt}
          onChange={(e) => setBackgroundPrompt(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100
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
        className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2
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
        className={`w-full px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2
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
