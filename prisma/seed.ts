import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '../lib/generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.POSTGRES_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// Customer configurations
const CUSTOMERS = [
  {
    slug: 'hanako-koi',
    name: 'Hanako Koi',
    logo: '/logos/HanakoKoiLogo.svg',
    logoVariants: {
      dark: '/logos/HanakoKoiLogo-white.svg',
      light: '/logos/HanakoKoiLogo-black.svg',
    },
    colors: {
      dark: '#1a1a1a',
      light: '#ffffff',
      accent: '#c41e3a', // Koi red
    },
    fonts: {
      headline: { family: 'Inter', weight: 'bold', uppercase: false },
      body: { family: 'Inter', weight: 'normal' },
    },
    layout: {
      padding: { top: 60, right: 60, bottom: 60, left: 60 },
      gaps: { taglineToHeadline: 20, headlineToBody: 30, bodyToButton: 40 },
      button: { radius: 8, paddingX: 24, paddingY: 12 },
    },
    systemPrompt:
      'Japanese koi pond aesthetics, zen garden atmosphere, water reflections, elegant traditional style, serene nature scenes',
  },
  {
    slug: '1001frucht',
    name: '1001Frucht',
    logo: '/logos/1001frucht.svg',
    logoVariants: {
      dark: '/logos/1001frucht.svg',
      light: '/logos/1001frucht-black.svg',
    },
    colors: {
      dark: '#1a1a1a',
      light: '#ffffff',
      accent: '#f5a623', // Orange/fruit color
    },
    fonts: {
      headline: { family: 'Cera Pro', weight: 'bold', uppercase: false },
      body: { family: 'Cera Pro', weight: 'normal' },
    },
    layout: {
      padding: { top: 60, right: 60, bottom: 60, left: 60 },
      gaps: { taglineToHeadline: 20, headlineToBody: 30, bodyToButton: 40 },
      button: { radius: 8, paddingX: 24, paddingY: 12 },
    },
    systemPrompt:
      'Fresh fruits, natural ingredients, healthy lifestyle, vibrant colors, premium dried fruits, exotic spices, mediterranean feeling',
  },
  {
    slug: 'elforyn',
    name: 'elforyn',
    logo: '/logos/elforyn.svg',
    logoVariants: {
      dark: '/logos/elforyn.svg',
      light: '/logos/elforyn-black.svg',
    },
    colors: {
      dark: '#1a1a1a',
      light: '#ffffff',
      accent: '#2e7d32', // Green for sustainability
    },
    fonts: {
      headline: { family: 'Cera Pro', weight: 'bold', uppercase: true }, // UPPERCASE
      body: { family: 'Cera Pro', weight: 'normal' },
    },
    layout: {
      padding: { top: 60, right: 60, bottom: 60, left: 60 },
      gaps: { taglineToHeadline: 20, headlineToBody: 30, bodyToButton: 40 },
      button: { radius: 8, paddingX: 24, paddingY: 12 },
    },
    systemPrompt:
      'Sustainable materials, ivory alternative, eco-friendly luxury, natural textures, ethical craftsmanship, premium quality, musical instruments',
  },
  {
    slug: 'canton',
    name: 'Canton',
    logo: '/logos/canton.svg',
    logoVariants: {
      dark: '/logos/canton-white.svg',
      light: '/logos/canton-black.svg',
    },
    colors: {
      dark: '#1a1a1a',
      light: '#ffffff',
      accent: '#e63946', // Canton red
    },
    fonts: {
      headline: { family: 'Inter', weight: 'bold', uppercase: false },
      body: { family: 'Inter', weight: 'normal' },
    },
    layout: {
      padding: { top: 60, right: 60, bottom: 60, left: 60 },
      gaps: { taglineToHeadline: 20, headlineToBody: 30, bodyToButton: 40 },
      button: { radius: 8, paddingX: 24, paddingY: 12 },
    },
    systemPrompt:
      'High-end audio equipment, premium speakers, subwoofers, home cinema, living room ambiance, modern interior design, audiophile lifestyle',
  },
];

async function main() {
  console.log('Seeding customers...');

  // Use a system user ID for seeded profiles
  // In production, this would be linked to actual user accounts
  const systemUserId = 'system-seed-user';

  for (const customer of CUSTOMERS) {
    const existing = await prisma.profile.findUnique({
      where: { slug: customer.slug },
    });

    if (existing) {
      console.log(`Customer "${customer.name}" already exists, updating...`);
      await prisma.profile.update({
        where: { slug: customer.slug },
        data: {
          name: customer.name,
          logo: customer.logo,
          logoVariants: customer.logoVariants,
          colors: customer.colors,
          fonts: customer.fonts,
          layout: customer.layout,
          systemPrompt: customer.systemPrompt,
        },
      });
    } else {
      console.log(`Creating customer "${customer.name}"...`);
      await prisma.profile.create({
        data: {
          userId: systemUserId,
          slug: customer.slug,
          name: customer.name,
          logo: customer.logo,
          logoVariants: customer.logoVariants,
          colors: customer.colors,
          fonts: customer.fonts,
          layout: customer.layout,
          systemPrompt: customer.systemPrompt,
        },
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
