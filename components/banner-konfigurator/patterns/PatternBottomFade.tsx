'use client';

import React from 'react';
import { Logo, CTAButton, fontSizes, headlineStyle, type PatternProps } from './shared';

/**
 * P4: Bottom Gradient Fade
 * Full image background with gradient fade from bottom.
 * Universal pattern that works across all aspect ratios.
 */
export default function PatternBottomFade({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);

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
      {/* Gradient fade from bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 20%, ${config.colorFrom}dd 60%, ${config.colorTo} 100%)`,
        }}
      />
      {/* Content at bottom */}
      <div className="absolute inset-0 flex flex-col justify-end p-3 gap-0.5">
        <Logo url={config.logoUrl} size={fs.logo} fallbackColor={config.resolvedTextColor} />
        <p style={headlineStyle(config, fs)} className="leading-tight">
          {config.headline}
        </p>
        <p style={{ fontSize: fs.sub, color: config.resolvedTextColor }} className="opacity-90">
          {config.subline}
        </p>
        <div className="mt-1">
          <CTAButton config={config} small={fs.cta} />
        </div>
      </div>
    </div>
  );
}
