'use client';

export function Footer() {
  return (
    <footer className="px-6 py-8 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/pixyo.svg" alt="Pixyo" className="h-6" />
          <span className="text-sm text-zinc-500">&copy; 2025 Pixyo. Alle Rechte vorbehalten.</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Impressum
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Datenschutz
          </a>
        </div>
      </div>
    </footer>
  );
}
