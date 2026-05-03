// scripts/update-all-passwords.ts
// Gunakan: PASSWORD_RESET=newpassword123 npx tsx scripts/update-all-passwords.ts
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

async function updateAllPasswords() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    const newPassword = process.env.PASSWORD_RESET || 'alifa123';
    
    console.log('Updating passwords for all users...');

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const result = await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE is_active = true
      RETURNING id, username, email, role
    `;

    console.log(`Done! ${result.length} users updated.`);
    console.log(`Use PASSWORD_RESET env variable to set a custom password.`);
    
  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exit(1);
  }
}

updateAllPasswords();