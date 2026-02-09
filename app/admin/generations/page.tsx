"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@stackframe/stack";
import Link from "next/link";

// ---------- Types ----------

interface ToolStats {
  generations: number;
  downloads: number;
  rate: number;
}

interface LogEntry {
  id: string;
  userId: string;
  tool: string;
  prompt: string;
  promptSource: string;
  downloaded: boolean;
  downloadedAt: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

interface GenerationsData {
  period: { from: string; to: string };
  summary: {
    totalGenerations: number;
    totalDownloads: number;
    downloadRate: number;
    byTool: Record<string, ToolStats>;
    byPromptSource: Record<string, ToolStats>;
  };
  logs: LogEntry[];
}

// ---------- Helpers ----------

const TOOL_LABELS: Record<string, { label: string; short: string; color: string }> = {
  "social-graphics": { label: "Social Graphics", short: "SG", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  "product-scenes": { label: "Product Scenes", short: "PS", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
};

const SOURCE_LABELS: Record<string, { label: string; short: string; color: string }> = {
  "ai-improved": { label: "AI-verbessert", short: "AI", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  "user-direct": { label: "User-direkt", short: "Direkt", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
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

function rateColor(rate: number): string {
  if (rate >= 60) return "text-emerald-400";
  if (rate >= 30) return "text-yellow-400";
  return "text-red-400";
}

// ---------- Components ----------

function KpiCard({ label, value, sub, colorClass }: { label: string; value: string | number; sub?: string; colorClass?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-6">
      <div className="text-sm text-zinc-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colorClass ?? "text-white"}`}>{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  );
}

function ToolComparisonCard({ toolKey, stats }: { toolKey: string; stats: ToolStats }) {
  const info = TOOL_LABELS[toolKey] ?? { label: toolKey, short: toolKey, color: "bg-zinc-700 text-zinc-300" };
  const maxBar = Math.max(stats.generations, 1);
  return (
    <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${info.color}`}>{info.short}</span>
        <span className="text-sm font-medium text-zinc-200">{info.label}</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Generierungen</span>
            <span>{stats.generations}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${(stats.generations / maxBar) * 100}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Downloads</span>
            <span>{stats.downloads}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(stats.downloads / maxBar) * 100}%` }} />
          </div>
        </div>
        <div className="flex justify-between text-sm pt-1 border-t border-zinc-800/50">
          <span className="text-zinc-400">Download-Rate</span>
          <span className={`font-semibold ${rateColor(stats.rate)}`}>{stats.rate}%</span>
        </div>
      </div>
    </div>
  );
}

function SourceComparisonCard({ sourceKey, stats }: { sourceKey: string; stats: ToolStats }) {
  const info = SOURCE_LABELS[sourceKey] ?? { label: sourceKey, short: sourceKey, color: "bg-zinc-700 text-zinc-300" };
  const maxBar = Math.max(stats.generations, 1);
  return (
    <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${info.color}`}>{info.short}</span>
        <span className="text-sm font-medium text-zinc-200">{info.label}</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Generierungen</span>
            <span>{stats.generations}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${(stats.generations / maxBar) * 100}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Downloads</span>
            <span>{stats.downloads}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.downloads / maxBar) * 100}%` }} />
          </div>
        </div>
        <div className="flex justify-between text-sm pt-1 border-t border-zinc-800/50">
          <span className="text-zinc-400">Download-Rate</span>
          <span className={`font-semibold ${rateColor(stats.rate)}`}>{stats.rate}%</span>
        </div>
      </div>
    </div>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const toolInfo = TOOL_LABELS[log.tool] ?? { label: log.tool, short: log.tool, color: "bg-zinc-700 text-zinc-300" };
  const sourceInfo = SOURCE_LABELS[log.promptSource] ?? { label: log.promptSource, short: log.promptSource, color: "bg-zinc-700 text-zinc-300" };
  const truncatedPrompt = log.prompt.length > 80 ? log.prompt.slice(0, 80) + "..." : log.prompt;

  return (
    <>
      <tr className="border-t border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
        <td className="px-4 py-2.5 text-sm text-zinc-400 whitespace-nowrap">
          {formatDate(log.createdAt)}
        </td>
        <td className="px-4 py-2.5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${toolInfo.color}`}>
            {toolInfo.short}
          </span>
        </td>
        <td
          className="px-4 py-2.5 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors max-w-md"
          onClick={() => setExpanded(!expanded)}
          title="Klicken zum Expandieren"
        >
          {expanded ? log.prompt : truncatedPrompt}
        </td>
        <td className="px-4 py-2.5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${sourceInfo.color}`}>
            {sourceInfo.short}
          </span>
        </td>
        <td className="px-4 py-2.5 text-center">
          {log.downloaded ? (
            <span className="text-emerald-400" title={log.downloadedAt ? `Heruntergeladen: ${formatDate(log.downloadedAt)}` : "Heruntergeladen"}>
              &#10003;
            </span>
          ) : (
            <span className="text-zinc-600">&times;</span>
          )}
        </td>
      </tr>
    </>
  );
}

// ---------- Page ----------

export default function GenerationsPage() {
  const user = useUser();
  const [data, setData] = useState<GenerationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

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
        const res = await fetch(`/api/admin/generations?${params}`);
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

  const summary = data?.summary;
  const aiImprovedPct =
    summary && summary.totalGenerations > 0
      ? Math.round(
          ((summary.byPromptSource["ai-improved"]?.generations ?? 0) /
            summary.totalGenerations) *
            1000
        ) / 10
      : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-lg font-semibold">Generierungen</h1>
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

      <main className="max-w-6xl mx-auto px-6 py-8">
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
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KpiCard
                label="Generierungen"
                value={summary!.totalGenerations}
              />
              <KpiCard
                label="Downloads"
                value={summary!.totalDownloads}
              />
              <KpiCard
                label="Download-Rate"
                value={`${summary!.downloadRate}%`}
                colorClass={rateColor(summary!.downloadRate)}
              />
              <KpiCard
                label="AI-Improved"
                value={`${aiImprovedPct}%`}
                sub={`${summary!.byPromptSource["ai-improved"]?.generations ?? 0} von ${summary!.totalGenerations}`}
                colorClass="text-blue-400"
              />
            </div>

            {/* Tool Comparison */}
            {Object.keys(summary!.byTool).length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-zinc-300 mb-4">
                  Nach Tool
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(summary!.byTool).map(([key, stats]) => (
                    <ToolComparisonCard key={key} toolKey={key} stats={stats} />
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Source Comparison */}
            {Object.keys(summary!.byPromptSource).length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-zinc-300 mb-4">
                  Nach Prompt-Quelle
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(summary!.byPromptSource).map(([key, stats]) => (
                    <SourceComparisonCard key={key} sourceKey={key} stats={stats} />
                  ))}
                </div>
              </div>
            )}

            {/* Log Table */}
            {data.logs.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-zinc-300 mb-4">
                  Letzte Generierungen
                </h3>
                <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-zinc-500 uppercase">
                          <th className="text-left px-4 py-3">Zeitpunkt</th>
                          <th className="text-left px-4 py-3">Tool</th>
                          <th className="text-left px-4 py-3">Prompt</th>
                          <th className="text-left px-4 py-3">Quelle</th>
                          <th className="text-center px-4 py-3">DL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.logs.map((log) => (
                          <LogRow key={log.id} log={log} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-12">
                Keine Generierungen in diesem Zeitraum
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
