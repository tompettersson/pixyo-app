import { stackServerApp } from "@/lib/stack";
import { hasToolAccess, isAdmin, type ToolId, type UserServerMetadata } from "@/lib/permissions";
import Link from 'next/link';
import { LandingPage } from "@/components/landing/LandingPage";

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
        <span className={`absolute top-4 right-4 px-2 py-0.5 text-xs font-medium rounded-full ${
          badge === 'In Entwicklung'
            ? 'bg-amber-500/20 text-amber-300'
            : 'bg-violet-500/20 text-violet-300'
        }`}>
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
      {
        id: "banner-konfigurator",
        href: "/tools/banner-konfigurator",
        title: "Banner-Konfigurator",
        description: "16 Banner-Formate in 4 Kategorien. Ein Design-Pattern wählen, Brand-Farben setzen, alle Formate gleichzeitig als ZIP exportieren.",
        badge: "In Entwicklung",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        ),
      },
      {
        id: "brand-design",
        href: "/tools/brand-design",
        title: "Brand Design",
        description: "Vollständiges Design-System aus deinen Brand-Farben und Logo. Typografie, Spacing, Buttons, Schatten — alles live editierbar mit Preview.",
        badge: "In Entwicklung",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
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
              <>
                <Link
                  href="/admin/customers"
                  className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Kunden
                </Link>
                <Link
                  href="/usage"
                  className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Verbrauch
                </Link>
              </>
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

            <div className={`grid gap-4 ${visibleTools.length > 2 ? 'md:grid-cols-3' : visibleTools.length > 1 ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
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
  return <LandingPage />;
}
