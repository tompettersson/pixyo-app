"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";

interface Profile {
  id: string;
  name: string;
  logo: string;
  colors: {
    dark: string;
    light: string;
    accent: string;
  };
  fonts: {
    headline: {
      family: string;
      size: number;
      weight?: string;
      uppercase?: boolean;
    };
    body: {
      family: string;
      size: number;
      weight?: string;
    };
  };
  layout: {
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    gaps: {
      taglineToHeadline: number;
      headlineToBody: number;
      bodyToButton: number;
    };
    button: {
      radius: number;
      paddingX: number;
      paddingY: number;
    };
  };
  systemPrompt: string;
}

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfileId: string | null;
  onProfileChange: (profileId: string) => void;
}

const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Space Grotesk",
  "Bebas Neue",
  "Playfair Display",
  "Lora",
  "Oswald",
];

export function ProfileSettings({
  isOpen,
  onClose,
  currentProfileId,
  onProfileChange,
}: ProfileSettingsProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentProfileId && profiles.length > 0) {
      const profile = profiles.find((p) => p.id === currentProfileId);
      if (profile) setSelectedProfile({ ...profile });
    }
  }, [currentProfileId, profiles]);

  const loadProfiles = async () => {
    try {
      const response = await fetch("/api/profiles");
      if (!response.ok) throw new Error("Failed to load profiles");
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedProfile) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/profiles/${selectedProfile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProfile),
      });

      if (!response.ok) throw new Error("Failed to save profile");
      
      await loadProfiles();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSwitch = (profileId: string) => {
    onProfileChange(profileId);
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) setSelectedProfile({ ...profile });
  };

  if (!isOpen || !selectedProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Profil-Einstellungen</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Selector */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
              Profil auswählen
            </label>
            <select
              value={currentProfileId || ""}
              onChange={(e) => handleProfileSwitch(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 
                         focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          {/* Edit Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant={isEditing ? "ghost" : "secondary"}
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1"
            >
              {isEditing ? "Abbrechen" : "Bearbeiten"}
            </Button>
            {isEditing && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? "Speichert..." : "Speichern"}
              </Button>
            )}
          </div>

          {isEditing && (
            <>
              {/* Basic Info */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                  Profilname
                </label>
                <Input
                  value={selectedProfile.name}
                  onChange={(e) =>
                    setSelectedProfile({ ...selectedProfile, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                  Logo URL
                </label>
                <Input
                  value={selectedProfile.logo}
                  onChange={(e) =>
                    setSelectedProfile({ ...selectedProfile, logo: e.target.value })
                  }
                />
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">Farben</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Dunkel</label>
                    <input
                      type="color"
                      value={selectedProfile.colors.dark}
                      onChange={(e) =>
                        setSelectedProfile({
                          ...selectedProfile,
                          colors: { ...selectedProfile.colors, dark: e.target.value },
                        })
                      }
                      className="w-full h-10 rounded bg-zinc-800 border border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Hell</label>
                    <input
                      type="color"
                      value={selectedProfile.colors.light}
                      onChange={(e) =>
                        setSelectedProfile({
                          ...selectedProfile,
                          colors: { ...selectedProfile.colors, light: e.target.value },
                        })
                      }
                      className="w-full h-10 rounded bg-zinc-800 border border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Akzent</label>
                    <input
                      type="color"
                      value={selectedProfile.colors.accent}
                      onChange={(e) =>
                        setSelectedProfile({
                          ...selectedProfile,
                          colors: { ...selectedProfile.colors, accent: e.target.value },
                        })
                      }
                      className="w-full h-10 rounded bg-zinc-800 border border-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">Schriftarten</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">
                        Überschrift
                      </label>
                      <select
                        value={selectedProfile.fonts.headline.family}
                        onChange={(e) =>
                          setSelectedProfile({
                            ...selectedProfile,
                            fonts: {
                              ...selectedProfile.fonts,
                              headline: {
                                ...selectedProfile.fonts.headline,
                                family: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 text-sm"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">
                        Fließtext
                      </label>
                      <select
                        value={selectedProfile.fonts.body.family}
                        onChange={(e) =>
                          setSelectedProfile({
                            ...selectedProfile,
                            fonts: {
                              ...selectedProfile.fonts,
                              body: {
                                ...selectedProfile.fonts.body,
                                family: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 text-sm"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                  System Prompt (Bildgenerierung)
                </label>
                <textarea
                  value={selectedProfile.systemPrompt}
                  onChange={(e) =>
                    setSelectedProfile({
                      ...selectedProfile,
                      systemPrompt: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 
                             focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm resize-none"
                  placeholder="z.B. Professional, modern, clean social media graphics"
                />
              </div>
            </>
          )}

          {/* Read-only view */}
          {!isEditing && (
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-zinc-500">Logo:</span>{" "}
                <span className="text-zinc-300">{selectedProfile.logo}</span>
              </div>
              <div>
                <span className="text-zinc-500">Farben:</span>
                <div className="flex gap-2 mt-1">
                  <div
                    className="w-8 h-8 rounded border border-zinc-700"
                    style={{ backgroundColor: selectedProfile.colors.dark }}
                    title="Dunkel"
                  />
                  <div
                    className="w-8 h-8 rounded border border-zinc-700"
                    style={{ backgroundColor: selectedProfile.colors.light }}
                    title="Hell"
                  />
                  <div
                    className="w-8 h-8 rounded border border-zinc-700"
                    style={{ backgroundColor: selectedProfile.colors.accent }}
                    title="Akzent"
                  />
                </div>
              </div>
              <div>
                <span className="text-zinc-500">Schrift Überschrift:</span>{" "}
                <span className="text-zinc-300">
                  {selectedProfile.fonts.headline.family}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Schrift Fließtext:</span>{" "}
                <span className="text-zinc-300">
                  {selectedProfile.fonts.body.family}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


