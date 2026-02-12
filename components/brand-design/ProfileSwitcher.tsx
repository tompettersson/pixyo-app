'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import type { Customer } from '@/types/customer';
import type { DesignTokens } from '@/types/designTokens';

interface ProfileFromAPI extends Customer {
  designTokens?: DesignTokens | null;
}

export default function ProfileSwitcher() {
  const [profiles, setProfiles] = useState<ProfileFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profileId, loadFromProfile } = useBrandDesignStore();
  const searchParams = useSearchParams();
  const autoLoadedRef = useRef(false);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await fetch('/api/profiles');
        if (!res.ok) throw new Error('Failed to load profiles');
        const data = await res.json();
        const loaded = data.profiles || [];
        setProfiles(loaded);

        // Auto-load profile from URL ?profile=<id>
        if (!autoLoadedRef.current && loaded.length > 0) {
          autoLoadedRef.current = true;
          const urlProfileId = searchParams.get('profile');
          if (urlProfileId) {
            const match = loaded.find((p: ProfileFromAPI) => p.id === urlProfileId);
            if (match) {
              loadFromProfile(match);
            }
          } else if (loaded.length === 1) {
            // Auto-load if only one profile
            loadFromProfile(loaded[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, [searchParams, loadFromProfile]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    loadFromProfile(profile);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <div className="w-3 h-3 border border-zinc-600 border-t-violet-500 rounded-full animate-spin" />
        Profile laden...
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-red-400">{error}</p>;
  }

  if (profiles.length === 0) {
    return (
      <div className="text-xs text-zinc-500">
        Keine Profile verfügbar. Bitte einloggen.
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm text-zinc-400 mb-1.5">Profil laden</label>
      <select
        value={profileId || ''}
        onChange={handleSelect}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          transition-all cursor-pointer text-sm"
      >
        <option value="">— Profil wählen —</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
