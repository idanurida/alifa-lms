// app/api/akademik/program-studi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const programStudiSchema = z.object({
  name: z.string().min(1, 'Nama program studi wajib diisi'),
  code: z.string().min(1, 'Kode program studi wajib diisi'),
  faculty: z.string().min(1, 'Fakultas wajib diisi'),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('is_active');

    let query = `SELECT * FROM study_programs`;
    const params: any[] = [];

    if (isActive !== null) {
      query += ` WHERE is_active = $${params.length + 1}`;
      params.push(isActive === 'true');
    }

    query += ` ORDER BY code`;

    const result = await sql(query, params);

    return NextResponse.json({  result });
  } catch (error) {
    console.error('GET Program Studi Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data program studi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = programStudiSchema.parse(body);

    // Cek apakah code sudah ada
    const [existing] = await sql`
      SELECT id FROM study_programs WHERE code = ${validatedData.code}
    `;

    if (existing) {
      return NextResponse.json({ error: 'Kode program studi sudah digunakan' }, { status: 400 });
    }

    const [newProgram] = await sql`
      INSERT INTO study_programs (
        name, code, faculty, is_active
      ) 
      VALUES (
        ${validatedData.name}, ${validatedData.code}, 
        ${validatedData.faculty}, 
        ${validatedData.is_active ?? true}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
       newProgram,
      message: 'Program studi berhasil ditambahkan'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('POST Program Studi Error:', error);
    return NextResponse.json({ error: 'Gagal menambah program studi' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID program studi tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    // Gunakan schema untuk update
    const updateSchema = z.object({
      name: z.string().optional(),
      code: z.string().optional(),
      faculty: z.string().optional(),
      is_active: z.boolean().optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Jika code diupdate, cek apakah sudah ada
    if (validatedData.code) {
      const [existing] = await sql`
        SELECT id FROM study_programs WHERE code = ${validatedData.code} AND id != ${parseInt(id)}
      `;
      if (existing) {
        return NextResponse.json({ error: 'Kode program studi sudah digunakan' }, { status: 400 });
      }
    }

    const [updatedProgram] = await sql`
      UPDATE study_programs 
      SET 
        name = COALESCE(${validatedData.name}, name),
        code = COALESCE(${validatedData.code}, code),
        faculty = COALESCE(${validatedData.faculty}, faculty),
        is_active = COALESCE(${validatedData.is_active}, is_active)
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!updatedProgram) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
       updatedProgram,
      message: 'Program studi berhasil diperbarui'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('PUT Program Studi Error:', error);
    return NextResponse.json({ error: 'Failed to update program studi' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID program studi tidak ditemukan' }, { status: 400 });
    }

    // Cek apakah program studi memiliki ketergantungan (kurikulum, dll)
    const [curriculumCheck] = await sql`
      SELECT COUNT(*) as count FROM curricula WHERE study_program_id = ${parseInt(id)}
    `;

    if (curriculumCheck.count > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus program studi yang memiliki kurikulum terkait' }, { status: 400 });
    }

    const result = await sql`DELETE FROM study_programs WHERE id = ${parseInt(id)}`;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Program studi berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE Program Studi Error:', error);
    return NextResponse.json({ error: 'Failed to delete program studi' }, { status: 500 });
  }
}
