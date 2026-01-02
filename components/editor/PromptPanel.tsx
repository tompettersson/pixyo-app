'use client';

import { useState } from 'react';
import { Button, Select } from '@/components/ui';
import { StylePresetSelector } from './StylePresetSelector';
import { useEditorStore } from '@/store/useEditorStore';
import { STYLE_PRESETS, type StylePreset } from '@/lib/stylePresets';
import { ASPECT_RATIOS } from '@/types/layers';
import type { GeneratePromptRequest, GenerateImageRequest } from '@/types/api';

export function PromptPanel() {
  const [userIdea, setUserIdea] = useState('');
  const [mode, setMode] = useState<'photo' | 'illustration'>('photo');
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(STYLE_PRESETS[0]);
  
  const {
    canvas,
    currentPrompt,
    isGeneratingPrompt,
    isGeneratingImage,
    generatedImages,
    setAspectRatio,
    setCurrentPrompt,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    setBackgroundImage,
    addGeneratedImage,
  } = useEditorStore();

  const aspectRatioOptions = Object.entries(ASPECT_RATIOS).map(([key, value]) => ({
    value: key,
    label: value.label,
  }));

  const handleModeChange = (newMode: 'photo' | 'illustration') => {
    setMode(newMode);
    // Select first preset of new mode
    const firstPreset = STYLE_PRESETS.find((p) => p.mode === newMode);
    if (firstPreset) setSelectedPreset(firstPreset);
  };

  const handleGeneratePrompt = async () => {
    if (!userIdea.trim()) return;
    
    setIsGeneratingPrompt(true);
    try {
      const request: GeneratePromptRequest = {
        userIdea: userIdea.trim(),
        styleId: selectedPreset.id,
        mode,
        aspectRatio: canvas.aspectRatio as '1:1' | '4:5' | '16:9' | '9:16',
      };

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setCurrentPrompt(data.prompt);
    } catch (error) {
      console.error('Prompt generation error:', error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!currentPrompt.trim()) return;

    setIsGeneratingImage(true);
    try {
      const request: GenerateImageRequest = {
        prompt: currentPrompt.trim(),
        mode,
        aspectRatio: canvas.aspectRatio as '1:1' | '4:5' | '16:9' | '9:16',
      };

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      if (data.images && data.images.length > 0) {
        data.images.forEach((img: { id: string; url: string; createdAt: string }) => {
          addGeneratedImage(img);
        });
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSelectGeneratedImage = (url: string) => {
    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      setBackgroundImage(url, img.width, img.height);
    };
    img.src = url;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">AI Generator</h2>
        <p className="text-sm text-zinc-500 mt-1">Describe your image idea</p>
      </div>

      {/* User Idea Input */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Your Idea</label>
        <textarea
          value={userIdea}
          onChange={(e) => setUserIdea(e.target.value)}
          placeholder="A woman running through a vibrant city street with plenty of negative space for text..."
          className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 
            placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
            resize-none"
        />
      </div>

      {/* Mode Toggle */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('photo')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${mode === 'photo'
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
          >
            📷 Photo
          </button>
          <button
            onClick={() => handleModeChange('illustration')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${mode === 'illustration'
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
          >
            🎨 Illustration
          </button>
        </div>
      </div>

      {/* Style Preset */}
      <StylePresetSelector
        mode={mode}
        selectedPresetId={selectedPreset.id}
        onSelect={setSelectedPreset}
      />

      {/* Aspect Ratio */}
      <Select
        label="Aspect Ratio"
        options={aspectRatioOptions}
        value={canvas.aspectRatio}
        onChange={(e) => setAspectRatio(e.target.value)}
      />

      {/* Generate Prompt Button */}
      <Button
        variant="secondary"
        className="w-full"
        onClick={handleGeneratePrompt}
        isLoading={isGeneratingPrompt}
        disabled={!userIdea.trim() || isGeneratingPrompt}
      >
        ✨ Generate Prompt
      </Button>

      {/* Generated Prompt */}
      {currentPrompt && (
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Generated Prompt</label>
          <textarea
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 
              text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
              resize-none"
          />
        </div>
      )}

      {/* Generate Image Button */}
      <Button
        variant="primary"
        className="w-full"
        onClick={handleGenerateImage}
        isLoading={isGeneratingImage}
        disabled={!currentPrompt.trim() || isGeneratingImage}
      >
        🖼️ Generate Image
      </Button>

      {/* Generated Images History */}
      {generatedImages.length > 0 && (
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Generated Images</label>
          <div className="grid grid-cols-2 gap-2">
            {generatedImages.map((image) => (
              <button
                key={image.id}
                onClick={() => handleSelectGeneratedImage(image.url)}
                className="aspect-square rounded-lg overflow-hidden border-2 border-zinc-700 hover:border-violet-500 transition-colors"
              >
                <img
                  src={image.url}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}





