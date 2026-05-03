// app/api/akademik/presensi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const presensiSchema = z.object({
  class_id: z.number().int().positive(),
  meeting_number: z.number().int().positive(),
  meeting_date: z.string(),
  attendance_data: z.record(z.string(), z.enum(['hadir', 'izin', 'sakit', 'alpha'])),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['dosen', 'staff_akademik', 'super_admin', 'mahasiswa'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('class_id');
    const meetingNumber = searchParams.get('meeting_number');

    let query = `
      SELECT a.*, c.class_code, co.name as course_name
      FROM attendances a
      JOIN classes c ON a.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (classId) {
      params.push(parseInt(classId));
      query += ` AND a.class_id = $${params.length}`;
    }
    if (meetingNumber) {
      params.push(parseInt(meetingNumber));
      query += ` AND a.meeting_number = $${params.length}`;
    }

    query += ' ORDER BY a.meeting_number DESC';

    const result = await sql(query, params);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat presensi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['dosen', 'staff_akademik', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const data = presensiSchema.parse(body);

    const [presensi] = await sql`
      INSERT INTO attendances (class_id, meeting_number, meeting_date, attendance_data)
      VALUES (${data.class_id}, ${data.meeting_number}, ${data.meeting_date}, ${JSON.stringify(data.attendance_data)})
      ON CONFLICT (class_id, meeting_number) 
      DO UPDATE SET attendance_data = ${JSON.stringify(data.attendance_data)}, meeting_date = ${data.meeting_date}
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: presensi });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal menyimpan presensi' }, { status: 500 });
  }
}
