import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Customer } from '@/types/customer';
import type { PatternId } from '@/lib/banner/formats';
import type { DesignTokens } from '@/types/designTokens';
import { getContrastColorForGradient } from '@/lib/banner/colorUtils';

export interface BannerConfig {
  activePattern: PatternId;

  // Colors
  colorFrom: string;
  colorTo: string;
  accentColor: string;
  textColor: 'white' | 'dark' | 'auto';

  // Typography
  headlineFont: string;
  headlineWeight: string;
  headlineUppercase: boolean;
  ctaStyle: 'pill' | 'rounded' | 'square';
  ctaUppercase: boolean;

  // Content
  headline: string;
  subline: string;
  ctaText: string;
  logoUrl: string | null;

  // Design
  gradientAngle: number;
  overlayStrength: number;
  showDecoElements: boolean;
  splitRatio: number;

  // Background
  bgImageUrl: string;
}

interface BannerConfigState extends BannerConfig {
  profileId: string | null;
  designTokens: DesignTokens | null;

  // Single updater — replaces all individual setters
  updateConfig: (partial: Partial<BannerConfig>) => void;
  loadFromProfile: (profile: Customer) => void;
}

// ─── Resolve text color based on gradient luminance ──────────
function resolveTextColor(mode: 'white' | 'dark' | 'auto', colorFrom: string, colorTo: string): string {
  if (mode === 'white') return '#ffffff';
  if (mode === 'dark') return '#1a1a1a';
  // Auto: average luminance of both gradient stops
  return getContrastColorForGradient(colorFrom, colorTo);
}

export function getResolvedConfig(state: BannerConfig): BannerConfig & { resolvedTextColor: string } {
  return {
    ...state,
    resolvedTextColor: resolveTextColor(state.textColor, state.colorFrom, state.colorTo),
  };
}

// ─── Background image presets ──────────────────────────────────
const BG_IMAGES = {
  city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80&auto=format',
  nature: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80&auto=format',
  abstract: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80&auto=format',
};

export const BG_IMAGE_OPTIONS = [
  { label: 'Stadt', url: BG_IMAGES.city, thumb: BG_IMAGES.city.replace('w=1200', 'w=120') },
  { label: 'Natur', url: BG_IMAGES.nature, thumb: BG_IMAGES.nature.replace('w=1200', 'w=120') },
  { label: 'Abstrakt', url: BG_IMAGES.abstract, thumb: BG_IMAGES.abstract.replace('w=1200', 'w=120') },
];

const DEFAULT_CONFIG: BannerConfig = {
  activePattern: 'P1',
  colorFrom: '#7c3aed',
  colorTo: '#4f46e5',
  accentColor: '#ffffff',
  textColor: 'white',
  headlineFont: 'Inter',
  headlineWeight: '700',
  headlineUppercase: false,
  ctaStyle: 'pill',
  ctaUppercase: true,
  headline: 'Smarter arbeiten.',
  subline: 'KI-Tools für dein Team',
  ctaText: 'Jetzt starten',
  logoUrl: null,
  gradientAngle: 135,
  overlayStrength: 0.5,
  showDecoElements: true,
  splitRatio: 0.45,
  bgImageUrl: BG_IMAGES.city,
};

export const useBannerConfigStore = create<BannerConfigState>()(
  temporal(
    (set) => ({
      ...DEFAULT_CONFIG,
      profileId: null,
      designTokens: null,

      updateConfig: (partial) => set(partial),

      loadFromProfile: (profile: Customer) => {
        const dt = profile.designTokens;
        if (dt && typeof dt === 'object') {
          // Use design tokens (new system)
          const radius = parseInt(dt.borders?.radius?.default || '8');
          set({
            profileId: profile.id,
            designTokens: dt as DesignTokens,
            logoUrl: dt.media?.logoVariants?.primary || profile.logo || null,
            colorFrom: dt.colors?.semantic?.primary || profile.colors.dark,
            colorTo: dt.colors?.semantic?.secondary || profile.colors.light,
            accentColor: dt.colors?.semantic?.accent || profile.colors.accent,
            headlineFont: dt.typography?.fonts?.heading?.family || profile.fonts.headline.family,
            headlineWeight: String(dt.typography?.fontWeights?.bold ?? profile.fonts.headline.weight ?? '700'),
            headlineUppercase: dt.typography?.headingUppercase ?? profile.fonts.headline.uppercase ?? false,
            ctaStyle: radius >= 999 ? 'pill' : radius >= 8 ? 'rounded' : 'square',
          });
        } else {
          // Legacy profile fields
          set({
            profileId: profile.id,
            designTokens: null,
            logoUrl: profile.logo || null,
            colorFrom: profile.colors.dark,
            colorTo: profile.colors.light,
            accentColor: profile.colors.accent,
            headlineFont: profile.fonts.headline.family,
            headlineWeight: profile.fonts.headline.weight || '700',
            headlineUppercase: profile.fonts.headline.uppercase ?? false,
            ctaStyle:
              profile.layout.button.radius >= 999
                ? 'pill'
                : profile.layout.button.radius >= 8
                  ? 'rounded'
                  : 'square',
          });
        }
      },
    }),
    {
      limit: 50,
      // Only track BannerConfig fields, not actions
      equality: (pastState, currentState) => {
        const keys: (keyof BannerConfig)[] = [
          'activePattern', 'colorFrom', 'colorTo', 'accentColor', 'textColor',
          'headlineFont', 'headlineWeight', 'headlineUppercase', 'ctaStyle', 'ctaUppercase',
          'headline', 'subline', 'ctaText', 'logoUrl', 'gradientAngle',
          'overlayStrength', 'showDecoElements', 'splitRatio', 'bgImageUrl',
        ];
        return keys.every((k) => pastState[k] === currentState[k]);
      },
    }
  )
);
