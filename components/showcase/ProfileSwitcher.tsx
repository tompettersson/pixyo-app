'use client';

import React, { useEffect, useState } from 'react';
import { useBannerConfigStore } from '@/store/useBannerConfigStore';
import type { Customer } from '@/types/customer';

interface ProfileFromAPI {
  id: string;
  name: string;
  slug: string;
  logo: string;
  colors: Customer['colors'];
  fonts: Customer['fonts'];
  layout: Customer['layout'];
  systemPrompt: string;
  logoVariants?: Customer['logoVariants'];
}

export default function ProfileSwitcher() {
  const [profiles, setProfiles] = useState<ProfileFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profileId, loadFromProfile } = useBannerConfigStore();

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await fetch('/api/profiles');
        if (!res.ok) throw new Error('Failed to load profiles');
        const data = await res.json();
        setProfiles(data.profiles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;

    // Convert API profile to Customer type for loadFromProfile
    const customer: Customer = {
      id: profile.id,
      slug: profile.slug,
      name: profile.name,
      logo: profile.logo,
      logoVariants: profile.logoVariants || null,
      colors: profile.colors,
      fonts: profile.fonts,
      layout: profile.layout,
      systemPrompt: profile.systemPrompt,
    };

    loadFromProfile(customer);
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
