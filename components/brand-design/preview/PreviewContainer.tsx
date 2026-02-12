'use client';

import React from 'react';
import { useBrandDesignStore } from '@/store/useBrandDesignStore';
import MoodboardView from './MoodboardView';

const TABS = [
  { id: 'moodboard' as const, label: 'Moodboard' },
  { id: 'guidelines' as const, label: 'Guidelines' },
  { id: 'page-preview' as const, label: 'Page Preview' },
] as const;

export default function PreviewContainer() {
  const { activePreviewTab, setPreviewTab, tokens, profileName } = useBrandDesignStore();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Pill Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-zinc-900 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPreviewTab(tab.id)}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
              activePreviewTab === tab.id
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            } ${tab.id !== 'moodboard' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={tab.id !== 'moodboard'}
            title={tab.id !== 'moodboard' ? 'Kommt in Phase 2' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active View */}
      {activePreviewTab === 'moodboard' && (
        <MoodboardView tokens={tokens} profileName={profileName} />
      )}

      {activePreviewTab === 'guidelines' && (
        <div className="flex items-center justify-center h-96 text-zinc-600">
          Brand Guidelines — Phase 2
        </div>
      )}

      {activePreviewTab === 'page-preview' && (
        <div className="flex items-center justify-center h-96 text-zinc-600">
          Page Preview — Phase 2
        </div>
      )}
    </div>
  );
}
