// app/api/akademik/skala-nilai/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema validasi untuk update skala nilai
const updateGradeScaleSchema = z.object({
  grade_char: z.string().min(1).max(2).optional(),
  grade_value: z.number().min(0).max(4).optional(),
  min_score: z.number().int().min(0).max(100).optional(),
  max_score: z.number().int().min(0).max(100).nullable().optional(),
  description: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const gradeScaleId = parseInt(id);
    if (isNaN(gradeScaleId)) {
      return NextResponse.json({ error: 'ID skala nilai tidak valid' }, { status: 400 });
    }

    const [gradeScale] = await sql`
      SELECT 
        gs.*,
        c.name as curriculum_name,
        c.id as curriculum_id
      FROM grade_scales gs
      JOIN curricula c ON gs.curriculum_id = c.id
      WHERE gs.id = ${gradeScaleId}
    `;

    if (!gradeScale) {
      return NextResponse.json({ error: 'Skala nilai tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: gradeScale
    });

  } catch (error) {
    console.error('GET Grade Scale Error:', error);
    return NextResponse.json({
      error: 'Gagal mengambil data skala nilai'
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const gradeScaleId = parseInt(id);
    if (isNaN(gradeScaleId)) {
      return NextResponse.json({ error: 'ID skala nilai tidak valid' }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = updateGradeScaleSchema.parse(body);

    // Cek apakah skala nilai ada
    const [existingGradeScale] = await sql`
      SELECT * FROM grade_scales WHERE id = ${gradeScaleId}
    `;
    if (!existingGradeScale) {
      return NextResponse.json({ error: 'Skala nilai tidak ditemukan' }, { status: 404 });
    }

    // Jika grade_char diubah, cek duplikasi
    if (validatedData.grade_char && validatedData.grade_char !== existingGradeScale.grade_char) {
      const [duplicateGrade] = await sql`
        SELECT id FROM grade_scales 
        WHERE curriculum_id = ${existingGradeScale.curriculum_id} 
        AND grade_char = ${validatedData.grade_char}
        AND id != ${gradeScaleId}
      `;
      if (duplicateGrade) {
        return NextResponse.json({
          error: `Huruf nilai ${validatedData.grade_char} sudah ada untuk kurikulum ini`
        }, { status: 400 });
      }
    }

    // Update skala nilai
    const [updatedGradeScale] = await sql`
      UPDATE grade_scales 
      SET 
        grade_char = COALESCE(${validatedData.grade_char}, grade_char),
        grade_value = COALESCE(${validatedData.grade_value}, grade_value),
        min_score = COALESCE(${validatedData.min_score}, min_score),
        max_score = COALESCE(${validatedData.max_score}, max_score),
        description = COALESCE(${validatedData.description}, description)
      WHERE id = ${gradeScaleId}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: updatedGradeScale,
      message: 'Skala nilai berhasil diperbarui'
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
    console.error('PUT Grade Scale Error:', error);
    return NextResponse.json({
      error: 'Gagal memperbarui skala nilai'
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const gradeScaleId = parseInt(id);
    if (isNaN(gradeScaleId)) {
      return NextResponse.json({ error: 'ID skala nilai tidak valid' }, { status: 400 });
    }

    // Cek apakah skala nilai ada
    const [existingGradeScale] = await sql`
      SELECT * FROM grade_scales WHERE id = ${gradeScaleId}
    `;
    if (!existingGradeScale) {
      return NextResponse.json({ error: 'Skala nilai tidak ditemukan' }, { status: 404 });
    }

    // Hapus skala nilai
    const [deletedGradeScale] = await sql`
      DELETE FROM grade_scales 
      WHERE id = ${gradeScaleId}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'Skala nilai berhasil dihapus'
    });

  } catch (error) {
    console.error('DELETE Grade Scale Error:', error);
    return NextResponse.json({
      error: 'Gagal menghapus skala nilai'
    }, { status: 500 });
  }
}