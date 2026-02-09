'use client';

import React from 'react';
import { Logo, CTAButton, fontSizes, headlineStyle, isVertical, type PatternProps } from './shared';

/**
 * P1: Split Layout
 * Horizontal or vertical split with image on one side, gradient content on the other.
 * Automatically adapts orientation based on aspect ratio.
 */
export default function PatternSplit({ width, height, config }: PatternProps) {
  const vert = isVertical(width, height);
  const fs = fontSizes(width, height);
  const splitPct = `${config.splitRatio * 100}%`;

  if (vert) {
    return (
      <div className="relative flex flex-col w-full h-full overflow-hidden">
        <div
          className="flex-1"
          style={{
            backgroundImage: `url(${config.bgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="flex flex-col justify-center items-center gap-1 p-3"
          style={{
            background: `linear-gradient(${config.gradientAngle}deg, ${config.colorFrom}, ${config.colorTo})`,
            flex: `0 0 ${splitPct}`,
          }}
        >
          <Logo url={config.logoUrl} size={fs.logo} fallbackColor={config.resolvedTextColor} />
          <p style={headlineStyle(config, fs)} className="leading-tight text-center">
            {config.headline}
          </p>
          <p style={{ fontSize: fs.sub, color: config.resolvedTextColor }} className="opacity-80 text-center">
            {config.subline}
          </p>
          <div className="mt-1">
            <CTAButton config={config} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-full overflow-hidden">
      <div
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flex: `0 0 ${100 - config.splitRatio * 100}%`,
        }}
      />
      <div
        className="flex flex-col justify-center items-start gap-0.5 px-3"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${config.colorFrom}, ${config.colorTo})`,
          flex: 1,
        }}
      >
        <Logo url={config.logoUrl} size={fs.logo} fallbackColor={config.resolvedTextColor} />
        <p style={headlineStyle(config, fs)} className="leading-tight">
          {config.headline}
        </p>
        <p style={{ fontSize: fs.sub, color: config.resolvedTextColor }} className="opacity-80">
          {config.subline}
        </p>
        <div className="mt-1">
          <CTAButton config={config} small={fs.cta} />
        </div>
      </div>
    </div>
  );
}
