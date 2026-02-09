'use client';

import React from 'react';
import { Logo, CTAButton, fontSizes, headlineStyle, isTiny, isHorizontal, type PatternProps } from './shared';

/**
 * P5: Minimal Gradient (no image)
 * Clean gradient background with optional dot pattern.
 * Essential "no image" option — pure brand-forward.
 */
export default function PatternMinimalGradient({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);
  const tiny = isTiny(width, height);
  const horiz = isHorizontal(width, height);

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(${config.gradientAngle}deg, ${config.colorFrom}, ${config.colorTo})`,
      }}
    >
      {/* Subtle pattern dots */}
      {config.showDecoElements && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      )}
      <div className={`relative z-10 flex ${horiz ? 'flex-row items-center gap-3 px-4' : 'flex-col items-center gap-1 p-3'} text-center`}>
        {!tiny && <Logo url={config.logoUrl} size={fs.logo} fallbackColor={config.resolvedTextColor} />}
        <div className={horiz ? 'text-left' : 'text-center'}>
          <p style={headlineStyle(config, fs)} className="leading-tight">
            {config.headline}
          </p>
          {!tiny && (
            <p style={{ fontSize: fs.sub, color: config.resolvedTextColor }} className="opacity-80 mt-0.5">
              {config.subline}
            </p>
          )}
        </div>
        <div className={horiz ? '' : 'mt-1'}>
          <CTAButton config={config} small={fs.cta} />
        </div>
      </div>
    </div>
  );
}
