"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@stackframe/stack";
import Link from "next/link";

// Types for the API response
interface OperationSummary {
  operation: string;
  count: number;
  costEur: number;
}

interface UserSummary {
  userId: string;
  userEmail: string;
  totalCostEur: number;
  totalCalls: number;
  operations: OperationSummary[];
}

interface RecentLog {
  id: string;
  userEmail: string;
  operation: string;
  costEur: number;
  model: string;
  createdAt: string;
}

interface UsageData {
  period: { from: string; to: string };
  grandTotalEur: number;
  grandTotalCalls: number;
  users: UserSummary[];
  recentLogs: RecentLog[];
}

// Human-readable operation names
const OPERATION_LABELS: Record<string, string> = {
  "analyze-product": "Produktanalyse",
  "generate-product-scene": "Produktszene",
  "generate-product-scene-vertex": "Produktszene (Vertex)",
  "generate-background": "Hintergrund",
  "harmonize-composite": "Harmonisierung",
  "generate-scene-prompts": "Szenen-Prompts",
  "generate-prompt": "Prompt-Generierung",
  "generate-image": "Bildgenerierung",
  "generate-text": "Textgenerierung",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEur(amount: number): string {
  return amount.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

export default function UsagePage() {
  const user = useUser();
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month navigation
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month

  const getMonthRange = useCallback(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);
    return { from, to };
  }, [monthOffset]);

  const monthLabel = useCallback(() => {
    const { from } = getMonthRange();
    return from.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  }, [getMonthRange]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { from, to } = getMonthRange();
        const params = new URLSearchParams({
          from: from.toISOString(),
          to: to.toISOString(),
        });
        const res = await fetch(`/api/usage?${params}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Fehler beim Laden");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getMonthRange]);

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Nicht angemeldet
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-lg font-semibold">Verbrauch</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{user.primaryEmail}</span>
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Zurück
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setMonthOffset((m) => m - 1)}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
          >
            &larr; Vorheriger Monat
          </button>
          <h2 className="text-xl font-bold capitalize">{monthLabel()}</h2>
          <button
            onClick={() => setMonthOffset((m) => Math.min(m + 1, 0))}
            disabled={monthOffset >= 0}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Nächster Monat &rarr;
          </button>
        </div>

        {loading && (
          <div className="text-center text-zinc-400 py-12">Lade Daten...</div>
        )}

        {error && (
          <div className="text-center text-red-400 py-12">{error}</div>
        )}

        {data && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-6">
                <div className="text-sm text-zinc-400 mb-1">Gesamtkosten</div>
                <div className="text-3xl font-bold text-white">
                  {formatEur(data.grandTotalEur)}
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-6">
                <div className="text-sm text-zinc-400 mb-1">API-Aufrufe</div>
                <div className="text-3xl font-bold text-white">
                  {data.grandTotalCalls}
                </div>
              </div>
            </div>

            {/* Per-User Breakdown */}
            {data.users.length === 0 ? (
              <div className="text-center text-zinc-500 py-12">
                Keine Daten für diesen Zeitraum
              </div>
            ) : (
              <div className="space-y-6 mb-12">
                <h3 className="text-lg font-semibold text-zinc-300">
                  Pro Benutzer
                </h3>
                {data.users.map((u) => (
                  <div
                    key={u.userId}
                    className="bg-zinc-900 border border-zinc-800/50 rounded-xl overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-white">
                          {u.userEmail}
                        </span>
                        <span className="ml-3 text-sm text-zinc-500">
                          {u.totalCalls} Aufrufe
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-white">
                        {formatEur(u.totalCostEur)}
                      </span>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-zinc-500 uppercase">
                          <th className="text-left px-6 py-2">Operation</th>
                          <th className="text-right px-6 py-2">Anzahl</th>
                          <th className="text-right px-6 py-2">Kosten</th>
                        </tr>
                      </thead>
                      <tbody>
                        {u.operations.map((op) => (
                          <tr
                            key={op.operation}
                            className="border-t border-zinc-800/30"
                          >
                            <td className="px-6 py-2 text-sm text-zinc-300">
                              {OPERATION_LABELS[op.operation] || op.operation}
                            </td>
                            <td className="px-6 py-2 text-sm text-zinc-400 text-right">
                              {op.count}
                            </td>
                            <td className="px-6 py-2 text-sm text-zinc-400 text-right">
                              {formatEur(op.costEur)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Logs */}
            {data.recentLogs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-zinc-300 mb-4">
                  Letzte Aufrufe
                </h3>
                <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-zinc-500 uppercase">
                        <th className="text-left px-6 py-3">Zeitpunkt</th>
                        <th className="text-left px-6 py-3">Benutzer</th>
                        <th className="text-left px-6 py-3">Operation</th>
                        <th className="text-left px-6 py-3">Modell</th>
                        <th className="text-right px-6 py-3">Kosten</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-t border-zinc-800/30"
                        >
                          <td className="px-6 py-2 text-sm text-zinc-400">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="px-6 py-2 text-sm text-zinc-300">
                            {log.userEmail}
                          </td>
                          <td className="px-6 py-2 text-sm text-zinc-300">
                            {OPERATION_LABELS[log.operation] || log.operation}
                          </td>
                          <td className="px-6 py-2 text-sm text-zinc-500 font-mono text-xs">
                            {log.model}
                          </td>
                          <td className="px-6 py-2 text-sm text-zinc-400 text-right">
                            {formatEur(log.costEur)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
