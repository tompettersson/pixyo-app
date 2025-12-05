'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui';

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    id: string;
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    download_location: string;
  };
}

interface UnsplashSearchProps {
  onSelectImage: (imageUrl: string, credit: { name: string; username: string; link: string }) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function UnsplashSearch({ onSelectImage, isOpen, onClose }: UnsplashSearchProps) {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(query)}&per_page=12&orientation=squarish`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Suche fehlgeschlagen');
      }

      const data = await response.json();
      setPhotos(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suche fehlgeschlagen');
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleSelectPhoto = async (photo: UnsplashPhoto) => {
    // Track download (required by Unsplash API guidelines)
    try {
      await fetch('/api/unsplash/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadLocation: photo.links.download_location }),
      });
    } catch {
      // Best effort - don't block selection
    }

    onSelectImage(
      photo.urls.regular, // Good quality, reasonable size
      {
        name: photo.user.name,
        username: photo.user.username,
        link: photo.user.links.html,
      }
    );
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-zinc-400" viewBox="0 0 32 32" fill="currentColor">
              <path d="M10 9V0H22V9H32V22H22V32H10V22H0V9H10ZM22 22H10V9H22V22Z" />
            </svg>
            <h2 className="text-lg font-medium text-zinc-100">Unsplash durchsuchen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="z.B. Koi, Teich, Sonnenuntergang..."
              className="flex-1 px-4 py-2.5 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100 
                         focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm
                         placeholder:text-zinc-600"
              autoFocus
            />
            <Button
              variant="secondary"
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? 'Suche...' : 'Suchen'}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="text-center py-8 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!hasSearched && !error && (
            <div className="text-center py-12 text-zinc-500 text-sm">
              Suche nach kostenlosen Fotos auf Unsplash
            </div>
          )}

          {hasSearched && photos.length === 0 && !isLoading && !error && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              Keine Bilder gefunden. Versuche einen anderen Suchbegriff.
            </div>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handleSelectPhoto(photo)}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-700/50 
                             hover:border-zinc-500 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  style={{ backgroundColor: photo.color }}
                >
                  <img
                    src={photo.urls.small}
                    alt={photo.alt_description || photo.description || 'Unsplash photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Hover overlay with credit */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <p className="text-white text-xs truncate">
                      📷 {photo.user.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-600">
            Fotos powered by{' '}
            <a 
              href="https://unsplash.com/?utm_source=pixyo&utm_medium=referral" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-300 underline"
            >
              Unsplash
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

