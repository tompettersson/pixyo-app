'use client';

import React from 'react';
import { Logo, CTAButton, fontSizes, headlineStyle, isTiny, isVertical, isHorizontal, type PatternProps } from './shared';

/**
 * P7: Duotone (NEW — replaces Wave)
 * Photo colorized with brand colors via mix-blend-mode.
 * Creates a striking duotone effect using colorFrom and colorTo.
 */
export default function PatternDuotone({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);
  const tiny = isTiny(width, height);
  const vert = isVertical(width, height);
  const horiz = isHorizontal(width, height);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Duotone effect: base color + grayscale image + multiply blend */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${config.colorFrom}, ${config.colorTo})`,
        }}
      />
      {/* Image with multiply blend to create duotone */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'luminosity',
          opacity: 0.6,
        }}
      />
      {/* Slight dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to ${vert ? 'bottom' : 'right'}, rgba(0,0,0,0.1) 0%, rgba(0,0,0,${config.overlayStrength * 0.5}) 100%)`,
        }}
      />
      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col ${
          vert
            ? 'justify-end items-center text-center pb-6'
            : horiz
              ? 'justify-center items-start pl-4'
              : 'justify-end items-start pb-4 pl-3'
        } gap-0.5 p-3`}
      >
        {!tiny && <Logo url={config.logoUrl} size={fs.logo} fallbackColor="#fff" />}
        <p
          style={{
            fontSize: fs.headline,
            fontFamily: config.headlineFont,
            fontWeight: config.headlineWeight,
            textTransform: config.headlineUppercase ? 'uppercase' : 'none',
          }}
          className="leading-tight text-white drop-shadow-md"
        >
          {config.headline}
        </p>
        {!tiny && (
          <p style={{ fontSize: fs.sub }} className="text-white/85 drop-shadow-sm">
            {config.subline}
          </p>
        )}
        <div className="mt-1">
          <CTAButton config={config} small={fs.cta} />
        </div>
      </div>
    </div>
  );
}
