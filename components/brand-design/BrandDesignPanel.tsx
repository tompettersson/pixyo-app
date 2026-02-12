'use client';

import React from 'react';
import ProfileSwitcher from './ProfileSwitcher';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import ColorsSection from './sections/ColorsSection';
import TypographySection from './sections/TypographySection';
import SpacingSection from './sections/SpacingSection';
import BordersSection from './sections/BordersSection';
import ShadowsSection from './sections/ShadowsSection';
import ComponentsSection from './sections/ComponentsSection';
import MediaSection from './sections/MediaSection';
import VoiceSection from './sections/VoiceSection';
import ExportPanel from './ExportPanel';

export default function BrandDesignPanel() {
  return (
    <div className="w-full">
      <div className="p-4 space-y-5">
        {/* ═══ Profile Switcher ═══ */}
        <ProfileSwitcher />

        <div className="border-t border-zinc-800" />

        {/* ═══ Colors (default open) ═══ */}
        <CollapsibleSection title="Farben" defaultOpen>
          <ColorsSection />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ Typography ═══ */}
        <CollapsibleSection title="Typografie">
          <TypographySection />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ Spacing ═══ */}
        <CollapsibleSection title="Spacing">
          <SpacingSection />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ Borders ═══ */}
        <CollapsibleSection title="Borders & Radius">
          <BordersSection />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ Shadows ═══ */}
        <CollapsibleSection title="Schatten">
          <ShadowsSection />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ Components ═══ */}
        <CollapsibleSection title="Components">
          <ComponentsSection />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ Media ═══ */}
        <CollapsibleSection title="Media & Logos">
          <MediaSection />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ Voice ═══ */}
        <CollapsibleSection title="Brand Voice">
          <VoiceSection />
        </CollapsibleSection>

        <div className="border-t border-zinc-800" />

        {/* ═══ Export ═══ */}
        <ExportPanel />
      </div>
    </div>
  );
}
