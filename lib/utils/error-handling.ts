// lib/utils/error-handling.ts
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleDatabaseError(error: any): never {
  console.error('Database Error:', error);

  if (error.code === '42P01') {
    // relation does not exist
    throw new DatabaseError('Table tidak ditemukan. Silakan jalankan migrasi database.', error.code);
  } else if (error.code === '42883') {
    // operator does not exist
    throw new DatabaseError('Error tipe data. Periksa query database.', error.code);
  } else if (error.code === '23505') {
    // unique violation
    throw new DatabaseError('Data sudah ada dalam sistem.', error.code);
  } else if (error.message?.includes('timeout')) {
    throw new DatabaseError('Koneksi database timeout. Silakan coba lagi.');
  } else if (error.message?.includes('fetch failed')) {
    throw new DatabaseError('Tidak dapat terhubung ke database. Periksa koneksi internet.');
  }

  throw new DatabaseError('Terjadi kesalahan database. Silakan coba lagi.');
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (fallback !== undefined) {
      console.warn('Operation failed, using fallback:', error);
      return fallback;
    }
    handleDatabaseError(error);
  }
}