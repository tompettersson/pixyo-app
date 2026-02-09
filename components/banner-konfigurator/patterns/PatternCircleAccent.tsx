'use client';

import React from 'react';
import { Logo, CTAButton, fontSizes, headlineStyle, isSmall, isHorizontal, type PatternProps } from './shared';

/**
 * P3: Circle Accent (NEW — replaces old Cutout)
 * Gradient background with decorative circles in brand colors.
 * No image required — pure brand-forward design.
 */
export default function PatternCircleAccent({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);
  const small = isSmall(width, height);
  const horiz = isHorizontal(width, height);

  // Scale circles to not overwhelm smaller formats
  const baseSize = Math.min(width, height);

  return (
    <div
      className="relative w-full h-full overflow-hidden flex"
      style={{
        background: `linear-gradient(${config.gradientAngle + 10}deg, ${config.colorFrom}, ${config.colorTo})`,
      }}
    >
      {/* Decorative circles */}
      {config.showDecoElements && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: baseSize * 0.6,
              height: baseSize * 0.6,
              background: config.resolvedTextColor,
              opacity: 0.08,
              top: '-10%',
              right: '-5%',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: baseSize * 0.35,
              height: baseSize * 0.35,
              background: config.resolvedTextColor,
              opacity: 0.06,
              bottom: '-5%',
              left: '10%',
            }}
          />
          {!small && (
            <div
              className="absolute rounded-full"
              style={{
                width: baseSize * 0.2,
                height: baseSize * 0.2,
                background: config.accentColor,
                opacity: 0.12,
                top: '30%',
                right: '25%',
              }}
            />
          )}
        </>
      )}

      {/* Content */}
      <div
        className={`relative z-10 flex ${horiz ? 'flex-row items-center gap-3 px-4' : 'flex-col justify-center items-start gap-0.5 p-3'}`}
        style={!horiz ? { flex: '1' } : { flex: '1' }}
      >
        <Logo url={config.logoUrl} size={fs.logo} fallbackColor={config.resolvedTextColor} />
        <div className={horiz ? 'text-left flex-1' : ''}>
          <p style={headlineStyle(config, fs)} className="leading-tight">
            {config.headline}
          </p>
          {!small && (
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
