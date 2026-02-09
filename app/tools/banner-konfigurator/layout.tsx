import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Banner-Konfigurator | Pixyo',
  description: '16 Banner-Formate, 7 Design-Patterns — Live konfigurieren und exportieren.',
};

export default function BannerKonfiguratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
