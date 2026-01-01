// lib/db.ts
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

console.log('🔧 Database configuration using Prisma Client...');

// Wrapper function to handle both tagged template literals and regular function calls
export async function sql(strings: any, ...values: any[]) {
  try {
    if (typeof strings === 'string') {
      // Called as a regular function: sql(query, params)
      const params = (values.length === 1 && Array.isArray(values[0])) ? values[0] : values;
      return await prisma.$queryRawUnsafe(strings, ...params);
    }

    // Called as a tagged template: sql`SELECT...`
    // Ensure we pass the arguments in a way Prisma Client expects
    if (strings && Array.isArray(strings) && 'raw' in strings) {
      return await (prisma.$queryRaw as any)(strings, ...values);
    }

    // Fallback/Safety check
    return await prisma.$queryRawUnsafe(strings as string, ...values);
  } catch (error: any) {
    // Safe error logging
    const errorMessage = error?.message || 'Unknown database error';

    // Log the query causing the error safely
    if (process.env.NODE_ENV !== 'production' || typeof strings === 'string') {
      console.error('❌ Database Query Error:', errorMessage);
      console.error('   Query:', typeof strings === 'string' ? strings : (strings as any)?.raw || 'Template Literal Query');
      if (Array.isArray(values) && values.length > 0) {
        console.error('   Values:', JSON.stringify(values));
      }
    } else {
      console.error('❌ Database Query Error:', errorMessage);
    }

    if (process.env.NODE_ENV !== 'production') {
      try {
        console.error('   Query Info:', {
          type: typeof strings,
          isTemplate: (strings && Array.isArray(strings) && 'raw' in strings),
          valuesCount: values?.length || 0
        });
      } catch (logError) {
        console.error('   Failed to log query info');
      }
    }
    throw error;
  }
}

export async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

export async function queryWithErrorHandling(query: TemplateStringsArray, ...params: any[]) {
  return await sql(query, ...params);
}