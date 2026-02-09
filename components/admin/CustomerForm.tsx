"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { UserAssignmentSelect } from "./UserAssignmentSelect";

const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Space Grotesk",
  "Bebas Neue",
  "Playfair Display",
  "Lora",
  "Oswald",
];

const DEFAULT_PROFILE = {
  name: "",
  userId: "",
  logo: "",
  logoVariants: null as { dark: string; light: string } | null,
  colors: { dark: "#1a1a1a", light: "#ffffff", accent: "#7c3aed" },
  fonts: {
    headline: { family: "Inter", size: 32, weight: "700", uppercase: false },
    body: { family: "Inter", size: 16, weight: "400" },
  },
  layout: {
    padding: { top: 40, right: 40, bottom: 40, left: 40 },
    gaps: { taglineToHeadline: 8, headlineToBody: 16, bodyToButton: 24 },
    button: { radius: 8, paddingX: 24, paddingY: 12 },
  },
  systemPrompt: "",
};

export interface ProfileFormData {
  name: string;
  userId: string;
  logo: string;
  logoVariants?: { dark: string; light: string } | null;
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
}

interface CustomerFormProps {
  mode: "create" | "edit";
  initialData?: ProfileFormData & { id?: string };
  onSave: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  /** Profile ID needed for logo upload in edit mode */
  profileId?: string;
}

