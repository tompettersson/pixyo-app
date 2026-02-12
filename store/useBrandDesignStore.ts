import { create } from 'zustand';
import { temporal } from 'zundo';
import type { DesignTokens, DeepPartial } from '@/types/designTokens';
import type { Customer } from '@/types/customer';
import { DEFAULT_DESIGN_TOKENS } from '@/lib/brand-design/defaults';
import { migrateFromProfile } from '@/lib/brand-design/migrate-from-profile';

// ─── Deep merge utility ───────────────────────────────────────

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function deepMerge<T extends Record<string, unknown>>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (sourceVal === undefined) continue;

    if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
      (result as Record<string, unknown>)[key as string] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as DeepPartial<Record<string, unknown>>
      );
    } else {
      (result as Record<string, unknown>)[key as string] = sourceVal;
    }
  }
  return result;
}

// ─── Store types ──────────────────────────────────────────────

type PreviewTab = 'moodboard' | 'guidelines' | 'page-preview';

interface BrandDesignState {
  tokens: DesignTokens;
  profileId: string | null;
  profileName: string | null;
  isDirty: boolean;
  isSaving: boolean;
  activePreviewTab: PreviewTab;

  // Actions
  updateTokens: (partial: DeepPartial<DesignTokens>) => void;
  setTokens: (tokens: DesignTokens) => void;
  setPreviewTab: (tab: PreviewTab) => void;
  loadFromProfile: (profile: Customer & { designTokens?: DesignTokens | null }) => void;
  resetToDefaults: () => void;
  markSaved: () => void;
  setIsSaving: (v: boolean) => void;
}

// ─── Token-only equality check for undo history ───────────────

function tokensEqual(a: BrandDesignState, b: BrandDesignState): boolean {
  return JSON.stringify(a.tokens) === JSON.stringify(b.tokens);
}

// ─── Store ────────────────────────────────────────────────────

export const useBrandDesignStore = create<BrandDesignState>()(
  temporal(
    (set, get) => ({
      tokens: DEFAULT_DESIGN_TOKENS,
      profileId: null,
      profileName: null,
      isDirty: false,
      isSaving: false,
      activePreviewTab: 'moodboard' as PreviewTab,

      updateTokens: (partial) =>
        set((state) => ({
          tokens: deepMerge(
            state.tokens as unknown as Record<string, unknown>,
            partial as unknown as DeepPartial<Record<string, unknown>>
          ) as unknown as DesignTokens,
          isDirty: true,
        })),

      setTokens: (tokens) =>
        set({ tokens, isDirty: true }),

      setPreviewTab: (tab) =>
        set({ activePreviewTab: tab }),

      loadFromProfile: (profile) => {
        const tokens = profile.designTokens
          ? (profile.designTokens as DesignTokens)
          : migrateFromProfile(profile);

        set({
          tokens,
          profileId: profile.id,
          profileName: profile.name,
          isDirty: false,
        });
      },

      resetToDefaults: () =>
        set({
          tokens: DEFAULT_DESIGN_TOKENS,
          isDirty: true,
        }),

      markSaved: () =>
        set({ isDirty: false, isSaving: false }),

      setIsSaving: (v) =>
        set({ isSaving: v }),
    }),
    {
      limit: 50,
      equality: tokensEqual,
    }
  )
);
