export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    // Ambil mata kuliah yang tersedia dari tabel courses
    const mataKuliah = await sql`
      SELECT 
        c.id,
        c.code,
        c.name,
        c.credits as sks,
        c.semester,
        c.is_active,
        c.curriculum_id
      FROM courses c
      WHERE c.is_active = true
      ORDER BY c.semester, c.code
    `;

    return NextResponse.json({
      success: true,
      data: mataKuliah
    });
  } catch (error) {
    console.error('Error API Mata Kuliah:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil data mata kuliah'
    }, { status: 500 });
  }
}
