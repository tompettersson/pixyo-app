"use client";

import { useState, useEffect } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";

interface Asset {
  id: string;
  type: "GENERATED" | "UNSPLASH";
  url: string;
  width: number;
  height: number;
  meta: Record<string, any>;
  createdAt: string;
}

interface AssetLibraryProps {
  profileId: string;
  onSelectAsset: (url: string, credit?: { name: string; username: string; link: string }) => void;
}

export function AssetLibrary({ profileId, onSelectAsset }: AssetLibraryProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"GENERATED" | "UNSPLASH">("GENERATED");

  useEffect(() => {
    loadAssets();
  }, [profileId]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assets?profileId=${profileId}`);
      if (!response.ok) throw new Error("Failed to load assets");
      const data = await response.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error("Failed to load assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => asset.type === activeTab);

  const handleAssetClick = (asset: Asset) => {
    const credit = asset.meta?.credit
      ? {
          name: asset.meta.credit.name,
          username: asset.meta.credit.username,
          link: asset.meta.credit.link,
        }
      : undefined;
    onSelectAsset(asset.url, credit);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-zinc-500 uppercase tracking-wider">
        Bildarchiv
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg">
        <button
          onClick={() => setActiveTab("GENERATED")}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all
            ${
              activeTab === "GENERATED"
                ? "bg-zinc-700 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
        >
          KI-Generiert
        </button>
        <button
          onClick={() => setActiveTab("UNSPLASH")}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all
            ${
              activeTab === "UNSPLASH"
                ? "bg-zinc-700 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
        >
          Unsplash
        </button>
      </div>

      {/* Thumbnails Grid */}
      {loading ? (
        <div className="text-center py-8 text-zinc-600 text-xs">Lädt...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-8 text-zinc-600 text-xs">
          Noch keine {activeTab === "GENERATED" ? "generierten" : "Unsplash"}{" "}
          Bilder gespeichert
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
          {filteredAssets.map((asset) => (
            <HoverCard.Root key={asset.id} openDelay={200} closeDelay={100}>
              <HoverCard.Trigger asChild>
                <button
                  onClick={() => handleAssetClick(asset)}
                  className="relative aspect-square rounded overflow-hidden border border-zinc-700/50
                             hover:border-fuchsia-500 transition-all group"
                >
                  <img
                    src={asset.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </HoverCard.Trigger>
              <HoverCard.Portal>
                <HoverCard.Content
                  side="right"
                  sideOffset={12}
                  className="z-[100] bg-zinc-900 rounded-lg shadow-2xl p-2 border border-zinc-700
                             animate-in fade-in-0 zoom-in-95 duration-200"
                >
                  <img
                    src={asset.url}
                    alt=""
                    className="w-72 h-72 object-cover rounded"
                  />
                  {asset.meta?.prompt && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 max-w-72">
                      {asset.meta.prompt}
                    </p>
                  )}
                  {asset.meta?.credit && (
                    <p className="text-xs text-zinc-500 mt-1">
                      📷 {asset.meta.credit.name}
                    </p>
                  )}
                  <HoverCard.Arrow className="fill-zinc-900" />
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
          ))}
        </div>
      )}
    </div>
  );
}


