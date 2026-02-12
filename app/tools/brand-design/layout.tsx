import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Design | Pixyo',
  description: 'Vollständiges Design-System aus deinen Brand-Farben — Typografie, Spacing, Components, Export.',
};

export default function BrandDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
