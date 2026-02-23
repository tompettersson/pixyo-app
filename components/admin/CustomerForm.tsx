"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { UserAssignmentSelect } from "./UserAssignmentSelect";
import { AVAILABLE_FONTS } from "@/lib/stylePresets";
import type { SceneConfig, SceneCategory, ScenePreset } from "@/types/customer";

const FONT_OPTIONS = AVAILABLE_FONTS.map((f) => f.value);

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
  sceneConfig: null as SceneConfig | null,
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
  sceneConfig?: SceneConfig | null;
}

// =============================================================================
// Scene Config Editor — Tag/Pill-based editor for scene categories & presets
// =============================================================================

function SceneConfigEditor({
  sceneConfig,
  onChange,
}: {
  sceneConfig: SceneConfig | null;
  onChange: (config: SceneConfig | null) => void;
}) {
  const [useDefaults, setUseDefaults] = useState(sceneConfig === null);
  const [editingPreset, setEditingPreset] = useState<{
    categoryIndex: number;
    presetIndex: number;
  } | null>(null);
  const [newPresetLabel, setNewPresetLabel] = useState("");
  const [addingToCategoryIndex, setAddingToCategoryIndex] = useState<number | null>(null);

  const categories = sceneConfig?.categories ?? [];

  const toggleDefaults = () => {
    if (useDefaults) {
      // Switch to custom — start with empty categories
      setUseDefaults(false);
      onChange({ categories: [] });
    } else {
      // Switch to defaults
      setUseDefaults(true);
      onChange(null);
    }
  };

  const addCategory = () => {
    const newCategory: SceneCategory = {
      id: `cat_${Date.now()}`,
      label: "Neue Kategorie",
      presets: [{ id: "none", label: "Keiner", icon: "○", prompt: "" }],
    };
    onChange({ categories: [...categories, newCategory] });
  };

  const updateCategoryLabel = (index: number, label: string) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], label };
    onChange({ categories: updated });
  };

  const removeCategory = (index: number) => {
    const updated = categories.filter((_, i) => i !== index);
    onChange({ categories: updated.length > 0 ? updated : [] });
  };

  const addPreset = (categoryIndex: number, label: string) => {
    if (!label.trim()) return;
    const updated = [...categories];
    const newPreset: ScenePreset = {
      id: `preset_${Date.now()}`,
      label: label.trim(),
      icon: "✦",
      prompt: "",
    };
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      presets: [...updated[categoryIndex].presets, newPreset],
    };
    onChange({ categories: updated });
    setNewPresetLabel("");
  };

  const removePreset = (categoryIndex: number, presetIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      presets: updated[categoryIndex].presets.filter((_, i) => i !== presetIndex),
    };
    onChange({ categories: updated });
    if (
      editingPreset?.categoryIndex === categoryIndex &&
      editingPreset?.presetIndex === presetIndex
    ) {
      setEditingPreset(null);
    }
  };

  const updatePreset = (
    categoryIndex: number,
    presetIndex: number,
    partial: Partial<ScenePreset>
  ) => {
    const updated = [...categories];
    const presets = [...updated[categoryIndex].presets];
    presets[presetIndex] = { ...presets[presetIndex], ...partial };
    updated[categoryIndex] = { ...updated[categoryIndex], presets };
    onChange({ categories: updated });
  };

  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
        Szenen-Presets (Product Scenes)
      </label>

      {/* Default toggle */}
      <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={useDefaults}
          onChange={toggleDefaults}
          className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-violet-500 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
        />
        <span className="text-sm text-zinc-400">
          Standardwerte verwenden (Innenarchitektur + Raum)
        </span>
      </label>

      {!useDefaults && (
        <div className="space-y-4">
          {categories.map((category, catIdx) => (
            <div
              key={category.id}
              className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
            >
              {/* Category header */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={category.label}
                  onChange={(e) => updateCategoryLabel(catIdx, e.target.value)}
                  className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-100
                    focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Kategorie-Name"
                />
                <button
                  type="button"
                  onClick={() => removeCategory(catIdx)}
                  className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                  title="Kategorie entfernen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Preset pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {category.presets.map((preset, presetIdx) => (
                  <div
                    key={preset.id}
                    className={`group flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer
                      ${
                        editingPreset?.categoryIndex === catIdx &&
                        editingPreset?.presetIndex === presetIdx
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/50"
                          : "bg-zinc-700/50 text-zinc-300 border border-zinc-600/50 hover:bg-zinc-600/50"
                      }`}
                    onClick={() =>
                      setEditingPreset(
                        editingPreset?.categoryIndex === catIdx &&
                          editingPreset?.presetIndex === presetIdx
                          ? null
                          : { categoryIndex: catIdx, presetIndex: presetIdx }
                      )
                    }
                  >
                    <span className="text-xs">{preset.icon}</span>
                    <span>{preset.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePreset(catIdx, presetIdx);
                      }}
                      className="ml-0.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add preset input */}
              {addingToCategoryIndex === catIdx ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newPresetLabel}
                    onChange={(e) => setNewPresetLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addPreset(catIdx, newPresetLabel);
                        setAddingToCategoryIndex(null);
                      }
                      if (e.key === "Escape") {
                        setAddingToCategoryIndex(null);
                        setNewPresetLabel("");
                      }
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-600 rounded text-xs text-zinc-100
                      focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-zinc-600"
                    placeholder="Preset-Name, dann Enter"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addPreset(catIdx, newPresetLabel);
                      setAddingToCategoryIndex(null);
                    }}
                    className="px-2 py-1 text-xs bg-violet-600 text-white rounded hover:bg-violet-500"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToCategoryIndex(null);
                      setNewPresetLabel("");
                    }}
                    className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddingToCategoryIndex(catIdx);
                    setNewPresetLabel("");
                  }}
                  className="text-xs text-zinc-500 hover:text-violet-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Preset hinzufügen
                </button>
              )}

              {/* Preset detail editor */}
              {editingPreset?.categoryIndex === catIdx && (
                <div className="mt-3 p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    Preset bearbeiten: {category.presets[editingPreset.presetIndex]?.label}
                  </p>
                  <div className="grid grid-cols-[60px_1fr] gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">Icon</label>
                      <input
                        type="text"
                        value={category.presets[editingPreset.presetIndex]?.icon ?? ""}
                        onChange={(e) =>
                          updatePreset(catIdx, editingPreset.presetIndex, { icon: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-center
                          focus:outline-none focus:ring-1 focus:ring-violet-500"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">Label</label>
                      <input
                        type="text"
                        value={category.presets[editingPreset.presetIndex]?.label ?? ""}
                        onChange={(e) =>
                          updatePreset(catIdx, editingPreset.presetIndex, { label: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100
                          focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-0.5">Prompt-Fragment</label>
                    <textarea
                      value={category.presets[editingPreset.presetIndex]?.prompt ?? ""}
                      onChange={(e) =>
                        updatePreset(catIdx, editingPreset.presetIndex, { prompt: e.target.value })
                      }
                      rows={2}
                      className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 resize-none
                        focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-zinc-600"
                      placeholder="z.B. in a serene Japanese garden with koi pond"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add category button */}
          <button
            type="button"
            onClick={addCategory}
            className="w-full px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-500
              hover:border-violet-500/50 hover:text-violet-400 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Kategorie hinzufügen
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Customer Form
// =============================================================================

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
  const [brokenLogos, setBrokenLogos] = useState<Set<string>>(new Set());
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
          setBrokenLogos(new Set());
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
        setBrokenLogos(new Set());
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
                    {brokenLogos.has("original") ? (
                      <span className="text-xs text-zinc-600">SVG fehlt</span>
                    ) : (
                      <img
                        src={formData.logo}
                        alt="Logo Original"
                        className="max-w-full max-h-full object-contain"
                        onError={() => setBrokenLogos((prev) => new Set(prev).add("original"))}
                      />
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 mt-1 block">
                    Original
                  </span>
                </div>
                {formData.logoVariants?.dark && (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center p-2">
                      {brokenLogos.has("dark") ? (
                        <span className="text-xs text-zinc-600">fehlt</span>
                      ) : (
                        <img
                          src={formData.logoVariants.dark}
                          alt="Logo weiß"
                          className="max-w-full max-h-full object-contain"
                          onError={() => setBrokenLogos((prev) => new Set(prev).add("dark"))}
                        />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 mt-1 block">
                      Weiß
                    </span>
                  </div>
                )}
                {formData.logoVariants?.light && (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded bg-white border border-zinc-300 flex items-center justify-center p-2">
                      {brokenLogos.has("light") ? (
                        <span className="text-xs text-zinc-600">fehlt</span>
                      ) : (
                        <img
                          src={formData.logoVariants.light}
                          alt="Logo schwarz"
                          className="max-w-full max-h-full object-contain"
                          onError={() => setBrokenLogos((prev) => new Set(prev).add("light"))}
                        />
                      )}
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

      {/* Scene Presets Configuration */}
      <SceneConfigEditor
        sceneConfig={formData.sceneConfig ?? null}
        onChange={(config) => update({ sceneConfig: config })}
      />

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
