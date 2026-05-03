// lib/db.ts
// Database query wrapper — gunakan Prisma typed SQL dengan aman
// Semua query menggunakan parameterized placeholder ($1, $2, ...) untuk cegah SQL injection
import { prisma } from '@/lib/prisma';

/**
 * Execute parameterized SQL query.
 * 
 * Dua cara pemanggilan:
 * 1. Tagged template (recommended):  await sql`SELECT * FROM users WHERE id = ${id}`
 * 2. Parameterized string:           await sql('SELECT * FROM users WHERE id = $1', [id])
 * 
 * AVOID string concatenation — selalu gunakan parameter placeholder!
 */
export async function sql<T = unknown>(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): Promise<T[]> {
  try {
    // Tagged template literal: sql`SELECT * FROM users WHERE id = ${id}`
    if (Array.isArray(strings) && 'raw' in strings) {
      return (await prisma.$queryRaw(strings, ...values)) as T[];
    }

    // Parameterized string query: sql('SELECT * FROM users WHERE id = $1', [id])
    if (typeof strings === 'string') {
      const params = (values.length === 1 && Array.isArray(values[0])) ? values[0] : values;

      // Validasi: pastikan jumlah $N placeholder cocok dengan params
      const placeholderCount = (strings.match(/\$\d+/g) || []).length;
      if (placeholderCount !== params.length) {
        throw new Error(
          `Query placeholder mismatch: ${placeholderCount} placeholders but ${params.length} params provided`
        );
      }

      return (await prisma.$queryRawUnsafe(strings, ...params)) as T[];
    }

    throw new Error('Invalid query format: must be tagged template or parameterized string');
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Database Query Error:', (error as Error)?.message);
    }
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
