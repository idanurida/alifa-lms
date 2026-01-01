export const dynamic = 'force-dynamic'

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

    // Ambil KRS pending dengan data mahasiswa (menggunakan table students)
    const krsPending = await sql`
      SELECT 
        krs.id,
        krs.mahasiswa_id,
        krs.semester,
        krs.status,
        krs.submitted_at,
        krs.total_credits as total_sks,
        krs.courses as mata_kuliah,
        krs.notes as catatan,
        m.name as nama,
        m.nim,
        p.name as program_studi
      FROM public.krs_submissions krs
      JOIN public.students m ON krs.mahasiswa_id = m.id
      LEFT JOIN public.study_programs p ON m.study_program_num_id = p.id
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
      error: 'Gagal mengambil data KRS pending',
      details: (error as Error).message
    }, { status: 500 });
  }
}
