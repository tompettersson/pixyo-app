'use client';

import React from 'react';
import { Logo, CTAButton, fontSizes, headlineStyle, isTiny, isVertical, type PatternProps } from './shared';

/**
 * P6: Photo Overlay (renamed from "Darkened")
 * Full image with colored tint overlay + dark overlay.
 * overlayStrength controls the darkness. Brand colors tint the image.
 */
export default function PatternPhotoOverlay({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);
  const tiny = isTiny(width, height);
  const vert = isVertical(width, height);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Colored tint overlay using brand colors */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${config.colorFrom}bb, ${config.colorTo}99)`,
          mixBlendMode: 'multiply',
        }}
      />
      {/* Dark overlay controlled by overlayStrength */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${config.overlayStrength})` }}
      />
      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col ${
          vert ? 'justify-center items-center text-center' : 'justify-center items-start'
        } p-3 gap-0.5`}
      >
        {!tiny && <Logo url={config.logoUrl} size={fs.logo} fallbackColor="#fff" />}
        <p
          style={{
            fontSize: fs.headline,
            fontFamily: config.headlineFont,
            fontWeight: config.headlineWeight,
            textTransform: config.headlineUppercase ? 'uppercase' : 'none',
          }}
          className="leading-tight text-white"
        >
          {config.headline}
        </p>
        {!tiny && (
          <p style={{ fontSize: fs.sub }} className="text-white/80">
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
