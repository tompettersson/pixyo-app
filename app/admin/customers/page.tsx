"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { CustomerList, type AdminProfile, type StackUser } from "@/components/admin/CustomerList";
import { CustomerForm, type ProfileFormData } from "@/components/admin/CustomerForm";
import { CustomerDeleteDialog } from "@/components/admin/CustomerDeleteDialog";

type ViewMode = "list" | "create" | "edit";

export default function AdminCustomersPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [users, setUsers] = useState<StackUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [deleteProfile, setDeleteProfile] = useState<AdminProfile | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, usersRes] = await Promise.all([
        fetch("/api/admin/profiles"),
        fetch("/api/admin/users"),
      ]);

      if (profilesRes.ok) {
        const data = await profilesRes.json();
        setProfiles(data.profiles || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectProfile = (profile: AdminProfile) => {
    setSelectedProfile(profile);
    setViewMode("edit");
  };

  const handleCreateProfile = async (data: ProfileFormData) => {
    // For creation we need a placeholder logo URL since the schema requires it
    const logoUrl = data.logo && data.logo.startsWith("data:")
      ? "https://placehold.co/1x1.svg" // temporary, will be replaced by logo upload
      : data.logo || "https://placehold.co/1x1.svg";

    const response = await fetch("/api/admin/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        userId: data.userId,
        logo: logoUrl,
        colors: data.colors,
        fonts: data.fonts,
        layout: data.layout,
        systemPrompt: data.systemPrompt || " ",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erstellen fehlgeschlagen");
    }

    const result = await response.json();

    // If a local SVG was selected (data: URL), upload it now
    if (data.logo && data.logo.startsWith("data:")) {
      try {
        await fetch(`/api/admin/profiles/${result.profile.id}/logo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ svgData: data.logo }),
        });
      } catch (err) {
        console.error("Logo upload after creation failed:", err);
      }
    }

    await loadData();
    setViewMode("list");
    setSelectedProfile(null);
  };

  const handleUpdateProfile = async (data: ProfileFormData) => {
    if (!selectedProfile) return;

    const response = await fetch(
      `/api/admin/profiles/${selectedProfile.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          userId: data.userId,
          colors: data.colors,
          fonts: data.fonts,
          layout: data.layout,
          systemPrompt: data.systemPrompt,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Speichern fehlgeschlagen");
    }

    await loadData();
    setViewMode("list");
    setSelectedProfile(null);
  };

  const handleDeleteProfile = async () => {
    if (!deleteProfile) return;

    const response = await fetch(
      `/api/admin/profiles/${deleteProfile.id}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("Löschen fehlgeschlagen");
    }

    await loadData();
    setDeleteProfile(null);
    if (selectedProfile?.id === deleteProfile.id) {
      setSelectedProfile(null);
      setViewMode("list");
    }
  };

  const profileToFormData = (profile: AdminProfile): ProfileFormData & { id: string } => ({
    id: profile.id,
    name: profile.name,
    userId: profile.userId,
    logo: profile.logo,
    logoVariants: profile.logoVariants,
    colors: profile.colors,
    fonts: profile.fonts,
    layout: profile.layout,
    systemPrompt: profile.systemPrompt,
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-lg font-semibold">Kundenverwaltung</h1>
        </div>
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Zurück zum Dashboard
        </Link>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left: Customer List */}
          <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300">
                Kunden ({profiles.length})
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedProfile(null);
                  setViewMode("create");
                }}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Neuer Kunde
              </Button>
            </div>

            <CustomerList
              profiles={profiles}
              users={users}
              selectedProfileId={selectedProfile?.id || null}
              onSelect={handleSelectProfile}
              loading={loading}
            />
          </div>

          {/* Right: Detail/Edit Panel */}
          <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-6">
            {viewMode === "create" && (
              <CustomerForm
                mode="create"
                onSave={handleCreateProfile}
                onCancel={() => setViewMode("list")}
              />
            )}

            {viewMode === "edit" && selectedProfile && (
              <>
                <CustomerForm
                  mode="edit"
                  initialData={profileToFormData(selectedProfile)}
                  profileId={selectedProfile.id}
                  onSave={handleUpdateProfile}
                  onCancel={() => {
                    setViewMode("list");
                    setSelectedProfile(null);
                  }}
                />
                <div className="mt-6 pt-6 border-t border-zinc-800/50">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteProfile(selectedProfile)}
                  >
                    Kunde löschen
                  </Button>
                </div>
              </>
            )}

            {viewMode === "list" && !selectedProfile && (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <svg
                  className="w-16 h-16 mb-4 text-zinc-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-sm mb-1">Kunde auswählen oder neu anlegen</p>
                <p className="text-xs text-zinc-600">
                  Wähle links einen Kunden aus oder erstelle einen neuen
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteProfile && (
        <CustomerDeleteDialog
          profileName={deleteProfile.name}
          onConfirm={handleDeleteProfile}
          onCancel={() => setDeleteProfile(null)}
        />
      )}
    </div>
  );
}
