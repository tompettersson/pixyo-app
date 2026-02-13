'use client';

export function Footer() {
  return (
    <footer className="px-6 py-8">
      <div className="max-w-7xl mx-auto border-t border-white/[0.04] pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-5 opacity-40" />
            <span className="text-[11px] text-white/30 tracking-wider uppercase font-oswald">
              &copy; 2025
            </span>
          </div>

          <div className="flex items-center gap-8">
            <a
              href="#"
              className="text-[11px] text-white/30 hover:text-white/40 transition-colors tracking-wider uppercase font-oswald"
            >
              Impressum
            </a>
            <a
              href="#"
              className="text-[11px] text-white/30 hover:text-white/40 transition-colors tracking-wider uppercase font-oswald"
            >
              Datenschutz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
