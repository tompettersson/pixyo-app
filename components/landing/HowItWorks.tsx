'use client';

import { AnimatedSection } from './AnimatedSection';

const steps = [
  {
    number: '01',
    title: 'Profil anlegen',
    description: 'Definiere deine Marke: Logo, Farben, Schriften und Tonalität. Pixyo merkt sich alles.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'KI generiert',
    description: 'Beschreibe deine Idee in einem Satz. Die KI erstellt Bilder und Texte, die zu deiner Marke passen.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Exportieren',
    description: 'Passe das Ergebnis im Editor an und lade die fertigen Grafiken in hoher Qualität herunter.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            So einfach geht&apos;s
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg">
            In drei Schritten von der Idee zur fertigen Grafik.
          </p>
        </AnimatedSection>

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Connection line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-zinc-800 via-violet-500/30 to-zinc-800" />

          {steps.map((step, i) => (
            <AnimatedSection key={step.number} delay={i * 0.15} className="relative text-center">
              {/* Step number circle */}
              <div className="relative z-10 w-14 h-14 mx-auto mb-6 rounded-full bg-zinc-900 border border-zinc-700/50 flex items-center justify-center">
                <span className="text-violet-400">{step.icon}</span>
              </div>

              {/* Step number badge */}
              <div className="inline-flex items-center px-2.5 py-0.5 mb-3 text-xs font-mono font-medium text-violet-400 bg-violet-500/10 rounded-full">
                {step.number}
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
