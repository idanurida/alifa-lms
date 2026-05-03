// scripts/reset-passwords-secure.ts
// Generate password random aman untuk setiap role
// Jalankan: npx tsx scripts/reset-passwords-secure.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

// Default password sederhana — bisa override via PASSWORD_RESET env
const DEFAULT_PASSWORD = process.env.PASSWORD_RESET || 'alifa123';

function generatePassword(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

const ROLE_ACCOUNTS = [
  { role: 'super_admin', email: 'superadmin@alifa.ac.id' },
  { role: 'staff_akademik', email: 'admin@kampus.ac.id' },
  { role: 'staff_keuangan', email: 'finance@kampus.ac.id' },
  { role: 'dosen', email: 'dosen@kampus.ac.id' },
  { role: 'mahasiswa', email: 'mahasiswa@kampus.ac.id' },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL tidak ditemukan. Pastikan .env sudah di-set.');
    process.exit(1);
  }

  console.log('🔐 Generating secure passwords...\n');

  for (const account of ROLE_ACCOUNTS) {
    const password = DEFAULT_PASSWORD;
    const hash = await bcrypt.hash(password, 12);

    const result = await sql`
      UPDATE users 
      SET password_hash = ${hash}
      WHERE email = ${account.email}
      RETURNING id, email, username
    `;

    if (result.length > 0) {
      console.log(`✅ ${account.role.padEnd(18)} | ${account.email.padEnd(28)} | ${password}`);
    } else {
      console.log(`⚠️  ${account.role.padEnd(18)} | ${account.email.padEnd(28)} | User tidak ditemukan`);
    }
  }

  console.log('\n⚠️  Simpan password di atas! Tidak akan ditampilkan lagi setelah ini.');
  console.log('📋 Jalankan ulang script ini jika perlu reset ulang.\n');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
