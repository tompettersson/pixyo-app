'use client';

import { AnimatedSection } from './AnimatedSection';
import { DiagonalLinesPattern } from './PatternElements';

const services = [
  {
    number: '01',
    title: 'Marketing-Tools',
    description: 'Individuelle Anwendungen, die Kampagnen schneller und präziser machen.',
  },
  {
    number: '02',
    title: 'SEO & Analytics',
    description: 'Datengetriebene Werkzeuge für Sichtbarkeit und fundierte Entscheidungen.',
  },
  {
    number: '03',
    title: 'Brand & Design',
    description: 'Designsysteme und visuelle Identitäten — systematisch, nicht dekorativ.',
  },
  {
    number: '04',
    title: 'KI-Integration',
    description: 'Künstliche Intelligenz dort einsetzen, wo sie Arbeit ersetzt, nicht simuliert.',
  },
  {
    number: '05',
    title: 'Custom Dashboards',
    description: 'Steuerungszentralen, die genau das zeigen, was zählt. Kein Rauschen.',
  },
  {
    number: '06',
    title: 'Workflow-Automation',
    description: 'Wiederkehrende Prozesse eliminieren. Manuelle Arbeit ist ein Designfehler.',
  },
  {
    number: '07',
    title: 'Content-Produktion',
    description: 'Werkzeuge für Inhalte in Serie — konsistent, markenkonform, skalierbar.',
  },
  {
    number: '08',
    title: 'E-Commerce Tools',
    description: 'Produktdarstellung, Konfiguratoren, Automatisierung — gebaut für Umsatz.',
  },
];

export function ServicesGrid() {
  return (
    <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
      <DiagonalLinesPattern className="absolute inset-0" />
      <div className="relative max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-16 sm:mb-20">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/50">
              Leistungen
            </span>
            <div className="flex-1 h-px bg-white/[0.10]" />
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {services.map((service, i) => (
            <AnimatedSection key={service.number} delay={i * 0.06}>
              <div className="group relative p-6 sm:p-8 border-t border-l border-white/[0.08] first:border-l-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(2n+1)]:border-l lg:[&:nth-child(4n+1)]:border-l-0">
                {/* Number */}
                <span className="font-bebas-neue text-3xl text-white/[0.10] block mb-4">
                  {service.number}
                </span>

                {/* Title */}
                <h3 className="font-bebas-neue text-xl sm:text-2xl text-white tracking-wide mb-3 group-hover:text-[#E8710A] transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">
                  {service.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
