'use client';

import React, { useEffect } from 'react';
import type { DesignTokens } from '@/types/designTokens';
import { loadGoogleFont } from '@/lib/brand-design/font-loader';

interface MoodboardViewProps {
  tokens: DesignTokens;
  profileName: string | null;
}

/**
 * Moodboard — Creative, visual layout showing the brand "feeling".
 * Arranged as a collage-style grid with typography, color moods, and brand personality.
 */
export default function MoodboardView({ tokens, profileName }: MoodboardViewProps) {
  const { colors, typography, components, voice, media } = tokens;

  useEffect(() => {
    loadGoogleFont(typography.fonts.heading.family);
    loadGoogleFont(typography.fonts.body.family);
  }, [typography.fonts]);

  const headingFont = `'${typography.fonts.heading.family}', ${typography.fonts.heading.fallback}`;
  const bodyFont = `'${typography.fonts.body.family}', ${typography.fonts.body.fallback}`;

  return (
    <div className="space-y-4">
      {/* ── Hero Block ─────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ minHeight: '360px', background: colors.semantic.primary }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: colors.semantic.accent }}
        />
        <div
          className="absolute bottom-10 -left-10 w-40 h-40 rounded-full opacity-15"
          style={{ background: colors.semantic.secondary }}
        />

        <div className="relative z-10 p-12 flex flex-col justify-end h-full" style={{ minHeight: '360px' }}>
          {/* Logo */}
          {media.logoVariants.primary && (
            <img
              src={media.logoVariants.light || media.logoVariants.primary}
              alt="Logo"
              className="w-16 h-16 object-contain mb-6 opacity-90"
              crossOrigin="anonymous"
            />
          )}
          <h1
            style={{
              fontFamily: headingFont,
              fontSize: typography.scale['5xl'],
              fontWeight: typography.fontWeights.bold,
              lineHeight: typography.lineHeight.tight,
              color: colors.semantic.text.onPrimary,
              textTransform: typography.headingUppercase ? 'uppercase' : 'none',
              letterSpacing: typography.headingUppercase ? typography.letterSpacing.wide : typography.letterSpacing.tight,
            }}
          >
            {profileName || 'Brand Name'}
          </h1>
          {voice.tone.length > 0 && (
            <p
              className="mt-3 opacity-70"
              style={{
                fontFamily: bodyFont,
                fontSize: typography.scale.lg,
                color: colors.semantic.text.onPrimary,
              }}
            >
              {voice.tone.join(' \u00b7 ')}
            </p>
          )}
        </div>
      </div>

      {/* ── Color Mood Grid ────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3" style={{ height: '140px' }}>
        <div className="rounded-xl col-span-2 flex flex-col justify-end p-4" style={{ background: colors.semantic.primary }}>
          <span className="text-[10px] font-mono" style={{ color: colors.semantic.text.onPrimary, opacity: 0.6 }}>
            Primary
          </span>
        </div>
        <div className="rounded-xl flex flex-col justify-end p-4" style={{ background: colors.semantic.secondary }}>
          <span className="text-[10px] font-mono" style={{ color: colors.semantic.text.onPrimary, opacity: 0.6 }}>
            Secondary
          </span>
        </div>
        <div className="rounded-xl flex flex-col justify-end p-4" style={{ background: colors.semantic.accent }}>
          <span className="text-[10px] font-mono" style={{ color: colors.semantic.text.onPrimary, opacity: 0.6 }}>
            Accent
          </span>
        </div>
        <div className="rounded-xl flex flex-col justify-end p-4" style={{ background: colors.semantic.background.inverse }}>
          <span className="text-[10px] font-mono" style={{ color: colors.semantic.text.inverse, opacity: 0.6 }}>
            Dark
          </span>
        </div>
      </div>

      {/* ── Typography + Buttons Side-by-Side ──────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Type specimen */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: colors.semantic.background.default,
            border: `1px solid ${colors.semantic.border.default}`,
          }}
        >
          <p
            className="mb-1"
            style={{
              fontFamily: bodyFont,
              fontSize: typography.scale.xs,
              color: colors.semantic.text.muted,
              textTransform: 'uppercase',
              letterSpacing: typography.letterSpacing.wide,
            }}
          >
            {typography.fonts.heading.family}
          </p>
          <h2
            style={{
              fontFamily: headingFont,
              fontSize: typography.scale['4xl'],
              fontWeight: typography.fontWeights.bold,
              lineHeight: typography.lineHeight.tight,
              color: colors.semantic.text.default,
              textTransform: typography.headingUppercase ? 'uppercase' : 'none',
            }}
          >
            Aa Bb Cc
          </h2>
          <div className="mt-4 space-y-0.5">
            <p
              style={{
                fontFamily: headingFont,
                fontSize: typography.scale.lg,
                fontWeight: typography.fontWeights.bold,
                color: colors.semantic.text.default,
              }}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p
              style={{
                fontFamily: headingFont,
                fontSize: typography.scale.lg,
                fontWeight: typography.fontWeights.normal,
                color: colors.semantic.text.muted,
              }}
            >
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p
              style={{
                fontFamily: headingFont,
                fontSize: typography.scale.lg,
                fontWeight: typography.fontWeights.normal,
                color: colors.semantic.text.muted,
              }}
            >
              0123456789 !@#$%
            </p>
          </div>

          {typography.fonts.body.family !== typography.fonts.heading.family && (
            <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${colors.semantic.border.subtle}` }}>
              <p
                className="mb-1"
                style={{
                  fontFamily: bodyFont,
                  fontSize: typography.scale.xs,
                  color: colors.semantic.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: typography.letterSpacing.wide,
                }}
              >
                {typography.fonts.body.family}
              </p>
              <p
                style={{
                  fontFamily: bodyFont,
                  fontSize: typography.scale.base_,
                  lineHeight: typography.lineHeight.relaxed,
                  color: colors.semantic.text.default,
                }}
              >
                The quick brown fox jumps over the lazy dog. Franz jagt im komplett verwahrlosten Taxi quer durch Bayern.
              </p>
            </div>
          )}
        </div>

        {/* Buttons + Card mood */}
        <div className="space-y-4">
          {/* Buttons */}
          <div
            className="rounded-2xl p-8 flex flex-col gap-3"
            style={{
              background: colors.semantic.background.default,
              border: `1px solid ${colors.semantic.border.default}`,
            }}
          >
            {(['primary', 'secondary', 'outline', 'ghost'] as const).map((variant) => {
              const style = components.button[variant];
              return (
                <button
                  key={variant}
                  className="w-full text-center transition-opacity"
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
                  {variant === 'primary' ? 'Jetzt starten' : variant === 'secondary' ? 'Mehr erfahren' : variant === 'outline' ? 'Kontakt' : 'Details ansehen'}
                </button>
              );
            })}
          </div>

          {/* Mini card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: colors.semantic.background.subtle,
              border: `1px solid ${colors.semantic.border.subtle}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
              style={{ background: colors.semantic.primary }}
            >
              <svg className="w-5 h-5" fill="none" stroke={colors.semantic.text.onPrimary} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3
              style={{
                fontFamily: headingFont,
                fontSize: typography.scale.lg,
                fontWeight: typography.fontWeights.semibold,
                color: colors.semantic.text.default,
                textTransform: typography.headingUppercase ? 'uppercase' : 'none',
              }}
            >
              Feature Highlight
            </h3>
            <p
              className="mt-1"
              style={{
                fontFamily: bodyFont,
                fontSize: typography.scale.sm,
                lineHeight: typography.lineHeight.relaxed,
                color: colors.semantic.text.muted,
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod.
            </p>
          </div>
        </div>
      </div>

      {/* ── Brand Voice Mood ───────────────────────────── */}
      {(voice.description || voice.dos.length > 0 || voice.donts.length > 0) && (
        <div
          className="rounded-2xl p-8"
          style={{
            background: colors.semantic.background.inverse,
          }}
        >
          <h3
            style={{
              fontFamily: headingFont,
              fontSize: typography.scale.xl,
              fontWeight: typography.fontWeights.bold,
              color: colors.semantic.text.inverse,
              textTransform: typography.headingUppercase ? 'uppercase' : 'none',
              marginBottom: '12px',
            }}
          >
            Brand Voice
          </h3>
          {voice.description && (
            <p
              style={{
                fontFamily: bodyFont,
                fontSize: typography.scale.base_,
                lineHeight: typography.lineHeight.relaxed,
                color: colors.semantic.text.inverse,
                opacity: 0.7,
              }}
            >
              {voice.description}
            </p>
          )}
          {(voice.dos.length > 0 || voice.donts.length > 0) && (
            <div className="grid grid-cols-2 gap-6 mt-4">
              {voice.dos.length > 0 && (
                <div>
                  <span
                    className="text-xs font-medium block mb-2"
                    style={{ color: colors.semantic.status.success }}
                  >
                    Do
                  </span>
                  {voice.dos.map((d, i) => (
                    <p
                      key={i}
                      className="text-sm mb-1"
                      style={{ color: colors.semantic.text.inverse, opacity: 0.7 }}
                    >
                      + {d}
                    </p>
                  ))}
                </div>
              )}
              {voice.donts.length > 0 && (
                <div>
                  <span
                    className="text-xs font-medium block mb-2"
                    style={{ color: colors.semantic.status.error }}
                  >
                    Don&apos;t
                  </span>
                  {voice.donts.map((d, i) => (
                    <p
                      key={i}
                      className="text-sm mb-1"
                      style={{ color: colors.semantic.text.inverse, opacity: 0.7 }}
                    >
                      - {d}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
