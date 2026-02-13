'use client';

/**
 * Hand-drawn SVG signature for Moritz Jung.
 * Mimics a real pen signature with varying stroke width and natural flow.
 */
export function MoritzJungSignature({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Unterschrift Moritz Jung"
    >
      {/* "M" - bold entry stroke */}
      <path
        d="M12 68 C12 68 14 28 16 24 C18 20 20 22 21 30 C22 38 26 58 28 62 C30 66 32 60 34 48 C36 36 38 26 40 22 C42 18 44 20 44 28 C44 36 44 56 44 64"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* "o" */}
      <path
        d="M50 46 C48 40 50 34 56 34 C62 34 64 40 62 46 C60 52 54 54 50 50"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* "r" */}
      <path
        d="M66 52 C66 52 66 36 66 34 C66 32 70 30 74 32"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* "i" */}
      <path
        d="M78 52 L78 36"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="78" cy="28" r="1.5" fill="currentColor" />
      {/* "t" */}
      <path
        d="M84 26 L84 52 C84 54 86 55 88 54"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 34 L90 34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* "z" with tail */}
      <path
        d="M94 36 L104 36 L92 52 L104 52 C104 52 102 58 98 62"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gap between first and last name */}

      {/* "J" - sweeping capital */}
      <path
        d="M128 22 C128 22 132 20 134 22 C136 24 136 28 136 42 C136 56 136 64 130 68 C124 72 118 68 118 64"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* J crossbar flourish */}
      <path
        d="M124 22 L144 22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* "u" */}
      <path
        d="M148 36 C148 36 148 48 150 52 C152 56 156 56 158 52 L158 36"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* "n" */}
      <path
        d="M162 52 L162 36 C162 36 164 32 168 32 C172 32 174 36 174 40 L174 52"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* "g" with descender */}
      <path
        d="M180 36 C178 34 180 32 184 32 C188 32 190 36 188 42 C186 48 182 50 180 48 L190 48 C190 48 192 56 188 64 C184 72 178 70 178 66"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Underline flourish — sweeping line under the signature */}
      <path
        d="M16 74 C40 72 100 68 140 70 C180 72 200 76 220 72"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
