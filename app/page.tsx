import { stackServerApp } from "@/lib/stack";
import { hasToolAccess, isAdmin, type ToolId, type UserServerMetadata } from "@/lib/permissions";
import Link from 'next/link';

// Tool card component for the dashboard
function ToolCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col p-6 bg-zinc-900 border border-zinc-800/50 rounded-2xl
                 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200
                 hover:shadow-lg hover:shadow-black/20"
    >
      {badge && (
        <span className="absolute top-4 right-4 px-2 py-0.5 text-xs font-medium bg-violet-500/20 text-violet-300 rounded-full">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 mb-4 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </Link>
  );
}

export default async function Home() {
  // Check if user is logged in
  const user = await stackServerApp.getUser();

  // Logged-in users see the tool selection dashboard
  if (user) {
    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    const userIsAdmin = isAdmin(serverMetadata);

    // Define all tools with their permissions
    const allTools: Array<{
      id: ToolId;
      href: string;
      title: string;
      description: string;
      badge?: string;
      icon: React.ReactNode;
    }> = [
      {
        id: "social-graphics",
        href: "/tools/social-graphics",
        title: "Social Graphics",
        description: "Erstelle professionelle Grafiken für Instagram, LinkedIn und mehr mit KI-generierten Bildern und Text-Overlays.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        id: "product-scenes",
        href: "/tools/product-scenes",
        title: "Product Scenes",
        description: "Platziere deine Produktfotos in neuen Szenen. Der weiße Hintergrund wird durch eine KI-generierte Umgebung ersetzt.",
        badge: "Neu",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
    ];

    // Filter tools based on user permissions
    const visibleTools = allTools.filter((tool) =>
      hasToolAccess(serverMetadata, tool.id)
    );

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/50">
          <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
          <div className="flex items-center gap-4">
            {userIsAdmin && (
              <Link
                href="/usage"
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Verbrauch
              </Link>
            )}
            <span className="text-sm text-zinc-400">{user.primaryEmail}</span>
            <Link
              href="/handler/sign-out"
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Abmelden
            </Link>
          </div>
        </header>

        {/* Tool Selection */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-3">Willkommen bei Pixyo</h1>
              <p className="text-zinc-400">Wähle ein Tool, um zu starten</p>
            </div>

            <div className={`grid gap-4 ${visibleTools.length > 1 ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
              {visibleTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  href={tool.href}
                  title={tool.title}
                  description={tool.description}
                  badge={tool.badge}
                  icon={tool.icon}
                />
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center text-sm text-zinc-600 border-t border-zinc-800/50">
          &copy; 2025 Pixyo. Alle Rechte vorbehalten.
        </footer>
      </div>
    );
  }

  // Non-logged-in users see the landing page
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
