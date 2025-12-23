export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'mahasiswa') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    // Ambil profil mahasiswa dari tabel students
    const mahasiswa = await sql`
      SELECT 
        s.id,
        s.name,
        s.nim,
        s.current_semester,
        s.total_credits,
        sp.name as program_studi
      FROM students s
      LEFT JOIN study_programs sp ON s.study_program_id = sp.id
      WHERE s.user_id = ${session.user.id}
    `;

    if (!mahasiswa || mahasiswa.length === 0) {
      return NextResponse.json({ error: 'Profil mahasiswa tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: mahasiswa[0]
    });
  } catch (error) {
    console.error('Error API Profil Mahasiswa:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil profil mahasiswa'
    }, { status: 500 });
  }
}
