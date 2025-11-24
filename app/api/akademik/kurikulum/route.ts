// app/api/akademik/kurikulum/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { kurikulumSchema } from '@/lib/validations/akademik';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('is_active');
    const studyProgramId = searchParams.get('study_program_id');

    let query = `
      SELECT 
        c.id, c.name, c.code, c.total_credits, c.is_active, c.created_at,
        sp.id as study_program_id, sp.name as study_program_name, sp.code as study_program_code, sp.faculty
      FROM curricula c
      JOIN study_programs sp ON c.study_program_id = sp.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (isActive !== null) {
      query += ` AND c.is_active = $${params.length + 1}`;
      params.push(isActive === 'true');
    }

    if (studyProgramId) {
      query += ` AND c.study_program_id = $${params.length + 1}`;
      params.push(studyProgramId);
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await sql(query, params);

    return NextResponse.json({  result });
  } catch (error) {
    console.error('GET Kurikulum Error:', error);
    return NextResponse.json({ error: 'Failed to fetch kurikulum' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = kurikulumSchema.parse(body);

    // Cek apakah code sudah ada
    const [existing] = await sql`
      SELECT id FROM curricula WHERE code = ${validatedData.code}
    `;

    if (existing) {
      return NextResponse.json({ error: 'Kode kurikulum sudah digunakan' }, { status: 400 });
    }

    const [newKurikulum] = await sql`
      INSERT INTO curricula (
        name, code, study_program_id, total_credits, is_active
      ) 
      VALUES (
        ${validatedData.name}, ${validatedData.code}, 
        ${validatedData.study_program_id}, 
        ${validatedData.total_credits}, 
        ${validatedData.is_active ?? true}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
       newKurikulum,
      message: 'Kurikulum berhasil ditambahkan'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('POST Kurikulum Error:', error);
    return NextResponse.json({ error: 'Failed to add kurikulum' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID kurikulum tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    // Gunakan schema untuk update, buat schema update jika berbeda
    const updateSchema = z.object({
      name: z.string().optional(),
      code: z.string().optional(),
      study_program_id: z.number().int().positive().optional(),
      total_credits: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Jika code diupdate, cek apakah sudah ada
    if (validatedData.code) {
      const [existing] = await sql`
        SELECT id FROM curricula WHERE code = ${validatedData.code} AND id != ${parseInt(id)}
      `;
      if (existing) {
        return NextResponse.json({ error: 'Kode kurikulum sudah digunakan' }, { status: 400 });
      }
    }

    const [updatedKurikulum] = await sql`
      UPDATE curricula 
      SET 
        name = COALESCE(${validatedData.name}, name),
        code = COALESCE(${validatedData.code}, code),
        study_program_id = COALESCE(${validatedData.study_program_id}, study_program_id),
        total_credits = COALESCE(${validatedData.total_credits}, total_credits),
        is_active = COALESCE(${validatedData.is_active}, is_active)
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!updatedKurikulum) {
      return NextResponse.json({ error: 'Kurikulum tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
       updatedKurikulum,
      message: 'Kurikulum berhasil diperbarui'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('PUT Kurikulum Error:', error);
    return NextResponse.json({ error: 'Failed to update kurikulum' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID kurikulum tidak ditemukan' }, { status: 400 });
    }

    // Cek apakah kurikulum memiliki ketergantungan (mata kuliah, dll)
    const [courseCheck] = await sql`
      SELECT COUNT(*) as count FROM courses WHERE curriculum_id = ${parseInt(id)}
    `;

    if (courseCheck.count > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus kurikulum yang memiliki mata kuliah terkait' }, { status: 400 });
    }

    const result = await sql`DELETE FROM curricula WHERE id = ${parseInt(id)}`;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Kurikulum tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Kurikulum berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE Kurikulum Error:', error);
    return NextResponse.json({ error: 'Failed to delete kurikulum' }, { status: 500 });
  }
}