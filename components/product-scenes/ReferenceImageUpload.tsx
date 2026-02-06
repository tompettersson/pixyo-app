'use client';

import { useCallback, useRef, useState } from 'react';
import { useProductScenesStore, type ReferenceImage } from '@/store/useProductScenesStore';

export function ReferenceImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const referenceImage = useProductScenesStore((state) => state.referenceImage);
  const setReferenceImage = useProductScenesStore((state) => state.setReferenceImage);
  const setGenerationError = useProductScenesStore((state) => state.setGenerationError);

  const processFile = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setGenerationError('Nur PNG, JPEG oder WebP Bilder erlaubt');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setGenerationError('Bild darf maximal 10MB groß sein');
      return;
    }

    setGenerationError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Full = e.target?.result as string;
      // Extract just the base64 data without the data URL prefix
      const base64Data = base64Full.split(',')[1];

      const image: ReferenceImage = {
        data: base64Data,
        mimeType: file.type,
        previewUrl: base64Full,
      };

      setReferenceImage(image);
    };
    reader.readAsDataURL(file);
  }, [setReferenceImage, setGenerationError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [processFile]);

  const handleClear = useCallback(() => {
    setReferenceImage(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [setReferenceImage]);

  if (referenceImage) {
    return (
      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={referenceImage.previewUrl}
            alt="Referenzbild"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xs text-zinc-400 flex-1 truncate">Referenzbild geladen</span>
        <button
          onClick={handleClear}
          className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors flex-shrink-0"
          title="Referenzbild entfernen"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full h-10 rounded-lg border-2 border-dashed transition-all
                    flex items-center justify-center gap-2 cursor-pointer
                    ${isDragOver
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50'
                    }`}
      >
        <svg className={`w-4 h-4 ${isDragOver ? 'text-emerald-400' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <span className={`text-xs font-medium ${isDragOver ? 'text-emerald-300' : 'text-zinc-400'}`}>
          {isDragOver ? 'Ablegen' : 'Referenzbild hochladen'}
        </span>
      </button>
    </div>
  );
}
