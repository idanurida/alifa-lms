// app/api/keuangan/bukti-transfer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const paymentEvidenceSchema = z.object({
  student_id: z.number().int().positive(),
  academic_period_id: z.number().int().positive(),
  amount: z.number().positive(),
  evidence_path: z.string().min(1),
  transfer_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Format YYYY-MM-DD
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  account_name: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_keuangan', 'staff_akademik'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
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
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ` AND pe.status = $${params.length + 1}`;
      params.push(status);
    }

    if (studentId) {
      query += ` AND pe.student_id = $${params.length + 1}`;
      params.push(studentId);
    }

    if (academicPeriodId) {
      query += ` AND pe.academic_period_id = $${params.length + 1}`;
      params.push(academicPeriodId);
    }

    query += ` ORDER BY pe.created_at DESC`;

    const result = await sql(query, params);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('GET Payment Evidence Error:', error);
    return NextResponse.json({ error: 'Failed to fetch payment evidences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['mahasiswa'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = paymentEvidenceSchema.parse(body);

    // Pastikan student_id sesuai dengan session user
    if (validatedData.student_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cek apakah sudah ada bukti transfer untuk periode ini
    const [existing] = await sql`
      SELECT id FROM payment_evidences 
      WHERE student_id = ${validatedData.student_id} 
        AND academic_period_id = ${validatedData.academic_period_id}
    `;

    if (existing) {
      return NextResponse.json({ error: 'Bukti transfer untuk periode ini sudah ada' }, { status: 400 });
    }

    const [newEvidence] = await sql`
      INSERT INTO payment_evidences (
        student_id, academic_period_id, amount, evidence_path, transfer_date,
        bank_name, account_number, account_name
      ) 
      VALUES (
        ${validatedData.student_id}, ${validatedData.academic_period_id}, 
        ${validatedData.amount}, ${validatedData.evidence_path}, 
        ${validatedData.transfer_date},
        ${validatedData.bank_name || null}, ${validatedData.account_number || null}, 
        ${validatedData.account_name || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      data: newEvidence,
      message: 'Bukti transfer berhasil dikirim'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('POST Payment Evidence Error:', error);
    return NextResponse.json({ error: 'Failed to submit payment evidence' }, { status: 500 });
  }
}