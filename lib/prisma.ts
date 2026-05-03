// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Helper to extract underlying connection string from Prisma Accelerate / local proxy
const getDirectUrl = (): string | undefined => {
  const urlStr = process.env.DATABASE_URL;
  if (urlStr?.startsWith('prisma+postgres://')) {
    try {
      const url = new URL(urlStr);
      const apiKey = url.searchParams.get('api_key');
      if (apiKey) {
        const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString());
        if (decoded.databaseUrl) {
          return decoded.databaseUrl;
        }
      }
    } catch {
      // Failed to parse proxy URL — use as-is
    }
  }
  return undefined;
};

const directUrl = getDirectUrl();

const datasources = directUrl
  ? { db: { url: directUrl } }
  : undefined;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma