'use client';

/**
 * Decorative SVG pattern elements for the landing page.
 * Subtle, geometric patterns following the Bauhaus aesthetic.
 */

/** Dot grid pattern — subtle background texture */
export function DotGridPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="white" fillOpacity="0.06" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
    </svg>
  );
}

/** Diagonal lines pattern */
export function DiagonalLinesPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="diagonal-lines"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
    </svg>
  );
}

/** Cross-hatch pattern — for accent areas */
export function CrossHatchPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="cross-hatch" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 12h24M12 0v24" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cross-hatch)" />
    </svg>
  );
}

/** Geometric corner accent — abstract Bauhaus triangle */
export function GeometricAccent({ className = '', position = 'top-right' }: { className?: string; position?: 'top-right' | 'bottom-left' }) {
  const isTopRight = position === 'top-right';
  return (
    <div className={`absolute ${isTopRight ? '-top-8 -right-8' : '-bottom-8 -left-8'} ${className} pointer-events-none`}>
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isTopRight ? (
          <>
            <line x1="0" y1="0" x2="200" y2="200" stroke="white" strokeOpacity="0.04" strokeWidth="1" />
            <line x1="40" y1="0" x2="200" y2="160" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
            <line x1="80" y1="0" x2="200" y2="120" stroke="white" strokeOpacity="0.02" strokeWidth="1" />
            <circle cx="180" cy="20" r="3" fill="#E8710A" fillOpacity="0.08" />
          </>
        ) : (
          <>
            <line x1="200" y1="200" x2="0" y2="0" stroke="white" strokeOpacity="0.04" strokeWidth="1" />
            <line x1="160" y1="200" x2="0" y2="40" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
            <line x1="120" y1="200" x2="0" y2="80" stroke="white" strokeOpacity="0.02" strokeWidth="1" />
            <circle cx="20" cy="180" r="3" fill="#E8710A" fillOpacity="0.08" />
          </>
        )}
      </svg>
    </div>
  );
}
