// app/api/akademik/krs/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['staff_akademik', 'super_admin'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    const body = await request.json();
    const { krs_id, status, catatan } = body;

    if (!krs_id || !status) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    logger.info('KRS-Approval', `Processing KRS ${krs_id} with status: ${status}`);

    // Update status KRS
    const result = await sql`
      UPDATE public.krs_submissions 
      SET 
        status = ${status},
        approved_at = NOW(),
        approved_by = ${session.user.id},
        notes = ${catatan || null}
      WHERE id = ${krs_id}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'KRS tidak ditemukan' }, { status: 404 });
    }

    logger.info('KRS-Approval', `KRS ${krs_id} processed successfully`);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: `KRS berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`
    });

  } catch (error) {
    logger.error('KRS-Approval', 'Failed to process KRS', error);
    return NextResponse.json({
      error: 'Gagal memproses KRS'
    }, { status: 500 });
  }
}