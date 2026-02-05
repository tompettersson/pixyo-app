'use client';

import { AnimatedSection } from './AnimatedSection';

const logos = [
  {
    name: 'Hanako Koi',
    src: '/logos/HanakoKoiLogo-white.svg',
    className: 'h-8 sm:h-10',
    invert: false,
  },
  {
    name: '1001 Frucht',
    src: '/logos/1001frucht-black.svg',
    className: 'h-7 sm:h-9',
    invert: true,
  },
  {
    name: 'elforyn',
    src: '/logos/elforyn-black.svg',
    className: 'h-6 sm:h-8',
    invert: true,
  },
];

export function TrustSection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-10">
            Wird bereits genutzt von
          </p>

          <div className="flex items-center justify-center gap-12 sm:gap-16 flex-wrap">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="opacity-40 hover:opacity-70 transition-opacity duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.name}
                  className={`${logo.className} ${logo.invert ? 'invert brightness-0 invert' : ''}`}
                  style={logo.invert ? { filter: 'invert(1)' } : undefined}
                />
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
