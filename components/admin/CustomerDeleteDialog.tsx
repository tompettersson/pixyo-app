"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

interface CustomerDeleteDialogProps {
  profileName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function CustomerDeleteDialog({
  profileName,
  onConfirm,
  onCancel,
}: CustomerDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              Kunde löschen
            </h3>
            <p className="text-sm text-zinc-400">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 mb-6">
          Möchtest du das Profil{" "}
          <span className="font-semibold text-white">{profileName}</span>{" "}
          wirklich löschen? Alle zugehörigen Assets und Designs werden ebenfalls
          gelöscht.
        </p>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
            Abbrechen
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Endgültig löschen
          </Button>
        </div>
      </div>
    </div>
  );
}
