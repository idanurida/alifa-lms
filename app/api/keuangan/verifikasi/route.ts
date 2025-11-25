export const dynamic = 'force-dynamic'

// app/api/keuangan/verifikasi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending'; // Default ke pending
    const studentId = searchParams.get('student_id');
    const academicPeriodId = searchParams.get('academic_period_id');

    let query = `
      SELECT 
        pe.id,
        pe.student_id,
        s.name as student_name,
        s.nim,
        pe.academic_period_id,
        ap.name as academic_period_name,
        pe.amount,
        pe.evidence_path,
        pe.transfer_date,
        pe.bank_name,
        pe.account_number,
        pe.account_name,
        pe.status,
        pe.verified_by,
        pe.verified_at,
        pe.notes,
        pe.created_at
      FROM payment_evidences pe
      JOIN students s ON pe.student_id = s.id
      JOIN academic_periods ap ON pe.academic_period_id = ap.id
      WHERE pe.status = $1
    `;

    const params: any[] = [status];

    if (studentId) {
      query += ` AND pe.student_id = $${params.length + 1}`;
      params.push(studentId);
    }

    if (academicPeriodId) {
      query += ` AND pe.academic_period_id = $${params.length + 1}`;
      params.push(academicPeriodId);
    }

    query += ` ORDER BY pe.created_at ASC`;

    const result = await sql(query, params);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('GET Verification Queue Error:', error);
    return NextResponse.json({ error: 'Failed to fetch verification queue' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID bukti transfer tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = verifyPaymentSchema.parse(body);

    // Update status dan catatan verifikasi
    const [updatedEvidence] = await sql`
      UPDATE payment_evidences 
      SET 
        status = ${validatedData.status},
        verified_by = ${session.user.id},
        verified_at = NOW(),
        notes = ${validatedData.notes || null}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!updatedEvidence) {
      return NextResponse.json({ error: 'Bukti transfer tidak ditemukan' }, { status: 404 });
    }

    // Jika status menjadi verified, buatkan invoice jika belum ada
    if (validatedData.status === 'verified') {
      // Cek apakah invoice sudah ada
      const [existingInvoice] = await sql`
        SELECT id FROM invoices 
        WHERE student_id = ${updatedEvidence.student_id} 
          AND academic_period_id = ${updatedEvidence.academic_period_id}
      `;

      if (!existingInvoice) {
        // Buat invoice baru
        await sql`
          INSERT INTO invoices (student_id, academic_period_id, amount, due_date, status)
          VALUES (
            ${updatedEvidence.student_id}, 
            ${updatedEvidence.academic_period_id}, 
            ${updatedEvidence.amount}, 
            NOW() + INTERVAL '30 days', -- Jatuh tempo 30 hari dari verifikasi
            'paid'
          )
        `;
      } else {
        // Update status invoice menjadi paid jika belum
        await sql`
          UPDATE invoices 
          SET status = 'paid', updated_at = NOW()
          WHERE id = ${existingInvoice.id}
        `;
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedEvidence,
      message: `Bukti transfer ${validatedData.status}`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('PUT Verify Payment Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment evidence' }, { status: 500 });
  }
}
