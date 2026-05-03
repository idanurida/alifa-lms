// app/api/akademik/penilaian/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const nilaiSchema = z.object({
  enrollment_id: z.number().int().positive(),
  activity_type: z.enum(['tugas', 'uts', 'uas', 'kuis']),
  score: z.number().min(0).max(100),
  max_score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  activity_date: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['dosen', 'staff_akademik', 'super_admin', 'mahasiswa'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('class_id');
    const studentId = searchParams.get('student_id');

    let query = `
      SELECT 
        sa.*, 
        s.name as student_name, s.nim,
        c.class_code, co.name as course_name
      FROM student_activities sa
      JOIN student_enrollments se ON sa.enrollment_id = se.id
      JOIN students s ON se.student_id = s.id
      JOIN classes c ON se.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (classId) {
      params.push(parseInt(classId));
      query += ` AND c.id = $${params.length}`;
    }
    if (studentId) {
      params.push(parseInt(studentId));
      query += ` AND s.id = $${params.length}`;
    }

    query += ' ORDER BY sa.activity_date DESC, sa.created_at DESC';

    const result = await sql(query, params);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat penilaian' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['dosen', 'staff_akademik', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const data = nilaiSchema.parse(body);

    const [nilai] = await sql`
      INSERT INTO student_activities (enrollment_id, activity_type, activity_date, score, max_score, notes)
      VALUES (${data.enrollment_id}, ${data.activity_type}, ${data.activity_date}, ${data.score}, ${data.max_score || 100}, ${data.notes || null})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: nilai });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal menyimpan nilai' }, { status: 500 });
  }
}
