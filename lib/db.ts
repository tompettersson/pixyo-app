import { PrismaClient } from './generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// Create Prisma Neon adapter (Prisma 7 API)
const connectionString = process.env.POSTGRES_URL!;
const adapter = new PrismaNeon({ connectionString });

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


