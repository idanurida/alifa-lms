// app/api/akademik/krs/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['staff_akademik', 'super_admin'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    // Ambil KRS pending dengan data mahasiswa
    const krsPending = await sql`
      SELECT 
        krs.*,
        m.nama,
        m.nim,
        p.nama as program_studi
      FROM krs_submissions krs
      JOIN mahasiswa m ON krs.mahasiswa_id = m.id
      LEFT JOIN program_studi p ON m.program_studi_id = p.id
      WHERE krs.status = 'pending'
      ORDER BY krs.submitted_at DESC
    `;

    return NextResponse.json({ 
      success: true, 
      data: krsPending 
    });
  } catch (error) {
    console.error('Error API KRS Pending:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Gagal mengambil data KRS pending' 
    }, { status: 500 });
  }
}