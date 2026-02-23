/**
 * Seed scene presets for existing customer profiles.
 * Canton & Portobello stay null (use defaults: interior design + room).
 * Other customers get industry-specific presets.
 *
 * Run: npx tsx scripts/seed-scene-presets.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../lib/generated/prisma/client.js';

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('POSTGRES_URL not set');
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

interface ScenePreset {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

interface SceneCategory {
  id: string;
  label: string;
  presets: ScenePreset[];
}

interface SceneConfig {
  categories: SceneCategory[];
}

// Customer-specific scene configs keyed by slug
const CUSTOMER_PRESETS: Record<string, SceneConfig> = {
  'hanako-koi': {
    categories: [
      {
        id: 'environment',
        label: 'Umgebung',
        presets: [
          { id: 'none', label: 'Keiner', icon: '○', prompt: '' },
          { id: 'pond', label: 'Teich', icon: '🏞️', prompt: 'next to a tranquil koi pond with clear water, aquatic plants, and lily pads' },
          { id: 'garden', label: 'Garten', icon: '🌳', prompt: 'in a lush Japanese-inspired garden with mossy stones, bamboo, and lanterns' },
          { id: 'zen', label: 'Zen-Garten', icon: '⛩️', prompt: 'in a minimalist zen garden with raked gravel, bonsai trees, and stone arrangements' },
          { id: 'stone', label: 'Naturstein', icon: '🪨', prompt: 'on natural stone slabs near a waterfall feature with tropical plants' },
          { id: 'terrace', label: 'Terrasse', icon: '☀️', prompt: 'on a sunny wooden terrace overlooking a garden pond' },
          { id: 'wintergarden', label: 'Wintergarten', icon: '🌿', prompt: 'in a bright conservatory with tropical plants and a water feature' },
        ],
      },
    ],
  },
  '1001frucht': {
    categories: [
      {
        id: 'environment',
        label: 'Umgebung',
        presets: [
          { id: 'none', label: 'Keiner', icon: '○', prompt: '' },
          { id: 'market', label: 'Marktstand', icon: '🏪', prompt: 'at a colorful Mediterranean market stall with fresh produce and warm sunlight' },
          { id: 'kitchen', label: 'Küche', icon: '🍳', prompt: 'in a bright, rustic kitchen with wooden countertops and fresh herbs' },
          { id: 'breakfast', label: 'Frühstückstisch', icon: '🥐', prompt: 'on a beautifully set breakfast table with fresh pastries, juice, and morning light' },
          { id: 'buffet', label: 'Buffet', icon: '🍽️', prompt: 'on an elegant buffet table with decorative platters and artisan tableware' },
          { id: 'picnic', label: 'Picknick', icon: '🧺', prompt: 'on a cozy picnic blanket in a sunny meadow with wicker baskets' },
          { id: 'spicerack', label: 'Gewürzregal', icon: '🫙', prompt: 'on a rustic wooden shelf surrounded by glass jars of dried spices and herbs' },
        ],
      },
    ],
  },
  'elforyn': {
    categories: [
      {
        id: 'environment',
        label: 'Umgebung',
        presets: [
          { id: 'none', label: 'Keiner', icon: '○', prompt: '' },
          { id: 'concert', label: 'Konzertsaal', icon: '🎵', prompt: 'in an elegant concert hall with warm stage lighting and velvet seating' },
          { id: 'workshop', label: 'Werkstatt', icon: '🔧', prompt: 'in a craftsman workshop with wooden workbenches, tools, and soft natural light' },
          { id: 'studio', label: 'Studio', icon: '🎙️', prompt: 'in a professional recording studio with acoustic panels and warm ambient light' },
          { id: 'stage', label: 'Bühne', icon: '🎭', prompt: 'on a theatrical stage with dramatic spotlight and dark background' },
          { id: 'musicroom', label: 'Musikzimmer', icon: '🎹', prompt: 'in an intimate music room with vintage instruments and warm wood tones' },
        ],
      },
      {
        id: 'style',
        label: 'Stil',
        presets: [
          { id: 'none', label: 'Keiner', icon: '○', prompt: '' },
          { id: 'classical', label: 'Klassisch', icon: '🎻', prompt: 'classical elegance with rich wood tones, ornate details, and warm amber lighting' },
          { id: 'modern', label: 'Modern', icon: '⚡', prompt: 'sleek modern design with clean lines, brushed metal, and cool LED lighting' },
          { id: 'vintage', label: 'Vintage', icon: '📻', prompt: 'vintage atmosphere with warm sepia tones, aged textures, and nostalgic charm' },
          { id: 'minimal', label: 'Minimalistisch', icon: '○', prompt: 'minimalist composition with clean white space, single focal point, and subtle shadows' },
        ],
      },
    ],
  },
  'joqora': {
    categories: [
      {
        id: 'style',
        label: 'Stil',
        presets: [
          { id: 'none', label: 'Keiner', icon: '○', prompt: '' },
          { id: 'minimal', label: 'Minimalistisch', icon: '○', prompt: 'minimalist product photography with clean white space, precise shadows, and geometric simplicity' },
          { id: 'technical', label: 'Technisch', icon: '⚙️', prompt: 'technical product visualization with precise lighting, detailed textures, and engineering aesthetics' },
          { id: 'editorial', label: 'Editorial', icon: '📰', prompt: 'editorial product photography with dramatic lighting, artistic composition, and magazine-quality styling' },
          { id: 'lifestyle', label: 'Lifestyle', icon: '🏠', prompt: 'lifestyle product placement in a modern home environment with natural light and warm ambiance' },
          { id: 'architectural', label: 'Architektonisch', icon: '🏛️', prompt: 'architectural context with concrete, glass, and steel elements, emphasizing structural beauty' },
        ],
      },
    ],
  },
  'abschliff': {
    categories: [
      {
        id: 'surface',
        label: 'Oberfläche',
        presets: [
          { id: 'none', label: 'Keiner', icon: '○', prompt: '' },
          { id: 'hardwood', label: 'Holzboden', icon: '🪵', prompt: 'on a beautifully refinished hardwood floor with visible grain patterns and warm golden tones' },
          { id: 'stone', label: 'Steinoberfläche', icon: '🪨', prompt: 'on a polished natural stone surface with subtle veining and professional finish' },
          { id: 'parquet', label: 'Parkett', icon: '🏠', prompt: 'on classic herringbone parquet flooring with rich wood tones in an elegant room' },
          { id: 'terrace', label: 'Terrasse', icon: '☀️', prompt: 'on a sun-drenched outdoor terrace with treated wood decking and modern furniture' },
          { id: 'tiles', label: 'Fliesen', icon: '🔲', prompt: 'on large-format ceramic tiles with clean grout lines in a modern bathroom or kitchen' },
          { id: 'concrete', label: 'Beton', icon: '🧱', prompt: 'on polished concrete flooring with industrial loft aesthetic and natural light' },
        ],
      },
    ],
  },
};

async function main() {
  const profiles = await prisma.profile.findMany({
    select: { id: true, slug: true, name: true, sceneConfig: true },
  });

  console.log(`Found ${profiles.length} profiles:`);

  for (const profile of profiles) {
    const config = CUSTOMER_PRESETS[profile.slug];
    if (config) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { sceneConfig: config as unknown as import('../lib/generated/prisma/client.js').Prisma.InputJsonObject },
      });
      console.log(`  [updated] ${profile.name} (${profile.slug}) — ${config.categories.length} category/ies`);
    } else {
      console.log(`  [skip]    ${profile.name} (${profile.slug}) — using defaults`);
    }
  }

  console.log('\nDone.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
