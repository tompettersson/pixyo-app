'use client';

import { useEffect, useState } from 'react';

interface DayUsage {
  date: string;
  costEur: number;
  calls: number;
}

interface UsageData {
  totalCostEur: number;
  totalCalls: number;
  days: DayUsage[];
}

const COST_MULTIPLIER = 2; // Verdopplung für Verwaltungsgebühren etc.

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function formatEur(amount: number): string {
  return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function UserUsage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usage/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-4 border-t border-zinc-800/50">
        <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Dein Verbrauch</h2>
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || data.totalCalls === 0) {
    return (
      <div className="pt-4 border-t border-zinc-800/50">
        <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Dein Verbrauch</h2>
        <p className="text-xs text-zinc-600 text-center py-2">Noch keine Nutzung</p>
      </div>
    );
  }

  const displayTotal = data.totalCostEur * COST_MULTIPLIER;
  // Show max 14 days
  const recentDays = data.days.slice(0, 14);

  return (
    <div className="pt-4 border-t border-zinc-800/50">
      <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Dein Verbrauch</h2>

      {/* Total amount - prominent */}
      <div className="mb-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
        <p className="text-xs text-zinc-500 mb-0.5">Gesamt (90 Tage)</p>
        <p className="text-2xl font-bold text-white tabular-nums">
          {formatEur(displayTotal)} <span className="text-sm font-normal text-zinc-500">&euro;</span>
        </p>
        <p className="text-[10px] text-zinc-600 mt-1">{data.totalCalls} Generierungen</p>
      </div>

      {/* Daily breakdown */}
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {recentDays.map((day) => {
          const dayCost = day.costEur * COST_MULTIPLIER;
          return (
            <div key={day.date} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 tabular-nums w-12">{formatDate(day.date)}</span>
                <span className="text-[10px] text-zinc-600">{day.calls}x</span>
              </div>
              <span className="text-xs text-zinc-300 tabular-nums font-medium">{formatEur(dayCost)} &euro;</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
