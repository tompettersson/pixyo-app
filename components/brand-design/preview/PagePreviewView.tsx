'use client';

import React, { useEffect } from 'react';
import type { DesignTokens } from '@/types/designTokens';
import { loadGoogleFont } from '@/lib/brand-design/font-loader';

interface PagePreviewViewProps {
  tokens: DesignTokens;
  profileName: string | null;
}

/**
 * Page Preview — Realistic webpage simulation using the design tokens.
 * Shows a complete landing page: Hero, Features, Testimonial, CTA, Footer.
 */
export default function PagePreviewView({ tokens, profileName }: PagePreviewViewProps) {
  const { colors, typography, spacing, borders, shadows, components, media } = tokens;

  useEffect(() => {
    loadGoogleFont(typography.fonts.heading.family);
    loadGoogleFont(typography.fonts.body.family);
  }, [typography.fonts]);

  const headingFont = `'${typography.fonts.heading.family}', ${typography.fonts.heading.fallback}`;
  const bodyFont = `'${typography.fonts.body.family}', ${typography.fonts.body.fallback}`;
  const name = profileName || 'Brand Name';

  return (
    <div
      className="rounded-2xl overflow-hidden border border-zinc-800"
      style={{ fontFamily: bodyFont }}
    >
      {/* ── Browser Chrome ─────────────────────────────── */}
      <div className="bg-zinc-800 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-zinc-700 rounded-md px-3 py-1 text-xs text-zinc-400 text-center">
            {name.toLowerCase().replace(/\s+/g, '')}.de
          </div>
        </div>
      </div>

      {/* ── Page Content ───────────────────────────────── */}
      <div style={{ backgroundColor: colors.semantic.background.default }}>

        {/* Navigation */}
        <nav
          className="flex items-center justify-between"
          style={{
            padding: `${spacing.scale.md} ${spacing.scale['2xl']}`,
            borderBottom: `1px solid ${colors.semantic.border.subtle}`,
          }}
        >
          <div className="flex items-center gap-2">
            {media.logoVariants.primary ? (
              <img src={media.logoVariants.primary} alt="Logo" className="h-8 object-contain" crossOrigin="anonymous" />
            ) : (
              <span style={{ fontFamily: headingFont, fontWeight: typography.fontWeights.bold, fontSize: typography.scale.lg, color: colors.semantic.text.default }}>
                {name}
              </span>
            )}
          </div>
          <div className="flex items-center" style={{ gap: spacing.scale.lg }}>
            {['Produkte', 'Preise', 'Über uns'].map((item) => (
              <span
                key={item}
                style={{
                  fontSize: typography.scale.sm,
                  color: colors.semantic.text.muted,
                  fontWeight: typography.fontWeights.medium,
                }}
              >
                {item}
              </span>
            ))}
            <button
              style={{
                background: components.button.primary.background,
                color: components.button.primary.color,
                borderRadius: components.button.primary.borderRadius,
                fontWeight: components.button.primary.fontWeight,
                fontSize: typography.scale.sm,
                padding: `${components.button.primary.paddingY} ${components.button.primary.paddingX}`,
                border: 'none',
                textTransform: components.button.primary.textTransform,
              }}
            >
              Starten
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section
          className="text-center"
          style={{
            padding: `${spacing.scale['4xl']} ${spacing.scale['2xl']}`,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: typography.scale.sm,
              fontWeight: typography.fontWeights.semibold,
              color: colors.semantic.primary,
              background: `${colors.semantic.primary}12`,
              padding: `${spacing.scale.xs} ${spacing.scale.md}`,
              borderRadius: borders.radius.full,
              marginBottom: spacing.scale.lg,
            }}
          >
            Neu: Version 2.0 ist da
          </span>
          <h1
            style={{
              fontFamily: headingFont,
              fontSize: typography.scale['5xl'],
              fontWeight: typography.fontWeights.bold,
              lineHeight: typography.lineHeight.tight,
              color: colors.semantic.text.default,
              textTransform: typography.headingUppercase ? 'uppercase' : 'none',
              letterSpacing: typography.headingUppercase ? typography.letterSpacing.wide : typography.letterSpacing.tight,
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Die Zukunft beginnt mit deiner Marke
          </h1>
          <p
            style={{
              fontSize: typography.scale.lg,
              lineHeight: typography.lineHeight.relaxed,
              color: colors.semantic.text.muted,
              maxWidth: '540px',
              margin: `${spacing.scale.lg} auto 0`,
            }}
          >
            Erstelle ein professionelles Design-System in Minuten. Farben, Typografie, Components — alles an einem Ort.
          </p>
          <div className="flex items-center justify-center" style={{ gap: spacing.scale.md, marginTop: spacing.scale.xl }}>
            <button
              style={{
                background: components.button.primary.background,
                color: components.button.primary.color,
                borderRadius: components.button.primary.borderRadius,
                fontWeight: components.button.primary.fontWeight,
                fontSize: typography.scale.base_ || `${typography.scale.base}px`,
                padding: `14px 32px`,
                border: 'none',
                textTransform: components.button.primary.textTransform,
              }}
            >
              Kostenlos starten
            </button>
            <button
              style={{
                background: components.button.outline.background,
                color: components.button.outline.color,
                borderRadius: components.button.outline.borderRadius,
                fontWeight: components.button.outline.fontWeight,
                fontSize: typography.scale.base_ || `${typography.scale.base}px`,
                padding: `14px 32px`,
                border: components.button.outline.border,
                textTransform: components.button.outline.textTransform,
              }}
            >
              Demo ansehen
            </button>
          </div>
        </section>

        {/* Feature Cards */}
        <section
          style={{
            padding: `${spacing.scale['3xl']} ${spacing.scale['2xl']}`,
            backgroundColor: colors.semantic.background.subtle,
          }}
        >
          <h2
            className="text-center"
            style={{
              fontFamily: headingFont,
              fontSize: typography.scale['3xl'],
              fontWeight: typography.fontWeights.bold,
              color: colors.semantic.text.default,
              textTransform: typography.headingUppercase ? 'uppercase' : 'none',
              marginBottom: spacing.scale['2xl'],
            }}
          >
            Warum {name}?
          </h2>
          <div className="grid grid-cols-3" style={{ gap: spacing.scale.lg }}>
            {[
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Schnell', desc: 'In Sekunden ein vollständiges Design-System erstellen.' },
              { icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072', title: 'Konsistent', desc: 'Alle Token sind aufeinander abgestimmt und harmonisch.' },
              { icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5', title: 'Export', desc: 'CSS, Tailwind, JSON — direkt in dein Projekt kopieren.' },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  background: components.card.background,
                  border: components.card.border,
                  borderRadius: components.card.borderRadius,
                  boxShadow: components.card.shadow,
                  padding: components.card.padding,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: borders.radius.lg,
                    background: `${colors.semantic.primary}12`,
                    marginBottom: spacing.scale.md,
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke={colors.semantic.primary} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feature.icon} />
                  </svg>
                </div>
                <h3
                  style={{
                    fontFamily: headingFont,
                    fontSize: typography.scale.lg,
                    fontWeight: typography.fontWeights.semibold,
                    color: colors.semantic.text.default,
                    textTransform: typography.headingUppercase ? 'uppercase' : 'none',
                    marginBottom: spacing.scale.sm,
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: typography.scale.sm, lineHeight: typography.lineHeight.relaxed, color: colors.semantic.text.muted }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="text-center" style={{ padding: `${spacing.scale['3xl']} ${spacing.scale['2xl']}` }}>
          <blockquote
            style={{
              fontFamily: headingFont,
              fontSize: typography.scale['2xl'],
              fontWeight: typography.fontWeights.medium,
              lineHeight: typography.lineHeight.relaxed,
              color: colors.semantic.text.default,
              maxWidth: '600px',
              margin: '0 auto',
              fontStyle: 'italic',
            }}
          >
            &ldquo;Mit {name} haben wir unser Brand Design in einer Stunde definiert. Vorher haben wir Wochen gebraucht.&rdquo;
          </blockquote>
          <p style={{ fontSize: typography.scale.sm, color: colors.semantic.text.muted, marginTop: spacing.scale.md }}>
            — Lisa Schmidt, Design Lead
          </p>
        </section>

        {/* CTA Section */}
        <section
          className="text-center"
          style={{
            padding: `${spacing.scale['3xl']} ${spacing.scale['2xl']}`,
            backgroundColor: colors.semantic.primary,
          }}
        >
          <h2
            style={{
              fontFamily: headingFont,
              fontSize: typography.scale['3xl'],
              fontWeight: typography.fontWeights.bold,
              color: colors.semantic.text.onPrimary,
              textTransform: typography.headingUppercase ? 'uppercase' : 'none',
              marginBottom: spacing.scale.md,
            }}
          >
            Bereit loszulegen?
          </h2>
          <p style={{ fontSize: typography.scale.lg, color: colors.semantic.text.onPrimary, opacity: 0.8, marginBottom: spacing.scale.xl }}>
            Starte jetzt kostenlos und definiere dein Brand Design.
          </p>
          <button
            style={{
              background: colors.semantic.background.default,
              color: colors.semantic.primary,
              borderRadius: components.button.primary.borderRadius,
              fontWeight: typography.fontWeights.semibold,
              fontSize: typography.scale.base_ || `${typography.scale.base}px`,
              padding: '14px 32px',
              border: 'none',
            }}
          >
            Jetzt kostenlos starten
          </button>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: `${spacing.scale.xl} ${spacing.scale['2xl']}`,
            borderTop: `1px solid ${colors.semantic.border.default}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: typography.scale.sm, color: colors.semantic.text.muted }}>
            &copy; {new Date().getFullYear()} {name}. Alle Rechte vorbehalten.
          </span>
          <div className="flex" style={{ gap: spacing.scale.lg }}>
            {['Impressum', 'Datenschutz', 'AGB'].map((item) => (
              <span
                key={item}
                style={{
                  fontSize: typography.scale.sm,
                  color: components.link.color,
                  textDecoration: components.link.underline ? 'underline' : 'none',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
