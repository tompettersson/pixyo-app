'use client';

import { useCallback, useRef, useState } from 'react';
import { useProductScenesStore, type ProductImage, type ProductViewSlot, PRODUCT_VIEW_LABELS } from '@/store/useProductScenesStore';

interface SlotUploadProps {
  slot: ProductViewSlot;
  image: ProductImage | null;
  isCompositingMode: boolean;
  onUpload: (slot: ProductViewSlot, image: ProductImage) => void;
  onClear: (slot: ProductViewSlot) => void;
  disabled?: boolean;
}

function SlotUpload({ slot, image, isCompositingMode, onUpload, onClear, disabled }: SlotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const label = PRODUCT_VIEW_LABELS[slot];
  const isPrimary = slot === 0;

  const processFile = useCallback((file: File) => {
    // In compositing mode, only PNG or WebP allowed (for transparency)
    if (isCompositingMode) {
      if (file.type !== 'image/png' && file.type !== 'image/webp') {
        return; // Silently ignore invalid files
      }
    } else {
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return;
      }
    }

    if (file.size > 10 * 1024 * 1024) {
      return; // Max 10MB
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Full = e.target?.result as string;
      const base64Data = base64Full.split(',')[1];

      const productImage: ProductImage = {
        data: base64Data,
        mimeType: file.type,
        previewUrl: base64Full,
        label: label,
      };

      onUpload(slot, productImage);
    };
    reader.readAsDataURL(file);
  }, [slot, label, isCompositingMode, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  }, [processFile]);

  // If image exists, show preview
  if (image) {
    return (
      <div className="relative group">
        <div className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
          isPrimary
            ? 'border-violet-500/50 bg-zinc-800/50'
            : 'border-zinc-700/50 bg-zinc-800/30'
        }`}>
          <img
            src={image.previewUrl}
            alt={label}
            className="w-full h-full object-contain"
          />
        </div>
        {/* Label */}
        <span className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
          isPrimary ? 'bg-violet-500/90 text-white' : 'bg-zinc-700/90 text-zinc-300'
        }`}>
          {label}
        </span>
        {/* Clear button */}
        <button
          onClick={() => onClear(slot)}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-zinc-900/90 backdrop-blur text-zinc-400
                     hover:text-white hover:bg-red-600/80 transition-colors opacity-0 group-hover:opacity-100"
          title="Bild entfernen"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  // Empty slot - show upload button
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={isCompositingMode ? 'image/png,image/webp' : 'image/png,image/jpeg,image/webp'}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={disabled}
        className={`w-full aspect-square rounded-xl border-2 border-dashed transition-all
                    flex flex-col items-center justify-center gap-1.5
                    ${disabled
                      ? 'cursor-not-allowed opacity-40 border-zinc-800 bg-zinc-900/20'
                      : 'cursor-pointer'
                    }
                    ${!disabled && isDragOver
                      ? isCompositingMode
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-violet-500 bg-violet-500/10'
                      : !disabled
                        ? isPrimary
                          ? 'border-zinc-600 bg-zinc-800/40 hover:border-violet-500/50 hover:bg-zinc-800/60'
                          : 'border-zinc-700/50 bg-zinc-800/20 hover:border-zinc-600 hover:bg-zinc-800/40'
                        : ''
                    }`}
      >
        <svg className={`w-5 h-5 ${
          disabled ? 'text-zinc-700' :
          isDragOver
            ? isCompositingMode ? 'text-emerald-400' : 'text-violet-400'
            : 'text-zinc-500'
        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 4v16m8-8H4" />
        </svg>
        <span className={`text-[10px] font-medium ${
          disabled ? 'text-zinc-700' : 'text-zinc-500'
        }`}>
          {label}
        </span>
      </button>
    </div>
  );
}

export function ProductUpload() {
  const mode = useProductScenesStore((state) => state.mode);
  const productImages = useProductScenesStore((state) => state.productImages);
  const setProductImageAtSlot = useProductScenesStore((state) => state.setProductImageAtSlot);
  const setGenerationError = useProductScenesStore((state) => state.setGenerationError);

  const isCompositingMode = mode === 'compositing';

  const handleUpload = useCallback((slot: ProductViewSlot, image: ProductImage) => {
    setGenerationError(null);
    setProductImageAtSlot(slot, image);
  }, [setProductImageAtSlot, setGenerationError]);

  const handleClear = useCallback((slot: ProductViewSlot) => {
    setProductImageAtSlot(slot, null);
  }, [setProductImageAtSlot]);

  // Get images for each slot (may be undefined)
  const slot0Image = productImages[0] || null;
  const slot1Image = productImages[1] || null;
  const slot2Image = productImages[2] || null;

  // Slot 1 and 2 are only enabled if slot 0 has an image
  const hasMainImage = !!slot0Image;

  return (
    <div className="space-y-3">
      {/* Primary slot - larger */}
      <SlotUpload
        slot={0}
        image={slot0Image}
        isCompositingMode={isCompositingMode}
        onUpload={handleUpload}
        onClear={handleClear}
      />

      {/* Additional views - smaller, in a row */}
      <div className="grid grid-cols-2 gap-2">
        <SlotUpload
          slot={1}
          image={slot1Image}
          isCompositingMode={isCompositingMode}
          onUpload={handleUpload}
          onClear={handleClear}
          disabled={!hasMainImage}
        />
        <SlotUpload
          slot={2}
          image={slot2Image}
          isCompositingMode={isCompositingMode}
          onUpload={handleUpload}
          onClear={handleClear}
          disabled={!hasMainImage}
        />
      </div>

      {/* Info text */}
      {hasMainImage && productImages.length === 1 && (
        <p className="text-[10px] text-zinc-600 text-center">
          Optional: Weitere Ansichten hochladen für bessere Produkttreue
        </p>
      )}

      {productImages.length > 1 && (
        <div className="flex items-center gap-1.5 justify-center text-[10px] text-emerald-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {productImages.length} Ansichten für optimale Produkttreue
        </div>
      )}

      {/* Mode-specific hint (only when no images) */}
      {!hasMainImage && (
        isCompositingMode ? (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-300 leading-relaxed">
              <strong>Pixel-Perfekt:</strong> Lade ein freigestelltes PNG oder WebP hoch. Das Produkt wird 1:1 übernommen.
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 leading-relaxed">
            <strong>Tipp:</strong> Verwende ein Produktfoto mit weißem oder transparentem Hintergrund für beste Ergebnisse.
          </p>
        )
      )}
    </div>
  );
}
