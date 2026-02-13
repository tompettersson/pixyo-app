import Link from 'next/link';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800/50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-7 opacity-60 hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/"
            className="text-[11px] font-oswald tracking-[0.15em] uppercase text-zinc-500 hover:text-white transition-colors"
          >
            Zurück
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-sm text-zinc-500 mb-10">Stand: {lastUpdated}</p>

          <div className="prose prose-invert prose-zinc max-w-none
            prose-headings:text-white prose-headings:font-semibold
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-zinc-400 prose-p:leading-relaxed
            prose-li:text-zinc-400
            prose-a:text-[#E8710A] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-zinc-200
          ">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-800/30">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6">
          <Link href="/impressum" className="text-[11px] font-oswald tracking-[0.15em] uppercase text-zinc-500 hover:text-white transition-colors">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-[11px] font-oswald tracking-[0.15em] uppercase text-zinc-500 hover:text-white transition-colors">
            Datenschutz
          </Link>
          <Link href="/agb" className="text-[11px] font-oswald tracking-[0.15em] uppercase text-zinc-500 hover:text-white transition-colors">
            AGB
          </Link>
        </div>
      </footer>
    </div>
  );
}
