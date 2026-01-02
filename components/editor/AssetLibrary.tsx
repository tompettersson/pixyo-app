"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";

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
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {filteredAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleAssetClick(asset)}
              className="relative aspect-square rounded overflow-hidden border border-zinc-700/50 
                         hover:border-zinc-500 transition-all hover:scale-105 group"
              title={asset.meta?.prompt || "Bild"}
            >
              <img
                src={asset.url}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


