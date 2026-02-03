"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Input } from "@/components/ui";

interface Profile {
  id: string;
  name: string;
  logo: string;
  logoVariants?: {
    dark: string;
    light: string;
  } | null;
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

  // Logo upload states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

  // Logo upload handler
  const handleLogoUpload = useCallback(async (file: File) => {
    if (!selectedProfile) return;

    // Validate file type
    if (!file.type.includes("svg")) {
      setLogoUploadError("Nur SVG-Dateien werden unterstützt");
      return;
    }

    // Validate file size (500KB max)
    if (file.size > 500 * 1024) {
      setLogoUploadError("Datei ist zu groß (max. 500KB)");
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadError(null);

    try {
      // Read file as text
      const svgContent = await file.text();

      // Upload to API
      const response = await fetch(`/api/profiles/${selectedProfile.id}/logo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          svgData: svgContent,
          filename: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload fehlgeschlagen");
      }

      const data = await response.json();

      // Update local state with new logo URLs
      setSelectedProfile({
        ...selectedProfile,
        logo: data.logo,
        logoVariants: data.logoVariants,
      });

      // Show success feedback
      setLogoUploadSuccess(true);
      setTimeout(() => setLogoUploadSuccess(false), 3000);

      // Reload profiles to sync
      await loadProfiles();
    } catch (error) {
      console.error("Logo upload failed:", error);
      setLogoUploadError(
        error instanceof Error ? error.message : "Upload fehlgeschlagen"
      );
    } finally {
      setIsUploadingLogo(false);
    }
  }, [selectedProfile]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
    // Reset input
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  // Handle logo deletion
  const handleDeleteLogo = async () => {
    if (!selectedProfile) return;

    setIsUploadingLogo(true);
    setLogoUploadError(null);

    try {
      const response = await fetch(`/api/profiles/${selectedProfile.id}/logo`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Löschen fehlgeschlagen");
      }

      // Update local state
      setSelectedProfile({
        ...selectedProfile,
        logo: "",
        logoVariants: null,
      });

      // Reload profiles
      await loadProfiles();
    } catch (error) {
      console.error("Logo deletion failed:", error);
      setLogoUploadError(
        error instanceof Error ? error.message : "Löschen fehlgeschlagen"
      );
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (!isOpen || !selectedProfile) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-settings-title"
    >
      <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <h2 id="profile-settings-title" className="text-lg font-semibold text-zinc-100">Profil-Einstellungen</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Schließen"
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

              {/* Logo Upload Section */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                  Logo (SVG)
                </label>

                {/* Hidden file input */}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Drag & Drop Zone */}
                <div
                  onClick={() => logoInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-lg p-4 cursor-pointer
                    transition-colors duration-200
                    ${isDraggingLogo
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-zinc-700 hover:border-zinc-500 bg-zinc-800/30"
                    }
                    ${isUploadingLogo ? "opacity-50 pointer-events-none" : ""}
                  `}
                >
                  {isUploadingLogo ? (
                    <div className="flex items-center justify-center py-4">
                      <svg className="animate-spin h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="ml-2 text-sm text-zinc-400">Wird hochgeladen...</span>
                    </div>
                  ) : selectedProfile.logo ? (
                    // Logo Preview
                    <div className="space-y-4">
                      {/* Logo Variants Preview */}
                      <div className="flex items-center justify-center gap-4">
                        {/* Original on dark background */}
                        <div className="text-center">
                          <div className="w-20 h-20 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center p-2">
                            <img
                              src={selectedProfile.logo}
                              alt="Logo Original"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <span className="text-xs text-zinc-500 mt-1 block">Original</span>
                        </div>

                        {/* Dark variant (white logo) on dark background */}
                        {selectedProfile.logoVariants?.dark && (
                          <div className="text-center">
                            <div className="w-20 h-20 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center p-2">
                              <img
                                src={selectedProfile.logoVariants.dark}
                                alt="Logo weiß für dunkle Hintergründe"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <span className="text-xs text-zinc-500 mt-1 block">Weiß</span>
                          </div>
                        )}

                        {/* Light variant (black logo) on light background */}
                        {selectedProfile.logoVariants?.light && (
                          <div className="text-center">
                            <div className="w-20 h-20 rounded bg-white border border-zinc-300 flex items-center justify-center p-2">
                              <img
                                src={selectedProfile.logoVariants.light}
                                alt="Logo schwarz für helle Hintergründe"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <span className="text-xs text-zinc-500 mt-1 block">Schwarz</span>
                          </div>
                        )}
                      </div>

                      {/* Replace/Delete Actions */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            logoInputRef.current?.click();
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Ersetzen
                        </button>
                        <span className="text-zinc-600">|</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLogo();
                          }}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Empty Upload State
                    <div className="text-center py-4">
                      <svg className="mx-auto h-10 w-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-zinc-400">
                        SVG-Logo hierher ziehen oder klicken
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        Nur SVG, max. 500KB
                      </p>
                    </div>
                  )}
                </div>

                {/* Success Message */}
                {logoUploadSuccess && (
                  <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Logo erfolgreich hochgeladen
                  </p>
                )}

                {/* Error Message */}
                {logoUploadError && (
                  <p className="mt-2 text-sm text-red-400">{logoUploadError}</p>
                )}
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
              {/* Logo Preview in Read Mode */}
              <div>
                <span className="text-zinc-500">Logo:</span>
                {selectedProfile.logo ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-12 h-12 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1.5">
                      <img
                        src={selectedProfile.logo}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    {selectedProfile.logoVariants && (
                      <>
                        <div className="w-12 h-12 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1.5" title="Weiß (für dunkle Hintergründe)">
                          <img
                            src={selectedProfile.logoVariants.dark}
                            alt="Logo weiß"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="w-12 h-12 rounded bg-white border border-zinc-300 flex items-center justify-center p-1.5" title="Schwarz (für helle Hintergründe)">
                          <img
                            src={selectedProfile.logoVariants.light}
                            alt="Logo schwarz"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-zinc-400 ml-2">Kein Logo</span>
                )}
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
