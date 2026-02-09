"use client";

import { useState } from "react";

function LogoThumbnail({ profile }: { profile: AdminProfile }) {
  const [broken, setBroken] = useState(false);

  // Prefer white variant (logoVariants.dark) for dark background
  const logoUrl = profile.logoVariants?.dark || profile.logo;

  if (!logoUrl || broken) {
    return (
      <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-7 h-7 text-zinc-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center p-2.5 flex-shrink-0">
      <img
        src={logoUrl}
        alt={profile.name}
        className="max-w-full max-h-full object-contain"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

interface AdminProfile {
  id: string;
  name: string;
  slug: string;
  userId: string;
  logo: string;
  logoVariants: { dark: string; light: string } | null;
  colors: { dark: string; light: string; accent: string };
  fonts: {
    headline: {
      family: string;
      size: number;
      weight?: string;
      uppercase?: boolean;
    };
    body: { family: string; size: number; weight?: string };
  };
  layout: {
    padding: { top: number; right: number; bottom: number; left: number };
    gaps: {
      taglineToHeadline: number;
      headlineToBody: number;
      bodyToButton: number;
    };
    button: { radius: number; paddingX: number; paddingY: number };
  };
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  _count: { assets: number; designs: number };
}

interface StackUser {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
}

interface CustomerListProps {
  profiles: AdminProfile[];
  users: StackUser[];
  selectedProfileId: string | null;
  onSelect: (profile: AdminProfile) => void;
  loading: boolean;
}

export function CustomerList({
  profiles,
  users,
  selectedProfileId,
  onSelect,
  loading,
}: CustomerListProps) {
  const getUserDisplay = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return userId === "system-seed-user" ? "System" : userId.slice(0, 8) + "...";
    return user.displayName || user.primaryEmail || user.id.slice(0, 8);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500">
        <svg
          className="animate-spin h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Laden...
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-zinc-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-sm">Noch keine Kunden angelegt</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800/50">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => onSelect(profile)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/50
            ${
              selectedProfileId === profile.id
                ? "bg-zinc-800/70 border-l-2 border-violet-500"
                : "border-l-2 border-transparent"
            }`}
        >
          {/* Logo Thumbnail — white variant on dark bg, fallback icon */}
          <LogoThumbnail profile={profile} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-200 truncate">
                {profile.name}
              </span>
              {/* Color swatches */}
              <div className="flex gap-0.5 flex-shrink-0">
                <div
                  className="w-3 h-3 rounded-full border border-zinc-600"
                  style={{ backgroundColor: profile.colors.dark }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-zinc-600"
                  style={{ backgroundColor: profile.colors.accent }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-500 truncate">
                {getUserDisplay(profile.userId)}
              </span>
              <span className="text-xs text-zinc-600">
                {profile._count.assets}A / {profile._count.designs}D
              </span>
            </div>
          </div>

          {/* Arrow */}
          <svg
            className="w-4 h-4 text-zinc-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

export type { AdminProfile, StackUser };
