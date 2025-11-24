// scripts/update-all-passwords.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Juga load dari .env jika ada
config({ path: resolve(process.cwd(), '.env') });

import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

async function updateAllPasswords() {
  try {
    console.log('🔐 Updating passwords for all users...');
    console.log('Database URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    // Hash password yang sama untuk semua user
    const hashedPassword = await bcrypt.hash('password123', 12);
    console.log('✅ Password hashed');

    // Update semua user dengan password yang sama
    const result = await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE is_active = true
      RETURNING id, username, email, role
    `;

    console.log('✅ Passwords updated for all users:');
    console.table(result);
    console.log(`🎉 ${result.length} users updated with password: password123`);
    
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    process.exit(1);
  }
}

updateAllPasswords();