export function CustomerForm({
  mode,
  initialData,
  onSave,
  onCancel,
  profileId,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(
    initialData || DEFAULT_PROFILE
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logo upload states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Name ist erforderlich");
      return;
    }
    if (!formData.userId) {
      setError("Bitte einen Benutzer zuweisen");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setIsSaving(false);
    }
  };

  // Logo upload handler
  const handleLogoUpload = useCallback(
    async (file: File) => {
      if (!profileId && mode === "edit") return;

      if (!file.type.includes("svg")) {
        setLogoUploadError("Nur SVG-Dateien werden unterstützt");
        return;
      }
      if (file.size > 500 * 1024) {
        setLogoUploadError("Datei ist zu groß (max. 500KB)");
        return;
      }

      setIsUploadingLogo(true);
      setLogoUploadError(null);

      try {
        const svgContent = await file.text();

        if (mode === "create" && !profileId) {
          // In create mode without profileId, store SVG content for later upload
          // For now, show a preview using a data URL
          const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
          update({ logo: dataUrl });
          setLogoUploadSuccess(true);
          setTimeout(() => setLogoUploadSuccess(false), 3000);
          return;
        }

        // Upload to admin API
        const response = await fetch(
          `/api/admin/profiles/${profileId}/logo`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ svgData: svgContent, filename: file.name }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload fehlgeschlagen");
        }

        const data = await response.json();
        update({ logo: data.logo, logoVariants: data.logoVariants });
        setLogoUploadSuccess(true);
        setTimeout(() => setLogoUploadSuccess(false), 3000);
      } catch (err) {
        console.error("Logo upload failed:", err);
        setLogoUploadError(
          err instanceof Error ? err.message : "Upload fehlgeschlagen"
        );
      } finally {
        setIsUploadingLogo(false);
      }
    },
    [profileId, mode]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoUpload(file);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

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
    if (file) handleLogoUpload(file);
  };

  const handleDeleteLogo = async () => {
    if (!profileId) {
      update({ logo: "", logoVariants: null });
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadError(null);
    try {
      const response = await fetch(
        `/api/admin/profiles/${profileId}/logo`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Löschen fehlgeschlagen");
      update({ logo: "", logoVariants: null });
    } catch (err) {
      console.error("Logo deletion failed:", err);
      setLogoUploadError(
        err instanceof Error ? err.message : "Löschen fehlgeschlagen"
      );
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">
          {mode === "create" ? "Neuer Kunde" : `${formData.name} bearbeiten`}
        </h2>
        <button
          onClick={onCancel}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
          Kundenname *
        </label>
        <Input
          value={formData.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="z.B. Canton, 1001Frucht"
        />
      </div>

      {/* User Assignment */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
          Benutzer zuweisen *
        </label>
        <UserAssignmentSelect
          value={formData.userId}
          onChange={(userId) => update({ userId })}
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
          Logo (SVG)
        </label>

        <input
          ref={logoInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div
          onClick={() => logoInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-4 cursor-pointer
            transition-colors duration-200
            ${
              isDraggingLogo
                ? "border-violet-500 bg-violet-500/10"
                : "border-zinc-700 hover:border-zinc-500 bg-zinc-800/30"
            }
            ${isUploadingLogo ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          {isUploadingLogo ? (
            <div className="flex items-center justify-center py-4">
              <svg
                className="animate-spin h-6 w-6 text-zinc-400"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="ml-2 text-sm text-zinc-400">
                Wird hochgeladen...
              </span>
            </div>
          ) : formData.logo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="w-20 h-20 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center p-2">
                    <img
                      src={formData.logo}
                      alt="Logo Original"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-zinc-500 mt-1 block">
                    Original
                  </span>
                </div>
                {formData.logoVariants?.dark && (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center p-2">
                      <img
                        src={formData.logoVariants.dark}
                        alt="Logo weiß"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className="text-xs text-zinc-500 mt-1 block">
                      Weiß
                    </span>
                  </div>
                )}
                {formData.logoVariants?.light && (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded bg-white border border-zinc-300 flex items-center justify-center p-2">
                      <img
                        src={formData.logoVariants.light}
                        alt="Logo schwarz"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className="text-xs text-zinc-500 mt-1 block">
                      Schwarz
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    logoInputRef.current?.click();
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
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
            <div className="text-center py-4">
              <svg
                className="mx-auto h-10 w-10 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-2 text-sm text-zinc-400">
                SVG-Logo hierher ziehen oder klicken
              </p>
              <p className="mt-1 text-xs text-zinc-600">Nur SVG, max. 500KB</p>
            </div>
          )}
        </div>

        {logoUploadSuccess && (
          <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Logo erfolgreich hochgeladen
          </p>
        )}
        {logoUploadError && (
          <p className="mt-2 text-sm text-red-400">{logoUploadError}</p>
        )}

        {mode === "create" && formData.logo && (
          <p className="mt-2 text-xs text-zinc-500">
            Logo wird nach dem Erstellen des Profils verarbeitet.
          </p>
        )}
      </div>

      {/* Colors */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
          Farben
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Dunkel</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.colors.dark}
                onChange={(e) =>
                  update({
                    colors: { ...formData.colors, dark: e.target.value },
                  })
                }
                className="w-10 h-10 rounded bg-zinc-800 border border-zinc-700 cursor-pointer"
              />
              <span className="text-xs text-zinc-400 font-mono">
                {formData.colors.dark}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Hell</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.colors.light}
                onChange={(e) =>
                  update({
                    colors: { ...formData.colors, light: e.target.value },
                  })
                }
                className="w-10 h-10 rounded bg-zinc-800 border border-zinc-700 cursor-pointer"
              />
              <span className="text-xs text-zinc-400 font-mono">
                {formData.colors.light}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Akzent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.colors.accent}
                onChange={(e) =>
                  update({
                    colors: { ...formData.colors, accent: e.target.value },
                  })
                }
                className="w-10 h-10 rounded bg-zinc-800 border border-zinc-700 cursor-pointer"
              />
              <span className="text-xs text-zinc-400 font-mono">
                {formData.colors.accent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
          Schriftarten
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Überschrift
            </label>
            <select
              value={formData.fonts.headline.family}
              onChange={(e) =>
                update({
                  fonts: {
                    ...formData.fonts,
                    headline: {
                      ...formData.fonts.headline,
                      family: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm
                focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
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
              value={formData.fonts.body.family}
              onChange={(e) =>
                update({
                  fonts: {
                    ...formData.fonts,
                    body: {
                      ...formData.fonts.body,
                      family: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm
                focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
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

      {/* System Prompt */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
          System Prompt (Bildgenerierung)
        </label>
        <textarea
          value={formData.systemPrompt}
          onChange={(e) => update({ systemPrompt: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm resize-none"
          placeholder="z.B. Professional, modern, clean social media graphics"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSaving}
          className="flex-1"
        >
          {mode === "create" ? "Kunde anlegen" : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
