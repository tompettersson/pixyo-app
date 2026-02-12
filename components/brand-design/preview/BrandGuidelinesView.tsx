'use client';

import React, { useEffect } from 'react';
import type { DesignTokens } from '@/types/designTokens';
import { loadGoogleFont } from '@/lib/brand-design/font-loader';

interface BrandGuidelinesViewProps {
  tokens: DesignTokens;
  profileName: string | null;
}

/**
 * Brand Guidelines — Structured reference document showing all tokens.
 * This is the "technical" view: color swatches, type specimen, spacing scale, etc.
 */
export default function BrandGuidelinesView({ tokens, profileName }: BrandGuidelinesViewProps) {
  const { colors, typography, spacing, borders, shadows, components, voice, media } = tokens;

  useEffect(() => {
    loadGoogleFont(typography.fonts.heading.family);
    loadGoogleFont(typography.fonts.body.family);
  }, [typography.fonts]);

  const headingFont = `'${typography.fonts.heading.family}', ${typography.fonts.heading.fallback}`;
  const bodyFont = `'${typography.fonts.body.family}', ${typography.fonts.body.fallback}`;

  return (
    <div className="space-y-8">
      {/* ── Color Palette ──────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Farbpalette</h2>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(colors.palette).map(([name, value]) => (
            <div key={name} className="group">
              <div
                className="aspect-[3/2] rounded-xl border border-zinc-800"
                style={{ backgroundColor: value }}
              />
              <div className="mt-1.5 flex justify-between items-baseline">
                <span className="text-xs text-zinc-400 capitalize">{name}</span>
                <span className="text-[10px] text-zinc-600 font-mono">{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Semantic colors row */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {[
            { label: 'BG', color: colors.semantic.background.default, border: true },
            { label: 'Subtle', color: colors.semantic.background.subtle, border: true },
            { label: 'Text', color: colors.semantic.text.default },
            { label: 'Muted', color: colors.semantic.text.muted },
            { label: 'Success', color: colors.semantic.status.success },
            { label: 'Warning', color: colors.semantic.status.warning },
            { label: 'Error', color: colors.semantic.status.error },
            { label: 'Info', color: colors.semantic.status.info },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded"
                style={{
                  backgroundColor: item.color,
                  border: item.border ? '1px solid #3f3f46' : undefined,
                }}
              />
              <span className="text-[10px] text-zinc-500">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Typography Specimen ────────────────────────── */}
      <section
        className="rounded-2xl p-8"
        style={{
          backgroundColor: colors.semantic.background.default,
          border: `1px solid ${colors.semantic.border.default}`,
        }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-6"
          style={{ color: colors.semantic.text.muted }}
        >
          Typografie
        </h2>

        <div className="space-y-3">
          {[
            { label: 'H1', size: typography.scale['5xl'], weight: typography.fontWeights.bold },
            { label: 'H2', size: typography.scale['4xl'], weight: typography.fontWeights.bold },
            { label: 'H3', size: typography.scale['3xl'], weight: typography.fontWeights.semibold },
            { label: 'H4', size: typography.scale['2xl'], weight: typography.fontWeights.semibold },
          ].map((level) => (
            <div key={level.label} className="flex items-baseline gap-3">
              <span className="text-[10px] font-mono w-6 shrink-0" style={{ color: colors.semantic.text.muted }}>
                {level.label}
              </span>
              <span
                style={{
                  fontFamily: headingFont,
                  fontSize: level.size,
                  fontWeight: level.weight,
                  lineHeight: typography.lineHeight.tight,
                  color: colors.semantic.text.default,
                  textTransform: typography.headingUppercase ? 'uppercase' : 'none',
                  letterSpacing: typography.headingUppercase ? typography.letterSpacing.wide : typography.letterSpacing.normal,
                }}
              >
                {profileName || 'Brand Name'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <p style={{ fontFamily: bodyFont, fontSize: typography.scale.base_ || `${typography.scale.base}px`, fontWeight: typography.fontWeights.normal, lineHeight: typography.lineHeight.normal, color: colors.semantic.text.default }}>
            Body Text — Dies ist ein Beispiel für den Fließtext. Die Schriftart <strong style={{ fontWeight: typography.fontWeights.bold }}>{typography.fonts.body.family}</strong> in {typography.scale.base}px mit einem Zeilenabstand von {typography.lineHeight.normal}.
          </p>
          <p style={{ fontFamily: bodyFont, fontSize: typography.scale.sm, fontWeight: typography.fontWeights.normal, lineHeight: typography.lineHeight.relaxed, color: colors.semantic.text.muted }}>
            Muted Text — Kleinere Beschreibungen und sekundäre Informationen werden in dieser Größe dargestellt.
          </p>
        </div>

        {/* Font details table */}
        <div className="mt-6 pt-4 grid grid-cols-2 gap-4" style={{ borderTop: `1px solid ${colors.semantic.border.subtle}` }}>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Heading</span>
            <p className="text-sm text-zinc-300 mt-0.5">{typography.fonts.heading.family}</p>
            <p className="text-[10px] text-zinc-500">Weights: {Object.values(typography.fontWeights).join(', ')}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Body</span>
            <p className="text-sm text-zinc-300 mt-0.5">{typography.fonts.body.family}</p>
            <p className="text-[10px] text-zinc-500">Base: {typography.scale.base}px, Ratio: {typography.scale.ratio}</p>
          </div>
        </div>
      </section>

      {/* ── Button Gallery ─────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Buttons</h2>
        <div
          className="rounded-2xl p-8 flex flex-wrap gap-4 items-center"
          style={{ backgroundColor: colors.semantic.background.default, border: `1px solid ${colors.semantic.border.default}` }}
        >
          {(['primary', 'secondary', 'outline', 'ghost'] as const).map((variant) => {
            const style = components.button[variant];
            return (
              <button
                key={variant}
                className="transition-opacity hover:opacity-90"
                style={{
                  background: style.background,
                  color: style.color,
                  border: style.border === 'none' ? 'none' : style.border,
                  borderRadius: style.borderRadius,
                  fontWeight: style.fontWeight,
                  textTransform: style.textTransform,
                  padding: `${style.paddingY} ${style.paddingX}`,
                  fontFamily: bodyFont,
                  fontSize: typography.scale.sm,
                }}
              >
                {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Spacing Visualization ──────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Spacing</h2>
        <div className="space-y-1">
          {Object.entries(spacing.scale).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500 font-mono w-8 text-right">{key}</span>
              <div className="h-4 rounded-sm" style={{ width: value, backgroundColor: colors.semantic.primary, opacity: 0.3 }} />
              <span className="text-[10px] text-zinc-600 font-mono">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Radius & Shadows ───────────────────────────── */}
      <section className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Border Radius</h2>
          <div className="flex flex-wrap gap-3">
            {['sm', 'md', 'lg', 'xl', 'full'].map((key) => (
              <div key={key} className="text-center">
                <div className="w-14 h-14 border-2" style={{ borderRadius: borders.radius[key as keyof typeof borders.radius], borderColor: colors.semantic.primary, backgroundColor: `${colors.semantic.primary}10` }} />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">{key}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Schatten</h2>
          <div className="flex flex-wrap gap-4">
            {(['sm', 'md', 'lg', 'xl'] as const).map((key) => (
              <div key={key} className="text-center">
                <div className="w-14 h-14 bg-white rounded-lg" style={{ boxShadow: shadows[key], borderRadius: borders.radius.default }} />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Card + Input Preview ────────────────────────── */}
      <section className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Card</h2>
          <div style={{ background: components.card.background, border: components.card.border, borderRadius: components.card.borderRadius, boxShadow: components.card.shadow, padding: components.card.padding }}>
            <h3 style={{ fontFamily: headingFont, fontSize: typography.scale.xl, fontWeight: typography.fontWeights.semibold, color: colors.semantic.text.default, lineHeight: typography.lineHeight.tight, textTransform: typography.headingUppercase ? 'uppercase' : 'none', marginBottom: spacing.scale.sm }}>
              Card Title
            </h3>
            <p style={{ fontFamily: bodyFont, fontSize: typography.scale.sm, color: colors.semantic.text.muted, lineHeight: typography.lineHeight.normal, marginBottom: spacing.scale.md }}>
              Dies ist eine Beispiel-Card mit dem konfigurierten Design-System.
            </p>
            <button style={{ background: components.button.primary.background, color: components.button.primary.color, border: components.button.primary.border === 'none' ? 'none' : components.button.primary.border, borderRadius: components.button.primary.borderRadius, fontWeight: components.button.primary.fontWeight, textTransform: components.button.primary.textTransform, padding: `${components.button.primary.paddingY} ${components.button.primary.paddingX}`, fontFamily: bodyFont, fontSize: typography.scale.sm }}>
              Mehr erfahren
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Input</h2>
          <div className="p-6 rounded-2xl" style={{ backgroundColor: colors.semantic.background.default, border: `1px solid ${colors.semantic.border.default}` }}>
            <label style={{ fontFamily: bodyFont, fontSize: typography.scale.sm, fontWeight: typography.fontWeights.medium, color: colors.semantic.text.default, display: 'block', marginBottom: spacing.scale.xs }}>
              E-Mail-Adresse
            </label>
            <input type="email" placeholder="name@example.com" readOnly style={{ width: '100%', background: components.input.background, border: components.input.border, borderRadius: components.input.borderRadius, padding: components.input.padding, fontFamily: bodyFont, fontSize: `${typography.scale.base}px`, color: colors.semantic.text.default, outline: 'none' }} />
          </div>
        </div>
      </section>

      {/* ── Brand Voice ────────────────────────────────── */}
      {(voice.tone.length > 0 || voice.description) && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Brand Voice</h2>
          <div className="bg-zinc-900 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Formalität:</span>
              <span className="text-xs text-zinc-300 capitalize">{voice.formality}</span>
              <span className="text-xs text-zinc-500 ml-2">Anrede:</span>
              <span className="text-xs text-zinc-300">{voice.address}</span>
            </div>
            {voice.tone.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {voice.tone.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-zinc-800 text-xs text-zinc-300 rounded-md">{t}</span>
                ))}
              </div>
            )}
            {voice.description && <p className="text-xs text-zinc-400 leading-relaxed">{voice.description}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
