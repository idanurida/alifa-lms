// app/api/akademik/skala-nilai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema validasi untuk membuat skala nilai
const createGradeScaleSchema = z.object({
  curriculum_id: z.number().int().positive({ message: 'Kurikulum wajib dipilih' }),
  grade_char: z.string().min(1).max(2, { message: 'Huruf nilai harus 1-2 karakter' }),
  grade_value: z.number().min(0).max(4, { message: 'Nilai angka harus antara 0-4' }),
  min_score: z.number().int().min(0).max(100, { message: 'Nilai minimum harus 0-100' }),
  max_score: z.number().int().min(0).max(100).nullable().optional(),
  description: z.string().optional(),
});

// Schema validasi untuk update skala nilai
const updateGradeScaleSchema = z.object({
  grade_char: z.string().min(1).max(2).optional(),
  grade_value: z.number().min(0).max(4).optional(),
  min_score: z.number().int().min(0).max(100).optional(),
  max_score: z.number().int().min(0).max(100).nullable().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createGradeScaleSchema.parse(body);

    // Cek apakah kurikulum ada
    const [curriculum] = await sql`
      SELECT id FROM curricula WHERE id = ${validatedData.curriculum_id}
    `;
    if (!curriculum) {
      return NextResponse.json({ error: 'Kurikulum tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah grade_char sudah ada untuk kurikulum ini
    const [existingGrade] = await sql`
      SELECT id FROM grade_scales 
      WHERE curriculum_id = ${validatedData.curriculum_id} 
      AND grade_char = ${validatedData.grade_char}
    `;
    if (existingGrade) {
      return NextResponse.json({ 
        error: `Huruf nilai ${validatedData.grade_char} sudah ada untuk kurikulum ini` 
      }, { status: 400 });
    }

    // Cek rentang nilai tidak overlap
    const [overlappingGrade] = await sql`
      SELECT grade_char FROM grade_scales 
      WHERE curriculum_id = ${validatedData.curriculum_id}
      AND (
        (min_score <= ${validatedData.min_score} AND (max_score >= ${validatedData.min_score} OR max_score IS NULL))
        OR (${validatedData.max_score} IS NOT NULL AND min_score <= ${validatedData.max_score} AND (max_score >= ${validatedData.max_score} OR max_score IS NULL))
        OR (${validatedData.max_score} IS NULL AND min_score >= ${validatedData.min_score})
      )
    `;
    if (overlappingGrade) {
      return NextResponse.json({ 
        error: `Rentang nilai bertumpang tindih dengan huruf nilai ${overlappingGrade.grade_char}` 
      }, { status: 400 });
    }

    // Insert skala nilai baru
    const [newGradeScale] = await sql`
      INSERT INTO grade_scales (
        curriculum_id,
        grade_char,
        grade_value,
        min_score,
        max_score,
        description
      ) 
      VALUES (
        ${validatedData.curriculum_id},
        ${validatedData.grade_char},
        ${validatedData.grade_value},
        ${validatedData.min_score},
        ${validatedData.max_score},
        ${validatedData.description}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      data: newGradeScale,
      message: 'Skala nilai berhasil ditambahkan'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validasi gagal', 
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    console.error('POST Grade Scale Error:', error);
    return NextResponse.json({ 
      error: 'Gagal menambah skala nilai' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const curriculumId = searchParams.get('curriculum_id');

    if (!curriculumId) {
      return NextResponse.json({ error: 'Parameter curriculum_id diperlukan' }, { status: 400 });
    }

    const gradeScales = await sql`
      SELECT 
        gs.id,
        gs.grade_char,
        gs.grade_value,
        gs.min_score,
        gs.max_score,
        gs.description,
        c.name as curriculum_name
      FROM grade_scales gs
      JOIN curricula c ON gs.curriculum_id = c.id
      WHERE gs.curriculum_id = ${parseInt(curriculumId)}
      ORDER BY gs.min_score DESC
    `;

    return NextResponse.json({ 
      success: true,
      data: gradeScales
    });

  } catch (error) {
    console.error('GET Grade Scales Error:', error);
    return NextResponse.json({ 
      error: 'Gagal mengambil data skala nilai' 
    }, { status: 500 });
  }
}