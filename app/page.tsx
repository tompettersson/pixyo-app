import { stackServerApp } from "@/lib/stack";
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  // Check if user is already logged in
  const user = await stackServerApp.getUser();

  if (user) {
    // Logged in users go directly to the editor
    redirect('/editor');
  }

  // Show landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/50">
        <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
        <Link
          href="/handler/sign-in"
          className="px-4 py-2 bg-white text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          Anmelden
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Social Media Bilder mit KI erstellen
          </h1>
          <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
            Generiere professionelle Grafiken für Instagram, LinkedIn und mehr.
            KI-gestützte Bildgenerierung trifft auf einen intuitiven Canvas-Editor.
          </p>
          <Link
            href="/handler/sign-in"
            className="px-6 py-3 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            Anmelden
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-zinc-600 border-t border-zinc-800/50">
        &copy; 2025 Pixyo. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
}
