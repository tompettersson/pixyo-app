'use client';

import React from 'react';
import { Logo, CTAButton, fontSizes, headlineStyle, isVertical, isHorizontal, type PatternProps } from './shared';

/**
 * P2: Diagonal Split
 * Image background with a diagonal clip-path gradient overlay.
 * clip-path adapts dynamically to aspect ratio.
 */
export default function PatternDiagonal({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);
  const vert = isVertical(width, height);
  const horiz = isHorizontal(width, height);

  // Dynamic clip-path based on aspect ratio
  // Wider formats → more aggressive diagonal, taller → gentler
  const ratio = width / height;
  let leftEdge: number;
  let rightEdge: number;

  if (horiz) {
    // Leaderboard-type: diagonal starts further right
    leftEdge = Math.min(45, 30 + ratio * 5);
    rightEdge = Math.min(70, leftEdge + 20);
  } else if (vert) {
    // Skyscraper-type: gentler diagonal
    leftEdge = 15;
    rightEdge = 65;
  } else {
    // Rectangle-type: balanced diagonal
    leftEdge = 35;
    rightEdge = 55;
  }

  const clipPath = `polygon(${leftEdge}% 0, 100% 0, 100% 100%, ${rightEdge}% 100%)`;

  // Content alignment: right-aligned on the gradient area
  const contentPadding = vert ? 'p-3' : `pr-[${Math.max(8, 20 - ratio * 3)}%] pl-4`;

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
      {/* Diagonal gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${config.colorFrom}, ${config.colorTo})`,
          clipPath,
        }}
      />
      {/* Content (positioned on the gradient side) */}
      <div
        className={`absolute inset-0 flex flex-col justify-center ${vert ? 'items-center text-center p-3' : 'items-end text-right'} gap-0.5`}
        style={!vert ? { paddingRight: '10%', paddingLeft: '4%' } : undefined}
      >
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
