'use client';

import { AnimatedSection } from './AnimatedSection';

const projects = [
  // --- Pixyo Platform ---
  {
    number: '01',
    title: 'Social Graphics',
    description: 'KI-generierte Visuals für Social Media — vom Briefing zum fertigen Bild in Sekunden.',
    tags: ['KI-Bildgenerierung', 'Multi-Format', 'Brand-konform'],
    label: 'Pixyo Platform',
  },
  {
    number: '02',
    title: 'Product Scenes',
    description: 'Produktfotos, neue Umgebung. KI tauscht den Hintergrund, das Produkt bleibt unberührt.',
    tags: ['Hintergrundtausch', 'Fotorealistisch', 'E-Commerce'],
    label: 'Pixyo Platform',
  },
  {
    number: '03',
    title: 'Banner-Konfigurator',
    description: '16 Formate, ein System. Banner für jede Plattform, sofort exportbereit.',
    tags: ['16 Formate', 'ZIP-Export', 'Design-Patterns'],
    label: 'Pixyo Platform',
  },
  {
    number: '04',
    title: 'Brand Design System',
    description: 'Komplettes Designsystem — Farben, Typografie, Spacing, Schatten. Kein Figma nötig.',
    tags: ['Design-Tokens', 'Live-Preview', 'CSS-Export'],
    label: 'Pixyo Platform',
  },
  // --- Kundenprojekte ---
  {
    number: '05',
    title: 'Premium Marketplace',
    description: 'Kompletter Online-Marktplatz für Premium-Produkte — Custom Theme, Payment-Integration, Fulfillment-Anbindung.',
    tags: ['Shopware 6', 'Marktplatz', 'Premium E-Commerce'],
    label: 'F.A.Z. Selection',
  },
  {
    number: '06',
    title: '36+ Custom Plugins',
    description: 'Über 36 Shopware-Plugins für einen einzigen Kunden. Payment, Logistik, Preislogik, CrefoPay — alles custom.',
    tags: ['Shopware 6', 'Plugin-Suite', 'API-Integration'],
    label: 'JOQORA',
  },
  {
    number: '07',
    title: 'Produkt-Konfigurator',
    description: 'B2B-Konfigurator für individuell bedruckte Snacks — Echtzeit-Vorschau, Preiskalkulation, Bestellprozess.',
    tags: ['Next.js', 'B2B', 'Echtzeit-Vorschau'],
    label: '1001Frucht',
  },
  {
    number: '08',
    title: 'Multi-Site CMS',
    description: 'Multi-Language Content-Plattform für internationalen Industriekonzern. KI-gestützte Übersetzungen, Reverse-Proxy-Architektur.',
    tags: ['Laravel', 'Multi-Language', 'KI-Content'],
    label: 'BKT',
  },
  {
    number: '09',
    title: 'Learning Management System',
    description: 'Komplettes LMS für Behörden-Schulungen — Kursverwaltung, Zertifikate, Shopware-Integration für Buchungen.',
    tags: ['Laravel', 'Filament', 'Government'],
    label: 'GovGuru',
  },
  {
    number: '10',
    title: 'Multi-Shop Dashboard',
    description: 'SaaS-Dashboard für mehrere Shopware-Shops. KI-gestützte Produkttexte, zentrale Verwaltung, automatisierte Workflows.',
    tags: ['SaaS', 'KI-Integration', 'Multi-Tenant'],
    label: 'Shoptic',
  },
  {
    number: '11',
    title: 'Google Ads Optimierung',
    description: 'Automatisierte Google Ads Kampagnen-Steuerung. Performance-Tracking, Budget-Optimierung, Reporting.',
    tags: ['Google Ads', 'Automatisierung', 'Performance'],
    label: 'SumAds',
  },
  {
    number: '12',
    title: 'Preisvergleichs-Engine',
    description: 'Echtzeit-Preisvergleich direkt im Shop. Automatisierte Datenfeeds, Wettbewerbsmonitoring, dynamische Preisanpassung.',
    tags: ['Shop-Integration', 'Datenfeeds', 'Wettbewerb'],
    label: 'Hanako Koi',
  },
  {
    number: '13',
    title: 'Artisan Marketplace',
    description: '17 Plugins, Custom Theme, komplettes Shop-Ökosystem für einen Marktplatz handgemachter Produkte.',
    tags: ['Shopware 6', '17 Plugins', 'Marktplatz'],
    label: 'Portobello',
  },
];

export function PortfolioSection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-6">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/50">
              Portfolio
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="mb-16 sm:mb-20">
            <h2 className="font-bebas-neue text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none mb-4">
              Was wir gebaut haben
            </h2>
            <p className="text-white/50 text-base font-light max-w-2xl">
              KI-Tools, Shopware-Ökosysteme, SaaS-Plattformen, Google Ads Automation — alles in Produktion bei echten Kunden.
            </p>
          </div>
        </AnimatedSection>

        <div className="space-y-0">
          {projects.map((project, i) => (
            <AnimatedSection key={project.number} delay={i * 0.05}>
              <div className="grid md:grid-cols-12 gap-6 md:gap-8 py-8 sm:py-12 border-t border-white/[0.10]">
                {/* Number */}
                <div className="md:col-span-1">
                  <span className="font-bebas-neue text-2xl sm:text-3xl text-[#E8710A]/40">
                    {project.number}
                  </span>
                </div>

                {/* Title + Label */}
                <div className="md:col-span-3">
                  <h3 className="font-bebas-neue text-2xl sm:text-3xl text-white tracking-tight leading-none mb-2">
                    {project.title}
                  </h3>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#E8710A]/50 font-oswald">
                    {project.label}
                  </span>
                </div>

                {/* Description */}
                <div className="md:col-span-5">
                  <p className="text-white/55 text-sm sm:text-base leading-relaxed font-light">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="md:col-span-3 flex flex-wrap md:flex-col gap-2 md:gap-1.5 md:items-end">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-[0.15em] uppercase text-white/35 font-oswald"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
