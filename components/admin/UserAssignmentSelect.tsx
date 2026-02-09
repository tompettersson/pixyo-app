"use client";

import { useState, useEffect } from "react";

interface StackUser {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
}

interface UserAssignmentSelectProps {
  value: string;
  onChange: (userId: string) => void;
  disabled?: boolean;
}

export function UserAssignmentSelect({
  value,
  onChange,
  disabled,
}: UserAssignmentSelectProps) {
  const [users, setUsers] = useState<StackUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to load users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">
          {loading ? "Laden..." : "Benutzer auswählen..."}
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.displayName || user.primaryEmail || user.id}
            {user.primaryEmail && user.displayName
              ? ` (${user.primaryEmail})`
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
