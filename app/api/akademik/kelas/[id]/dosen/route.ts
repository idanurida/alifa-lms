// app/api/akademik/kelas/[id]/dosen/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { penugasanDosenSchema } from '@/lib/validations/akademik'; // IMPORT DARI VALIDATIONS

// HAPUS schema duplikat - gunakan dari validations
// const penugasanDosenSchema = z.object({ ... }); // HAPUS

// Schema validasi untuk PUT (gunakan yang sudah ada di validations atau buat khusus)
const updateAssignmentSchema = z.object({
  assignment_type: z.enum(['main', 'assistant', 'guest']).optional(),
  teaching_load: z.number().int().min(0).max(6).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const classId = parseInt(idParam);

    // Validasi ID
    if (isNaN(classId)) {
      return NextResponse.json({ error: 'ID kelas tidak valid' }, { status: 400 });
    }

    const result = await sql`
      SELECT 
        la.id, 
        la.assignment_type, 
        la.teaching_load, 
        la.start_date, 
        la.end_date, 
        la.is_active, 
        la.created_at,
        l.id as lecturer_id, 
        l.name as lecturer_name, 
        l.nidn, 
        l.expertise
      FROM lecturer_assignments la
      JOIN lecturers l ON la.lecturer_id = l.id
      WHERE la.class_id = ${classId}
      ORDER BY la.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('GET Lecturer Assignments Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch lecturer assignments'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const classId = parseInt(idParam);

    // Validasi ID
    if (isNaN(classId)) {
      return NextResponse.json({ error: 'ID kelas tidak valid' }, { status: 400 });
    }

    const body = await req.json();

    // PERBAIKAN: Validasi dengan schema dari file validations
    const validatedData = penugasanDosenSchema.parse({
      ...body,
      class_id: classId // Sesuai dengan schema yang mengharapkan class_id
    });

    // Cek apakah kelas ada
    const [existingClass] = await sql`
      SELECT id FROM classes WHERE id = ${classId}
    `;
    if (!existingClass) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah dosen ada
    const [lecturer] = await sql`
      SELECT id FROM lecturers WHERE id = ${validatedData.lecturer_id}
    `;
    if (!lecturer) {
      return NextResponse.json({ error: 'Dosen tidak ditemukan' }, { status: 400 });
    }

    // Cek apakah sudah ditugaskan (hanya untuk assignment aktif)
    const [existingAssignment] = await sql`
      SELECT id FROM lecturer_assignments 
      WHERE lecturer_id = ${validatedData.lecturer_id} 
        AND class_id = ${classId}
        AND is_active = true
    `;
    if (existingAssignment) {
      return NextResponse.json({
        error: 'Dosen sudah ditugaskan ke kelas ini'
      }, { status: 400 });
    }

    // Insert penugasan baru
    const [newAssignment] = await sql`
      INSERT INTO lecturer_assignments (
        lecturer_id, 
        class_id, 
        assignment_type, 
        teaching_load, 
        start_date, 
        end_date, 
        is_active
      ) 
      VALUES (
        ${validatedData.lecturer_id}, 
        ${classId}, 
        ${validatedData.assignment_type}, 
        ${validatedData.teaching_load}, 
        ${validatedData.start_date || null}, 
        ${validatedData.end_date || null}, 
        ${validatedData.is_active ?? true}
      )
      RETURNING *
    `;

    // Jika assignment_type adalah 'main', update lecturer_id di tabel classes
    if (validatedData.assignment_type === 'main') {
      await sql`
        UPDATE classes 
        SET lecturer_id = ${validatedData.lecturer_id}
        WHERE id = ${classId}
      `;
    }

    return NextResponse.json({
      success: true,
      data: newAssignment,
      message: 'Penugasan dosen berhasil'
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
    console.error('POST Lecturer Assignment Error:', error);
    return NextResponse.json({
      error: 'Failed to assign lecturer'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const classId = parseInt(idParam);

    // Validasi ID
    if (isNaN(classId)) {
      return NextResponse.json({ error: 'ID kelas tidak valid' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignment_id');

    if (!assignmentId) {
      return NextResponse.json({
        error: 'ID penugasan tidak ditemukan'
      }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = updateAssignmentSchema.parse(body);

    // Update penugasan
    const [updatedAssignment] = await sql`
      UPDATE lecturer_assignments 
      SET 
        assignment_type = COALESCE(${validatedData.assignment_type}, assignment_type),
        teaching_load = COALESCE(${validatedData.teaching_load}, teaching_load),
        start_date = COALESCE(${validatedData.start_date}, start_date),
        end_date = COALESCE(${validatedData.end_date}, end_date),
        is_active = COALESCE(${validatedData.is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${parseInt(assignmentId)} AND class_id = ${classId}
      RETURNING *
    `;

    if (!updatedAssignment) {
      return NextResponse.json({
        error: 'Penugasan dosen tidak ditemukan'
      }, { status: 404 });
    }

    // Jika assignment_type diubah ke 'main', update lecturer_id di tabel classes
    if (validatedData.assignment_type === 'main') {
      await sql`
        UPDATE classes 
        SET lecturer_id = ${updatedAssignment.lecturer_id}
        WHERE id = ${classId}
      `;
    }

    return NextResponse.json({
      success: true,
      data: updatedAssignment,
      message: 'Penugasan dosen berhasil diperbarui'
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
    console.error('PUT Lecturer Assignment Error:', error);
    return NextResponse.json({
      error: 'Failed to update lecturer assignment'
    }, { status: 500 });
  }
}

// DELETE method untuk menghapus penugasan
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const classId = parseInt(idParam);

    // Validasi ID
    if (isNaN(classId)) {
      return NextResponse.json({ error: 'ID kelas tidak valid' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignment_id');

    if (!assignmentId) {
      return NextResponse.json({
        error: 'ID penugasan tidak ditemukan'
      }, { status: 400 });
    }

    // Hapus penugasan
    const [deletedAssignment] = await sql`
      DELETE FROM lecturer_assignments 
      WHERE id = ${parseInt(assignmentId)} AND class_id = ${classId}
      RETURNING *
    `;

    if (!deletedAssignment) {
      return NextResponse.json({
        error: 'Penugasan dosen tidak ditemukan'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Penugasan dosen berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE Lecturer Assignment Error:', error);
    return NextResponse.json({
      error: 'Failed to delete lecturer assignment'
    }, { status: 500 });
  }
}