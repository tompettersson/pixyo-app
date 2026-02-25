'use client';

import { AnimatedSection } from './AnimatedSection';

const advantages = [
  {
    number: '01',
    title: 'Studio-Qualität ohne Studio',
    description:
      'Pixyo denkt wie ein professioneller Fotograf — mit Wissen über Brennweiten, Lichtsetzung und Komposition. Das Ergebnis: Produktfotos, die aussehen wie aus einem echten Shooting. Nicht wie KI.',
  },
  {
    number: '02',
    title: 'Dein Produkt. Pixelgenau.',
    description:
      'Andere Tools verändern dein Produkt — Logos verschwinden, Farben verschieben sich, Details gehen verloren. Pixyo schützt die Identität deines Produkts und setzt es unverändert in die neue Szene.',
  },
  {
    number: '03',
    title: 'Szenen, die zu deiner Branche passen',
    description:
      'Kein generisches Stock-Feeling. Pixyo kennt deine Branche und schlägt passende Szenen vor — ob Gourmet-Küche, Zen-Garten oder Konzertbühne. Ein Klick, und der Hintergrund stimmt.',
  },
  {
    number: '04',
    title: 'Null Prompt-Expertise nötig',
    description:
      'Vergiss stundenlanges Prompting und Trial-and-Error. Pixyo hat die gesamte Expertise eingebaut — du beschreibst die Szene in einem Satz, den Rest übernimmt die Plattform.',
  },
];

export function AdvantagesSection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-16 sm:mb-20">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/50">
              Warum Pixyo
            </span>
            <div className="flex-1 h-px bg-white/[0.10]" />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="max-w-5xl mb-16 sm:mb-20">
            <h2 className="font-bebas-neue text-5xl sm:text-6xl md:text-8xl text-white tracking-tight leading-[0.9] mb-8">
              Besser als selbst prompten.
              <br />
              <span className="text-[#E8710A]">Und das ist der Punkt.</span>
            </h2>
            <p className="text-base sm:text-lg text-white/55 font-light max-w-2xl leading-relaxed">
              Jeder kann ein Bild mit KI generieren. Aber ein Ergebnis, das wirklich nach
              professioneller Produktfotografie aussieht? Das ist der Unterschied zwischen
              einem Prompt und einem System, das weiß, was es tut.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-0">
          {advantages.map((item, i) => (
            <AnimatedSection key={item.number} delay={i * 0.08}>
              <div
                className={`relative p-8 sm:p-10 border border-white/[0.06] ${
                  i === 0 ? 'md:border-r-0 md:border-b-0' : ''
                }${i === 1 ? 'md:border-b-0' : ''}${
                  i === 2 ? 'md:border-r-0' : ''
                }`}
              >
                {/* Number accent */}
                <span className="font-bebas-neue text-3xl sm:text-4xl text-[#E8710A]/20 block mb-4">
                  {item.number}
                </span>

                {/* Title */}
                <h3 className="font-bebas-neue text-2xl sm:text-3xl text-white tracking-tight mb-4">
                  {item.title}
                </h3>

                {/* Divider */}
                <div className="w-8 h-px bg-[#E8710A]/30 mb-4" />

                {/* Description */}
                <p className="text-sm sm:text-base text-white/50 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
