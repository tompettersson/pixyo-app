'use client';

import React, { useEffect, useState } from 'react';

interface AssetItem {
  id: string;
  url: string;
  width: number;
  height: number;
  type: string;
  meta: Record<string, unknown>;
}

interface AssetLibraryPickerProps {
  profileId: string;
  currentUrl: string;
  onSelect: (url: string) => void;
}

export default function AssetLibraryPicker({ profileId, currentUrl, onSelect }: AssetLibraryPickerProps) {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileId) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/assets?profileId=${profileId}&type=PRODUCT_SCENE`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.assets) {
          setAssets(data.assets);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profileId]);

  if (loading) {
    return (
      <p className="text-[10px] text-zinc-500 py-1">Bibliothek laden...</p>
    );
  }

  if (assets.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
        Product Scenes ({assets.length})
      </p>
      <div className="grid grid-cols-3 gap-2">
        {assets.slice(0, 9).map((asset) => (
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
              alt="Scene"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </button>
        ))}
      </div>
      {assets.length > 9 && (
        <p className="text-[10px] text-zinc-500 mt-1">
          +{assets.length - 9} weitere
        </p>
      )}
    </div>
  );
}
