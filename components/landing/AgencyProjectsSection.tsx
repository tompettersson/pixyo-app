'use client';

import { AnimatedSection } from './AnimatedSection';

const agencyProjects = [
  {
    number: '01',
    title: 'Preisvergleichs-Integration',
    description: 'Echtzeit-Preisvergleich direkt im Shop. Automatisierte Datenfeeds, Wettbewerbsmonitoring, dynamische Preisanpassung.',
    tags: ['Shop-Integration', 'Datenfeeds', 'Automatisierung'],
  },
  {
    number: '02',
    title: 'SEO-Toolkit',
    description: 'SEO-Maßnahmen direkt mit dem Shop verbunden. Technisches SEO, Content-Optimierung, Ranking-Monitoring — alles automatisiert.',
    tags: ['Technisches SEO', 'SISTRIX', 'Shop-Anbindung'],
  },
  {
    number: '03',
    title: 'Shop-Templates',
    description: 'Maßgeschneiderte Shopware-Templates. Pixel-perfekt, performance-optimiert, markenkonform.',
    tags: ['Shopware 6', 'Custom Design', 'Performance'],
  },
  {
    number: '04',
    title: 'Shopware Plugin-Entwicklung',
    description: 'Über ein Dutzend Plugins für Shopware 6 — von Payment-Integration bis Custom-Logik. Alles, was der Standard nicht kann.',
    tags: ['Shopware 6', 'Custom Plugins', 'API-Integration'],
  },
  {
    number: '05',
    title: 'Plugin-Ökosystem',
    description: 'Ganze Plugin-Landschaften für komplexe Shop-Anforderungen. Modularer Aufbau, wartbar, skalierbar.',
    tags: ['Modulare Architektur', 'Skalierbar', 'Wartbar'],
  },
];

export function AgencyProjectsSection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-6">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/50">
              Referenzen
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
              Shop-Integrationen, Plugins, Templates — alles in Produktion bei echten Kunden.
            </p>
          </div>
        </AnimatedSection>

        <div className="space-y-0">
          {agencyProjects.map((project, i) => (
            <AnimatedSection key={project.number} delay={i * 0.08}>
              <div className="grid md:grid-cols-12 gap-6 md:gap-8 py-10 sm:py-14 border-t border-white/[0.10]">
                <div className="md:col-span-1">
                  <span className="font-bebas-neue text-3xl sm:text-4xl text-white/25">
                    {project.number}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <h3 className="font-bebas-neue text-3xl sm:text-4xl text-white tracking-tight leading-none">
                    {project.title}
                  </h3>
                </div>
                <div className="md:col-span-5">
                  <p className="text-white/55 text-sm sm:text-base leading-relaxed font-light">
                    {project.description}
                  </p>
                </div>
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
