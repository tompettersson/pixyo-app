'use client';

import { AnimatedSection } from './AnimatedSection';
import { DotGridPattern } from './PatternElements';
import Link from 'next/link';

const tiers = [
  {
    name: 'Starter',
    price: '0',
    period: 'Kostenlos',
    description: 'Für den ersten Eindruck. Begrenzte Nutzung, voller Funktionsumfang.',
    features: [
      '3 Projekte',
      '50 KI-Generierungen / Monat',
      '5 Banner-Exporte / Monat',
      '1 Brand-Design-Profil',
      'Alle Tools verfügbar',
      'Community-Support',
    ],
    cta: 'Kostenlos starten',
    href: '/handler/sign-in',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '49',
    period: '/ Monat',
    description: 'Für Teams und Agenturen, die täglich produzieren. Ohne Limits arbeiten.',
    features: [
      'Unbegrenzte Projekte',
      'Unbegrenzte KI-Generierungen',
      'Unbegrenzte Banner-Exporte',
      'Unbegrenzte Brand-Designs',
      'Alle Tools + Priority-Queue',
      'E-Mail-Support (24h)',
      'Team-Zugang (bis 5 User)',
    ],
    cta: 'Jetzt starten',
    href: '/handler/sign-in',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'Individuell',
    description: 'Für Unternehmen mit eigenen Anforderungen. Wir bauen, was du brauchst.',
    features: [
      'Alles aus Professional',
      'Unbegrenzte Team-Mitglieder',
      'Custom-Integrationen & API',
      'Eigene KI-Modelle trainieren',
      'Dedizierter Account-Manager',
      'SLA & Priority-Support',
      'On-Premise möglich',
    ],
    cta: 'Erstgespräch vereinbaren',
    href: '#kontakt',
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      <DotGridPattern className="absolute inset-0 opacity-50" />
      <div className="relative max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-6">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/50">
              Preise
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="mb-16 sm:mb-20">
            <h2 className="font-bebas-neue text-4xl sm:text-5xl md:text-7xl text-white tracking-tight leading-[0.9] mb-4">
              Kein Pricing-Rätsel.
              <br />
              <span className="text-[#E8710A]">Drei klare Optionen.</span>
            </h2>
            <p className="text-white/50 text-base font-light max-w-2xl">
              Starte kostenlos, skaliere wenn&apos;s ernst wird. Keine versteckten Kosten, keine Überraschungen.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-0">
          {tiers.map((tier, i) => (
            <AnimatedSection key={tier.name} delay={i * 0.1}>
              <div
                className={`relative p-8 sm:p-10 border border-white/[0.08] ${
                  tier.highlight
                    ? 'bg-white/[0.03] border-[#E8710A]/30'
                    : ''
                } ${i === 0 ? 'md:border-r-0' : ''} ${i === 2 ? 'md:border-l-0' : ''}`}
              >
                {tier.highlight && (
                  <div className="absolute -top-px left-0 right-0 h-px bg-[#E8710A]" />
                )}

                {/* Tier name */}
                <span className="font-oswald text-xs tracking-[0.25em] uppercase text-white/45 block mb-6">
                  {tier.name}
                </span>

                {/* Price */}
                <div className="mb-6">
                  {tier.price !== null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="font-bebas-neue text-5xl sm:text-6xl text-white">
                        {tier.price}&euro;
                      </span>
                      <span className="text-sm text-white/40 font-light">
                        {tier.period}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bebas-neue text-4xl sm:text-5xl text-white">
                        Auf Anfrage
                      </span>
                      <span className="block text-sm text-white/40 font-light mt-1">
                        {tier.period}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-white/50 font-light leading-relaxed mb-8">
                  {tier.description}
                </p>

                {/* Divider */}
                <div className="w-8 h-px bg-white/[0.10] mb-8" />

                {/* Features */}
                <ul className="space-y-3 mb-10">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-white/60 font-light"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#E8710A]/60 mt-2 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.href}
                  className={`block w-full text-center py-4 text-sm font-oswald tracking-[0.15em] uppercase transition-colors duration-300 ${
                    tier.highlight
                      ? 'bg-[#E8710A] hover:bg-[#d4670a] text-white'
                      : 'border border-white/[0.15] text-white/70 hover:text-white hover:border-white/30'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
