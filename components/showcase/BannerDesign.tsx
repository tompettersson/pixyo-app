'use client';

import React from 'react';
import type { BannerConfig } from '@/store/useBannerConfigStore';
import { getResolvedConfig } from '@/store/useBannerConfigStore';

type BannerDesignProps = {
  pattern: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8';
  width: number;
  height: number;
  config: BannerConfig;
};

type PatternProps = {
  width: number;
  height: number;
  config: BannerConfig & { resolvedTextColor: string };
};

// ─── Logo component ──────────────────────────────────────────────
function Logo({ url, size = 28, fallbackColor = '#fff' }: { url: string | null; size?: number; fallbackColor?: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt="Logo"
        style={{ width: size, height: size, objectFit: 'contain' }}
        crossOrigin="anonymous"
      />
    );
  }
  // Fallback TF circle
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill={fallbackColor} fillOpacity={0.2} />
      <circle cx="20" cy="20" r="17" stroke={fallbackColor} strokeWidth="2" fill="none" />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fill={fallbackColor}
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="16"
      >
        TF
      </text>
    </svg>
  );
}

// ─── CTA Button ──────────────────────────────────────────────────
function CTAButton({
  config,
  small = false,
}: {
  config: PatternProps['config'];
  small?: boolean;
}) {
  const px = small ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]';
  const radius =
    config.ctaStyle === 'pill'
      ? 'rounded-full'
      : config.ctaStyle === 'rounded'
        ? 'rounded-lg'
        : 'rounded-none';

  // CTA text color: dark on light accent, white on dark accent
  const accentHex = config.accentColor.replace('#', '');
  const r = parseInt(accentHex.substring(0, 2), 16);
  const g = parseInt(accentHex.substring(2, 4), 16);
  const b = parseInt(accentHex.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const ctaTextColor = lum > 0.5 ? '#1a1a1a' : '#ffffff';

  return (
    <span
      className={`inline-block font-bold tracking-wide ${px} ${radius}`}
      style={{
        backgroundColor: config.accentColor,
        color: ctaTextColor,
        textTransform: config.ctaUppercase ? 'uppercase' : 'none',
      }}
    >
      {config.ctaText}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────
function isHorizontal(w: number, h: number) {
  return w / h > 1.5;
}
function isVertical(w: number, h: number) {
  return h / w > 1.5;
}
function isSmall(w: number, h: number) {
  return w * h < 40000;
}
function isTiny(w: number, h: number) {
  return w * h < 25000;
}

function fontSizes(w: number, h: number) {
  const area = w * h;
  if (area > 1_000_000) return { headline: 36, sub: 18, logo: 36, cta: false as const };
  if (area > 200_000) return { headline: 24, sub: 14, logo: 32, cta: false as const };
  if (area > 80_000) return { headline: 16, sub: 10, logo: 24, cta: true as const };
  if (area > 30_000) return { headline: 13, sub: 9, logo: 20, cta: true as const };
  return { headline: 11, sub: 8, logo: 16, cta: true as const };
}

// ─── Headline style helper ───────────────────────────────────────
function headlineStyle(config: PatternProps['config'], fs: ReturnType<typeof fontSizes>) {
  return {
    fontSize: fs.headline,
    color: config.resolvedTextColor,
    fontFamily: config.headlineFont,
    fontWeight: config.headlineWeight,
    textTransform: (config.headlineUppercase ? 'uppercase' : 'none') as React.CSSProperties['textTransform'],
  };
}

// ═══════════════════════════════════════════════════════════════
// P1: Split Layout
// ═══════════════════════════════════════════════════════════════
function PatternSplit({ width, height, config }: PatternProps) {
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

// ═══════════════════════════════════════════════════════════════
// P2: Diagonal Split
// ═══════════════════════════════════════════════════════════════
function PatternDiagonal({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${config.colorFrom}, ${config.colorTo})`,
          clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 55% 100%)',
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-center items-end pr-[12%] gap-0.5">
        <Logo url={config.logoUrl} size={fs.logo} fallbackColor={config.resolvedTextColor} />
        <p style={headlineStyle(config, fs)} className="leading-tight text-right">
          {config.headline}
        </p>
        <p style={{ fontSize: fs.sub, color: config.resolvedTextColor }} className="opacity-90 text-right">
          {config.subline}
        </p>
        <div className="mt-1">
          <CTAButton config={config} small={fs.cta} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// P3: Product Cutout on Gradient
// ═══════════════════════════════════════════════════════════════
function PatternCutout({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);
  const small = isSmall(width, height);

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
            className="absolute rounded-full opacity-10"
            style={{
              width: height * 0.6,
              height: height * 0.6,
              background: '#fff',
              top: '-10%',
              right: '-5%',
            }}
          />
          <div
            className="absolute rounded-full opacity-10"
            style={{
              width: height * 0.35,
              height: height * 0.35,
              background: '#fff',
              bottom: '-5%',
              left: '10%',
            }}
          />
        </>
      )}
      <div className="flex flex-col justify-center items-start gap-0.5 p-3 z-10" style={{ flex: '0 0 55%' }}>
        <Logo url={config.logoUrl} size={fs.logo} fallbackColor={config.resolvedTextColor} />
        <p style={headlineStyle(config, fs)} className="leading-tight">
          {config.headline}
        </p>
        {!small && (
          <p style={{ fontSize: fs.sub, color: config.resolvedTextColor }} className="opacity-80">
            {config.subline}
          </p>
        )}
        <div className="mt-1">
          <CTAButton config={config} small={fs.cta} />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center z-10">
        <div
          className="rounded-lg flex items-center justify-center"
          style={{
            width: Math.min(width * 0.35, height * 0.6),
            height: Math.min(width * 0.35, height * 0.6),
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// P4: Bottom Gradient Fade
// ═══════════════════════════════════════════════════════════════
function PatternBottomFade({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 20%, ${config.colorFrom}dd 60%, ${config.colorTo} 100%)`,
        }}
      />
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

// ═══════════════════════════════════════════════════════════════
// P5: Minimal Gradient (no image)
// ═══════════════════════════════════════════════════════════════
function PatternMinimalGradient({ width, height, config }: PatternProps) {
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

// ═══════════════════════════════════════════════════════════════
// P6: Full Image Darkened
// ═══════════════════════════════════════════════════════════════
function PatternDarkened({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);
  const tiny = isTiny(width, height);
  const vert = isVertical(width, height);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Colored tint overlay */}
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
      <div className={`absolute inset-0 flex flex-col ${vert ? 'justify-center items-center text-center' : 'justify-center items-start'} p-3 gap-0.5`}>
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

// ═══════════════════════════════════════════════════════════════
// P7: Wave Separator
// ═══════════════════════════════════════════════════════════════
function PatternWave({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${config.gradientAngle}deg, ${config.colorFrom}, ${config.colorTo})`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '50%',
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <svg
        className="absolute left-0 right-0"
        style={{ top: '38%', width: '100%', height: '24%' }}
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,100 C300,180 600,20 900,100 C1050,140 1150,80 1200,100 L1200,0 L0,0 Z"
          fill={config.colorFrom}
        />
      </svg>
      <div className="absolute top-0 left-0 right-0 flex flex-col justify-start items-center p-3 gap-0.5" style={{ height: '50%', justifyContent: 'center' }}>
        <Logo url={config.logoUrl} size={fs.logo} fallbackColor={config.resolvedTextColor} />
        <p style={headlineStyle(config, fs)} className="leading-tight text-center">
          {config.headline}
        </p>
        <p style={{ fontSize: fs.sub, color: config.resolvedTextColor }} className="opacity-80 text-center">
          {config.subline}
        </p>
        <div className="mt-1">
          <CTAButton config={config} small={fs.cta} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// P8: Side Panel
// ═══════════════════════════════════════════════════════════════
function PatternSidePanel({ width, height, config }: PatternProps) {
  const fs = fontSizes(width, height);
  const panelPct = `${config.splitRatio * 100}%`;

  return (
    <div className="relative flex w-full h-full overflow-hidden">
      <div
        className="flex flex-col justify-center items-center gap-0.5 p-2"
        style={{
          background: `linear-gradient(180deg, ${config.colorFrom}, ${config.colorTo})`,
          flex: `0 0 ${panelPct}`,
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
          <CTAButton config={config} small={fs.cta} />
        </div>
      </div>
      <div
        className="flex-1"
        style={{
          backgroundImage: `url(${config.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════════════
export default function BannerDesign({ pattern, width, height, config }: BannerDesignProps) {
  const resolved = getResolvedConfig(config);
  const props = { width, height, config: resolved };

  switch (pattern) {
    case 'P1':
      return <PatternSplit {...props} />;
    case 'P2':
      return <PatternDiagonal {...props} />;
    case 'P3':
      return <PatternCutout {...props} />;
    case 'P4':
      return <PatternBottomFade {...props} />;
    case 'P5':
      return <PatternMinimalGradient {...props} />;
    case 'P6':
      return <PatternDarkened {...props} />;
    case 'P7':
      return <PatternWave {...props} />;
    case 'P8':
      return <PatternSidePanel {...props} />;
    default:
      return null;
  }
}
