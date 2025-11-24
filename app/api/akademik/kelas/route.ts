// app/api/akademik/kelas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { kelasSchema } from '@/lib/validations/akademik';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('is_active');
    const academicPeriodId = searchParams.get('academic_period_id');
    const lecturerId = searchParams.get('lecturer_id');
    const courseId = searchParams.get('course_id');

    let query = `
      SELECT 
        cl.id, cl.course_id, cl.academic_period_id, cl.class_code, cl.lecturer_id, cl.schedule, cl.max_students, cl.is_active, cl.created_at,
        c.name as course_name, c.code as course_code, c.credits as course_credits,
        ap.name as academic_period_name, ap.code as academic_period_code,
        l.name as lecturer_name, l.nidn as lecturer_nidn
      FROM classes cl
      JOIN courses c ON cl.course_id = c.id
      JOIN academic_periods ap ON cl.academic_period_id = ap.id
      JOIN lecturers l ON cl.lecturer_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (isActive !== null) {
      query += ` AND cl.is_active = $${params.length + 1}`;
      params.push(isActive === 'true');
    }

    if (academicPeriodId) {
      query += ` AND cl.academic_period_id = $${params.length + 1}`;
      params.push(academicPeriodId);
    }

    if (lecturerId) {
      query += ` AND cl.lecturer_id = $${params.length + 1}`;
      params.push(lecturerId);
    }

    if (courseId) {
      query += ` AND cl.course_id = $${params.length + 1}`;
      params.push(courseId);
    }

    query += ` ORDER BY cl.class_code, cl.course_id`;

    const result = await sql(query, params);

    // Tambahkan jumlah mahasiswa yang terdaftar ke setiap kelas
    const resultWithEnrollmentCount = await Promise.all(result.map(async (kelas: any) => {
      const [enrollmentCount] = await sql`
        SELECT COUNT(*) as count FROM student_enrollments WHERE class_id = ${kelas.id}
      `;
      return {
        ...kelas,
        enrolled_students: parseInt(enrollmentCount.count),
        scheduleText: `${kelas.schedule.day}, ${kelas.schedule.time}, ${kelas.schedule.room}`
      };
    }));

    return NextResponse.json({ data: resultWithEnrollmentCount });
  } catch (error) {
    console.error('GET Kelas Error:', error);
    return NextResponse.json({ error: 'Failed to fetch kelas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = kelasSchema.parse(body);

    // Cek apakah kelas dengan kombinasi yang sama sudah ada
    const [existing] = await sql`
      SELECT id FROM classes 
      WHERE course_id = ${validatedData.course_id} 
        AND academic_period_id = ${validatedData.academic_period_id}
        AND class_code = ${validatedData.class_code}
    `;

    if (existing) {
      return NextResponse.json({ error: 'Kelas dengan kombinasi mata kuliah, periode, dan kode kelas sudah ada' }, { status: 400 });
    }

    const [newClass] = await sql`
      INSERT INTO classes (
        course_id, academic_period_id, class_code, lecturer_id, schedule, max_students, is_active
      ) 
      VALUES (
        ${validatedData.course_id}, ${validatedData.academic_period_id}, 
        ${validatedData.class_code}, ${validatedData.lecturer_id}, 
        ${JSON.stringify(validatedData.schedule)}, 
        ${validatedData.max_students}, 
        ${validatedData.is_active ?? true}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
       newClass,
      message: 'Kelas berhasil ditambahkan'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('POST Kelas Error:', error);
    return NextResponse.json({ error: 'Failed to add kelas' }, { status: 500 });
  }
}

// PUT dan DELETE untuk kelas bisa ditambahkan sesuai kebutuhan
// Contoh PUT:
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID kelas tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    const updateSchema = z.object({
      class_code: z.string().optional(),
      lecturer_id: z.number().int().positive().optional(),
      schedule: z.object({
        day: z.string().min(1),
        time: z.string().min(1),
        room: z.string().min(1),
      }).optional(),
      max_students: z.number().int().min(1).optional(),
      is_active: z.boolean().optional(),
    });

    const validatedData = updateSchema.parse(body);

    const [updatedClass] = await sql`
      UPDATE classes 
      SET 
        class_code = COALESCE(${validatedData.class_code}, class_code),
        lecturer_id = COALESCE(${validatedData.lecturer_id}, lecturer_id),
        schedule = COALESCE(${validatedData.schedule ? JSON.stringify(validatedData.schedule) : undefined}, schedule),
        max_students = COALESCE(${validatedData.max_students}, max_students),
        is_active = COALESCE(${validatedData.is_active}, is_active)
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!updatedClass) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
       updatedClass,
      message: 'Kelas berhasil diperbarui'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('PUT Kelas Error:', error);
    return NextResponse.json({ error: 'Failed to update kelas' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID kelas tidak ditemukan' }, { status: 400 });
    }

    // Cek apakah kelas memiliki ketergantungan (enrollment, dll)
    const [enrollmentCheck] = await sql`
      SELECT COUNT(*) as count FROM student_enrollments WHERE class_id = ${parseInt(id)}
    `;

    if (enrollmentCheck.count > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus kelas yang memiliki mahasiswa terdaftar' }, { status: 400 });
    }

    const result = await sql`DELETE FROM classes WHERE id = ${parseInt(id)}`;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Kelas berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE Kelas Error:', error);
    return NextResponse.json({ error: 'Failed to delete kelas' }, { status: 500 });
  }
}