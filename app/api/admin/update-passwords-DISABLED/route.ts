// app/api/admin/update-passwords/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  return await updatePasswords();
}

// Tambahkan GET method untuk testing mudah
export async function GET(req: NextRequest) {
  return await updatePasswords();
}

async function updatePasswords() {
  try {
    console.log('🔐 Updating passwords for all users...');

    // Hash password yang sama untuk semua user
    const hashedPassword = await bcrypt.hash('alifa123', 12);

    // Untuk Neon, kita perlu menjalankan query satu per satu
    // Pertama, ambil semua user aktif
    const users = await sql`
      SELECT id, username, email, role 
      FROM users 
      WHERE is_active = true
    `;

    console.log(`📝 Found ${users.length} active users to update`);

    // Update setiap user satu per satu
    const updatedUsers = [];
    for (const user of users) {
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}
        WHERE id = ${user.id}
      `;
      updatedUsers.push({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      console.log(`✅ Updated password for ${user.username}`);
    }

    return NextResponse.json({
      success: true,
      message: 'All passwords updated to: alifa123',
      updatedUsers: updatedUsers,
      totalUpdated: updatedUsers.length
    });

  } catch (error: any) {
    console.error('Error updating passwords:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update passwords',
        details: error.message 
      },
      { status: 500 }
    );
  }
}