'use client';

import { AnimatedSection } from './AnimatedSection';

function FeatureCard({
  icon,
  title,
  description,
  features,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  delay?: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <div className="group relative h-full p-8 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl
                      hover:border-violet-500/20 hover:bg-zinc-900/80 transition-all duration-300
                      backdrop-blur-sm overflow-hidden">
        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative z-10">
          {/* Icon */}
          <div className="w-14 h-14 mb-6 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            {icon}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

          {/* Description */}
          <p className="text-zinc-400 leading-relaxed mb-6">{description}</p>

          {/* Feature list */}
          <ul className="space-y-2.5">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <svg className="w-4 h-4 mt-0.5 text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Abstract UI preview */}
        <div className="mt-8 rounded-xl bg-zinc-950/50 border border-zinc-800/30 p-4 overflow-hidden">
          <div className="flex gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-800/20" />
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-md bg-zinc-800/30" />
              <div className="h-8 w-20 rounded-md bg-violet-500/20" />
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

export function FeatureShowcase() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Zwei Tools. Ein Ziel.
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg">
            Alles was du brauchst, um visuellen Content in deinem Branding zu erstellen.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            delay={0.1}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Social Graphics"
            description="Erstelle Grafiken für Instagram, LinkedIn und mehr — passend zu deinem Brand-Design."
            features={[
              'KI-generierte Hintergrundbilder',
              'Text-Overlays mit deinen Markenfonts',
              'Vorlagen für alle gängigen Formate',
              'Export in hoher Auflösung',
            ]}
          />

          <FeatureCard
            delay={0.2}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            title="Product Scenes"
            description="Platziere deine Produktfotos in neuen Szenen. Weißer Hintergrund wird zur Traumkulisse."
            features={[
              'KI-generierter Hintergrundtausch',
              'Produktidentität bleibt erhalten',
              'Fotorealistische Szenen',
              'Ideal für Shops und Kataloge',
            ]}
          />
        </div>
      </div>
    </section>
  );
}
