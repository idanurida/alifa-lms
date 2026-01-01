// app/api/akademik/mata-kuliah/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { mataKuliahSchema } from '@/lib/validations/akademik';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('is_active');
    const curriculumId = searchParams.get('curriculum_id');
    const semester = searchParams.get('semester');

    let query = `
      SELECT 
        c.id, c.code, c.name, c.credits, c.semester, c.description, c.is_active, c.created_at,
        cur.id as curriculum_id, cur.name as curriculum_name, cur.code as curriculum_code
      FROM courses c
      JOIN curricula cur ON c.curriculum_id = cur.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (isActive !== null) {
      query += ` AND c.is_active = $${params.length + 1}`;
      params.push(isActive === 'true');
    }

    if (curriculumId) {
      query += ` AND c.curriculum_id = $${params.length + 1}`;
      params.push(curriculumId);
    }

    if (semester) {
      query += ` AND c.semester = $${params.length + 1}`;
      params.push(semester);
    }

    query += ` ORDER BY c.semester, c.code`;

    const result = await sql(query, params);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('GET Mata Kuliah Error:', error);
    return NextResponse.json({ error: 'Failed to fetch mata kuliah' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = mataKuliahSchema.parse(body);

    // Cek apakah code sudah ada
    const [existing] = await sql`
      SELECT id FROM courses WHERE code = ${validatedData.code}
    `;

    if (existing) {
      return NextResponse.json({ error: 'Kode mata kuliah sudah digunakan' }, { status: 400 });
    }

    const [newCourse] = await sql`
      INSERT INTO courses (
        code, name, credits, theory_credits, practical_credits, 
        curriculum_id, semester, prerequisites, description, is_active
      ) 
      VALUES (
        ${validatedData.code}, ${validatedData.name}, 
        ${validatedData.credits}, ${validatedData.theory_credits || 0}, 
        ${validatedData.practical_credits || 0}, 
        ${validatedData.curriculum_id}, ${validatedData.semester}, 
        ${validatedData.prerequisites || null}, 
        ${validatedData.description || null}, 
        ${validatedData.is_active ?? true}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      newCourse,
      message: 'Mata kuliah berhasil ditambahkan'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('POST Mata Kuliah Error:', error);
    return NextResponse.json({ error: 'Failed to add mata kuliah' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID mata kuliah tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    // Gunakan schema untuk update
    const updateSchema = z.object({
      code: z.string().optional(),
      name: z.string().optional(),
      credits: z.number().int().positive().optional(),
      theory_credits: z.number().int().min(0).optional(),
      practical_credits: z.number().int().min(0).optional(),
      curriculum_id: z.number().int().positive().optional(),
      semester: z.number().int().min(1).max(8).optional(),
      prerequisites: z.string().optional().nullable(),
      description: z.string().optional(),
      is_active: z.boolean().optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Jika code diupdate, cek apakah sudah ada
    if (validatedData.code) {
      const [existing] = await sql`
        SELECT id FROM courses WHERE code = ${validatedData.code} AND id != ${parseInt(id)}
      `;
      if (existing) {
        return NextResponse.json({ error: 'Kode mata kuliah sudah digunakan' }, { status: 400 });
      }
    }

    const [updatedCourse] = await sql`
      UPDATE courses 
      SET 
        code = COALESCE(${validatedData.code}, code),
        name = COALESCE(${validatedData.name}, name),
        credits = COALESCE(${validatedData.credits}, credits),
        theory_credits = COALESCE(${validatedData.theory_credits}, theory_credits),
        practical_credits = COALESCE(${validatedData.practical_credits}, practical_credits),
        curriculum_id = COALESCE(${validatedData.curriculum_id}, curriculum_id),
        semester = COALESCE(${validatedData.semester}, semester),
        prerequisites = COALESCE(${validatedData.prerequisites}, prerequisites),
        description = COALESCE(${validatedData.description}, description),
        is_active = COALESCE(${validatedData.is_active}, is_active)
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!updatedCourse) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      updatedCourse,
      message: 'Mata kuliah berhasil diperbarui'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('PUT Mata Kuliah Error:', error);
    return NextResponse.json({ error: 'Failed to update mata kuliah' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID mata kuliah tidak ditemukan' }, { status: 400 });
    }

    // Cek apakah mata kuliah memiliki ketergantungan (kelas, dll)
    const [classCheck] = await sql`
      SELECT COUNT(*) as count FROM classes WHERE course_id = ${parseInt(id)}
    `;

    if (classCheck.count > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus mata kuliah yang memiliki kelas terkait' }, { status: 400 });
    }

    const result = await sql`DELETE FROM courses WHERE id = ${parseInt(id)}`;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Mata kuliah berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE Mata Kuliah Error:', error);
    return NextResponse.json({ error: 'Failed to delete mata kuliah' }, { status: 500 });
  }
}
