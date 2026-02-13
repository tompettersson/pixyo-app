'use client';

import { AnimatedSection } from './AnimatedSection';

const steps = [
  {
    number: '01',
    title: 'Profil',
    detail: 'Logo, Farben, Schriften, Tonalität — einmal definiert, immer konsistent.',
  },
  {
    number: '02',
    title: 'Generieren',
    detail: 'Beschreibe deine Idee. Die KI erstellt Visuals, die zu deiner Marke passen.',
  },
  {
    number: '03',
    title: 'Exportieren',
    detail: 'Feinjustierung im Editor. Download in allen Formaten, sofort einsatzbereit.',
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-16 sm:mb-24">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/30">
              Prozess
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        </AnimatedSection>

        {/* Steps — horizontal on desktop */}
        <div className="grid md:grid-cols-3 gap-0">
          {steps.map((step, i) => (
            <AnimatedSection key={step.number} delay={i * 0.12}>
              <div className="relative py-10 md:py-0 md:px-8 first:md:pl-0 last:md:pr-0 border-t md:border-t-0 md:border-l border-white/[0.06] first:border-t-0 first:md:border-l-0">
                {/* Step number */}
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="font-bebas-neue text-6xl sm:text-7xl text-white/[0.08]">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bebas-neue text-2xl sm:text-3xl text-white tracking-wide mb-4">
                  {step.title}
                </h3>

                {/* Detail */}
                <p className="text-sm text-white/35 leading-relaxed font-light max-w-xs">
                  {step.detail}
                </p>

                {/* Red dot accent */}
                {i === 1 && (
                  <div className="absolute top-10 md:top-0 right-0 md:right-auto md:-left-1.5 w-3 h-3 bg-[#E8710A]/40 rounded-full" />
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
