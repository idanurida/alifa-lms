// lib/db.ts
import { neon } from '@neondatabase/serverless';

// Debug information
console.log('🔧 Database configuration loading...');

// Get connection string dengan validasi
const getConnectionString = (): string => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    const errorMessage = `
🚨 DATABASE_URL environment variable is required!

Please check:
1. File .env.local exists in root directory
2. DATABASE_URL is defined in .env.local
3. Server has been restarted after adding DATABASE_URL

Example .env.local content:
DATABASE_URL=postgresql://username:password@localhost:5432/alifa_lms
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
`;
    console.error(errorMessage);
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Validasi format connection string
  if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
    console.error('❌ Invalid DATABASE_URL format. Should start with postgresql:// or postgres://');
    console.error('Current DATABASE_URL:', connectionString.substring(0, 50) + '...');
    throw new Error('Invalid DATABASE_URL format');
  }

  console.log('✅ DATABASE_URL is set and valid');
  return connectionString;
};

const connectionString = getConnectionString();

// PERBAIKAN: Tambah configuration untuk handle connection timeout
export const sql = neon(connectionString, {
  // Tambah configuration untuk prevent timeout
  fetchOptions: {
    // Timeout untuk fetch request (10 detik)
    timeout: 10000,
  },
});

// PERBAIKAN: Export function untuk test connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// PERBAIKAN: Export function dengan error handling
export async function queryWithErrorHandling(query: TemplateStringsArray, ...params: any[]) {
  try {
    const result = await sql(query, ...params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}