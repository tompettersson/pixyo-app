'use client';

import { useCallback, useState } from 'react';

interface UseBackgroundRemovalResult {
  removeBackground: (imageUrl: string) => Promise<string>;
  isRemoving: boolean;
  error: string | null;
  progress: number;
}

/**
 * Hook for removing background from images using @imgly/background-removal
 * Runs entirely in the browser - no server required
 */
export function useBackgroundRemoval(): UseBackgroundRemovalResult {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const removeBackground = useCallback(async (imageUrl: string): Promise<string> => {
    setIsRemoving(true);
    setError(null);
    setProgress(0);

    try {
      // Dynamically import to avoid SSR issues
      const { removeBackground: removeBg } = await import('@imgly/background-removal');

      // Process the image
      const blob = await removeBg(imageUrl, {
        progress: (key, current, total) => {
          // Calculate overall progress
          const progressPercent = Math.round((current / total) * 100);
          setProgress(progressPercent);
        },
        // Use default model for best quality
        model: 'isnet', // 'isnet' | 'isnet_fp16' | 'isnet_quint8'
        output: {
          format: 'image/png',
          quality: 1,
        },
      });

      // Convert blob to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setProgress(100);
          resolve(dataUrl);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read processed image'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hintergrundentfernung fehlgeschlagen';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRemoving(false);
    }
  }, []);

  return {
    removeBackground,
    isRemoving,
    error,
    progress,
  };
}
