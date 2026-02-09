// Banner format definitions and categories

export type PatternId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7';

export interface BannerFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'leaderboard' | 'rectangle' | 'skyscraper' | 'social';
  badge?: string;
}

export const BANNERS: BannerFormat[] = [
  // Leaderboard
  { id: 'B-01', name: 'Leaderboard', width: 728, height: 90, category: 'leaderboard', badge: 'GDN Top 5' },
  { id: 'B-02', name: 'Large Leaderboard', width: 970, height: 90, category: 'leaderboard' },
  { id: 'B-03', name: 'Full Banner', width: 468, height: 60, category: 'leaderboard', badge: 'Legacy' },
  { id: 'B-04', name: 'Mobile Leaderboard', width: 320, height: 50, category: 'leaderboard', badge: 'Mobile' },
  { id: 'B-05', name: 'Large Mobile Banner', width: 320, height: 100, category: 'leaderboard', badge: 'Mobile' },
  // Rectangle
  { id: 'B-06', name: 'Medium Rectangle', width: 300, height: 250, category: 'rectangle', badge: '#1 Beliebtestes' },
  { id: 'B-07', name: 'Large Rectangle', width: 336, height: 280, category: 'rectangle' },
  { id: 'B-08', name: 'Square', width: 250, height: 250, category: 'rectangle' },
  { id: 'B-09', name: 'Small Square', width: 200, height: 200, category: 'rectangle' },
  // Skyscraper
  { id: 'B-10', name: 'Wide Skyscraper', width: 160, height: 600, category: 'skyscraper', badge: 'GDN Top 5' },
  { id: 'B-11', name: 'Skyscraper', width: 120, height: 600, category: 'skyscraper' },
  { id: 'B-12', name: 'Half-Page', width: 300, height: 600, category: 'skyscraper', badge: 'Premium' },
  // Social
  { id: 'B-13', name: 'Instagram Post', width: 1080, height: 1080, category: 'social', badge: '1:1' },
  { id: 'B-14', name: 'Instagram Feed', width: 1080, height: 1350, category: 'social', badge: '4:5' },
  { id: 'B-15', name: 'Story / Reels', width: 1080, height: 1920, category: 'social', badge: '9:16' },
  { id: 'B-16', name: 'YouTube / LinkedIn', width: 1920, height: 1080, category: 'social', badge: '16:9' },
];

export interface CategoryDef {
  key: BannerFormat['category'];
  title: string;
  subtitle: string;
  icon: string; // SVG path for icon
}

export const CATEGORIES: CategoryDef[] = [
  {
    key: 'leaderboard',
    title: 'Leaderboard',
    subtitle: 'Horizontale Banner — Website-Header, Top-of-Page',
    icon: 'M2,8 h20 v8 H2 Z', // horizontal rect
  },
  {
    key: 'rectangle',
    title: 'Rectangle',
    subtitle: 'Inline / Sidebar — Vielseitigste Formate',
    icon: 'M4,3 h16 v18 H4 Z', // vertical rect
  },
  {
    key: 'skyscraper',
    title: 'Skyscraper',
    subtitle: 'Vertikale Banner — Sidebar-Werbung',
    icon: 'M7,2 h10 v20 H7 Z', // tall rect
  },
  {
    key: 'social',
    title: 'Social Media',
    subtitle: 'Instagram, YouTube, LinkedIn — Alle gängigen Formate',
    icon: 'M3,3 h18 v18 H3 Z M12,8 a4,4 0 1,1 0,8 a4,4 0 1,1 0,-8', // square + circle
  },
];

/**
 * Calculate display scale for a banner to fit within max card dimensions.
 */
export function getScale(width: number, height: number, maxW: number, maxH: number): number {
  const scaleW = Math.min(maxW / width, 1);
  const scaleH = Math.min(maxH / height, 1);
  return Math.min(scaleW, scaleH);
}
