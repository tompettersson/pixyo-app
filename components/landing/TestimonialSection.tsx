'use client';

import { AnimatedSection } from './AnimatedSection';

const testimonials = [
  {
    quote:
      'Product Scenes hat bei uns mehrere Fotoshootings ersetzt. Die Qualität der KI-generierten Produktbilder ist unfassbar hoch — das hätten wir so nicht erwartet.',
    author: 'Canton',
    role: 'Premium Audio',
    tool: 'Product Scenes',
  },
];

export function TestimonialSection() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-12 sm:mb-16">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/50">
              Kundenstimmen
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        </AnimatedSection>

        <div className="space-y-16">
          {testimonials.map((t, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
                {/* Quote mark */}
                <div className="md:col-span-1">
                  <span className="font-bebas-neue text-6xl sm:text-7xl text-[#E8710A]/20 leading-none select-none">
                    &ldquo;
                  </span>
                </div>

                {/* Quote text */}
                <div className="md:col-span-8">
                  <blockquote className="text-xl sm:text-2xl md:text-3xl text-white/80 leading-relaxed font-light">
                    {t.quote}
                  </blockquote>
                </div>

                {/* Attribution */}
                <div className="md:col-span-3 md:text-right">
                  <div className="w-8 h-px bg-[#E8710A]/40 mb-4 md:ml-auto" />
                  <p className="font-bebas-neue text-xl text-white tracking-wide">
                    {t.author}
                  </p>
                  <p className="text-xs text-white/40 font-oswald tracking-[0.15em] uppercase mt-1">
                    {t.role}
                  </p>
                  <p className="text-[10px] text-[#E8710A]/50 font-oswald tracking-[0.2em] uppercase mt-3">
                    Nutzt: {t.tool}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
