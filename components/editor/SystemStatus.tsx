'use client';

import { useState, useEffect, useCallback } from 'react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  message?: string;
}

interface HealthResponse {
  status: 'operational' | 'degraded' | 'down';
  timestamp: string;
  services: ServiceStatus[];
}

export function SystemStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        status: 'down',
        timestamp: new Date().toISOString(),
        services: [
          { name: 'Claude Opus', status: 'down', message: 'Verbindungsfehler' },
          { name: 'Gemini', status: 'down', message: 'Verbindungsfehler' },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Check every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const getStatusColor = (status: 'operational' | 'degraded' | 'down') => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500';
      case 'degraded':
        return 'bg-amber-500';
      case 'down':
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: 'operational' | 'degraded' | 'down') => {
    switch (status) {
      case 'operational':
        return 'Alle Systeme laufen';
      case 'degraded':
        return 'Eingeschränkt';
      case 'down':
        return 'Störung';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 backdrop-blur border border-zinc-700/50">
        <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
          Prüfe...
        </span>
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className="relative">
      {/* Main Status Pill */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 backdrop-blur
                   border border-zinc-700/50 hover:border-zinc-600 transition-all group"
      >
        {/* Pulsing Status Dot */}
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(health.status)}`} />
          {health.status === 'operational' && (
            <div className={`absolute inset-0 w-2 h-2 rounded-full ${getStatusColor(health.status)} animate-ping opacity-75`} />
          )}
        </div>

        {/* Status Text */}
        <span className="text-[10px] text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
          {getStatusText(health.status)}
        </span>

        {/* Expand Arrow */}
        <svg
          className={`w-3 h-3 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-zinc-800/95 backdrop-blur rounded-lg border border-zinc-700/50 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-zinc-700/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">System Status</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  checkHealth();
                }}
                className="p-1 rounded hover:bg-zinc-700/50 transition-colors"
                title="Aktualisieren"
              >
                <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Services */}
          <div className="p-2 space-y-1">
            {health.services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between px-2 py-1.5 rounded bg-zinc-900/50"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(service.status)}`} />
                  <span className="text-xs text-zinc-300">{service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {service.latency && (
                    <span className="text-[10px] text-zinc-500">{service.latency}ms</span>
                  )}
                  {service.message && service.status !== 'operational' && (
                    <span className="text-[10px] text-zinc-500">{service.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 border-t border-zinc-700/50 bg-zinc-900/30">
            <span className="text-[9px] text-zinc-600">
              Aktualisiert: {new Date(health.timestamp).toLocaleTimeString('de-DE')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
