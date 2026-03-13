'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface AssetItem {
  id: string;
  url: string;
  width: number;
  height: number;
  type: string;
  meta: Record<string, unknown>;
}

type AssetFilter = 'ALL' | 'PRODUCT_SCENE' | 'GENERATED' | 'UPLOADED';

interface AssetLibraryPickerProps {
  profileId: string;
  currentUrl: string;
  onSelect: (url: string) => void;
}

export default function AssetLibraryPicker({ profileId, currentUrl, onSelect }: AssetLibraryPickerProps) {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<AssetFilter>('ALL');

  // Fetch all asset types for this profile
  useEffect(() => {
    if (!profileId) return;

    let cancelled = false;
    setLoading(true);

    // Fetch all types in parallel
    Promise.all([
      fetch(`/api/assets?profileId=${profileId}&type=PRODUCT_SCENE`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/assets?profileId=${profileId}&type=GENERATED`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/assets?profileId=${profileId}&type=UPLOADED`).then((r) => r.ok ? r.json() : null),
    ])
      .then(([scenes, generated, uploaded]) => {
        if (cancelled) return;
        const all: AssetItem[] = [
          ...(scenes?.assets || []),
          ...(generated?.assets || []),
          ...(uploaded?.assets || []),
        ];
        setAssets(all);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profileId]);

  const filteredAssets = filter === 'ALL' ? assets : assets.filter((a) => a.type === filter);

  const handleSelect = useCallback((url: string) => {
    onSelect(url);
    setModalOpen(false);
  }, [onSelect]);

  if (loading) {
    return <p className="text-[10px] text-zinc-500 py-1">Bibliothek laden...</p>;
  }

  if (assets.length === 0) return null;

  const productScenes = assets.filter((a) => a.type === 'PRODUCT_SCENE');
  const previewAssets = productScenes.length > 0 ? productScenes : assets;

  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
        Bild-Bibliothek ({assets.length})
      </p>

      {/* Preview grid — max 9 items */}
      <div className="grid grid-cols-3 gap-2">
        {previewAssets.slice(0, 9).map((asset) => (
          <button
            key={asset.id}
            onClick={() => onSelect(asset.url)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
              currentUrl === asset.url
                ? 'border-violet-500 ring-1 ring-violet-500/50'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}
          >
            <img
              src={asset.url}
              alt="Asset"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </button>
        ))}
      </div>

      {/* "Show all" button */}
      {assets.length > 9 && (
        <button
          onClick={() => setModalOpen(true)}
          className="mt-2 w-full py-1.5 text-[11px] text-violet-400 hover:text-violet-300 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          Alle anzeigen ({assets.length})
        </button>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-[640px] max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-200">Bild-Bibliothek</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 px-4 py-2 border-b border-zinc-800">
              {([
                { value: 'ALL', label: 'Alle' },
                { value: 'PRODUCT_SCENE', label: 'Product Scenes' },
                { value: 'GENERATED', label: 'Generiert' },
                { value: 'UPLOADED', label: 'Uploads' },
              ] as { value: AssetFilter; label: string }[]).map((tab) => {
                const count = tab.value === 'ALL'
                  ? assets.length
                  : assets.filter((a) => a.type === tab.value).length;
                if (count === 0 && tab.value !== 'ALL') return null;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      filter === tab.value
                        ? 'bg-violet-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-4 gap-3">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleSelect(asset.url)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video group ${
                      currentUrl === asset.url
                        ? 'border-violet-500 ring-1 ring-violet-500/50'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt="Asset"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                    {currentUrl === asset.url && (
                      <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <span className="text-[9px] text-zinc-300">{asset.type.replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
              {filteredAssets.length === 0 && (
                <p className="text-sm text-zinc-600 text-center py-8">Keine Bilder in dieser Kategorie</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
