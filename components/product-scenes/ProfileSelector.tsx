'use client';

import { useState, useEffect, useRef } from 'react';

interface Profile {
  id: string;
  name: string;
  logo: string;
}

interface ProfileSelectorProps {
  selectedProfileId: string | null;
  onProfileChange: (profileId: string) => void;
}

export function ProfileSelector({ selectedProfileId, onProfileChange }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = await fetch('/api/profiles');
        if (!response.ok) {
          console.error('Profile API error:', response.status, response.statusText);
          throw new Error('Failed to load profiles');
        }
        const data = await response.json();
        console.log('Loaded profiles:', data.profiles?.length || 0);

        if (data.profiles && data.profiles.length > 0) {
          setProfiles(data.profiles);
          // Auto-select first profile if none selected
          if (!selectedProfileId) {
            onProfileChange(data.profiles[0].id);
          }
        } else {
          console.warn('No profiles found in API response');
          setLoadError('Keine Profile gefunden');
        }
      } catch (error) {
        console.error('Failed to load profiles:', error);
        setLoadError('Profile konnten nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
              top: rect.bottom + 4,
              left: rect.left,
            });
          }
          setIsOpen(!isOpen);
        }}
        disabled={isLoading || profiles.length === 0}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
          bg-zinc-800/50 border border-zinc-700/50
          text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600
          disabled:opacity-50 disabled:cursor-not-allowed"
        title="Profil auswählen"
      >
        {/* Building Icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>

        {isLoading ? (
          <div className="w-3 h-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        ) : loadError ? (
          <span className="truncate max-w-32 text-red-400">
            {loadError}
          </span>
        ) : (
          <span className="truncate max-w-32">
            {selectedProfile?.name || 'Profil wählen'}
          </span>
        )}

        {/* Chevron */}
        <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && profiles.length > 0 && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div
            className="fixed bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl overflow-hidden min-w-48 z-[70]"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            <div className="px-3 py-2 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-700">
              Speichern für
            </div>
            {profiles.map((profile) => {
              const isActive = profile.id === selectedProfileId;

              return (
                <button
                  key={profile.id}
                  onClick={() => {
                    onProfileChange(profile.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2
                    ${isActive
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-300 hover:bg-zinc-700/50'
                    }`}
                >
                  {isActive && (
                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                  <span className={!isActive ? 'ml-5' : ''}>{profile.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
