// app/api/akademik/kalender/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema validasi untuk Academic Period
const academicPeriodSchema = z.object({
  name: z.string().min(1, 'Nama periode wajib diisi'),
  code: z.string().min(1, 'Kode periode wajib diisi'),
  year: z.number().int().positive('Tahun harus berupa angka positif'),
  semester: z.number().int().min(1).max(2, 'Semester harus 1 atau 2'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  uts_week: z.number().int().min(1).max(16, 'Minggu UTS harus antara 1-16'),
  uas_week: z.number().int().min(1).max(16, 'Minggu UAS harus antara 1-16'),
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
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');

    let query = `SELECT * FROM academic_periods`;
    const params: any[] = [];

    const conditions = [];
    if (isActive !== null) {
      conditions.push(`is_active = $${params.length + 1}`);
      params.push(isActive === 'true');
    }
    if (year) {
      conditions.push(`year = $${params.length + 1}`);
      params.push(parseInt(year));
    }
    if (semester) {
      conditions.push(`semester = $${params.length + 1}`);
      params.push(parseInt(semester));
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY year DESC, semester ASC, created_at DESC`;

    const result = await sql(query, params);

    return NextResponse.json({  result });
  } catch (error) {
    console.error('GET Academic Periods Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data periode akademik' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = academicPeriodSchema.parse(body);

    // Validasi logika: tanggal mulai harus sebelum tanggal selesai
    if (new Date(validatedData.start_date) >= new Date(validatedData.end_date)) {
      return NextResponse.json({ error: 'Tanggal mulai harus sebelum tanggal selesai' }, { status: 400 });
    }

    // Validasi logika: minggu UTS dan UAS harus masuk dalam rentang semester
    const startDate = new Date(validatedData.start_date);
    const endDate = new Date(validatedData.end_date);
    const utsDate = new Date(startDate);
    utsDate.setDate(utsDate.getDate() + (validatedData.uts_week - 1) * 7);
    const uasDate = new Date(startDate);
    uasDate.setDate(uasDate.getDate() + (validatedData.uas_week - 1) * 7);

    if (utsDate > endDate || uasDate > endDate) {
      return NextResponse.json({ error: 'Minggu UTS/UAS melebihi rentang akhir semester' }, { status: 400 });
    }

    // Cek apakah code sudah ada
    const [existing] = await sql`
      SELECT id FROM academic_periods WHERE code = ${validatedData.code}
    `;

    if (existing) {
      return NextResponse.json({ error: 'Kode periode akademik sudah digunakan' }, { status: 400 });
    }

    // Cek apakah ada periode aktif lain dengan tahun/semester yang sama
    if (validatedData.is_active) {
      const [activePeriod] = await sql`
        SELECT id FROM academic_periods WHERE year = ${validatedData.year} AND semester = ${validatedData.semester} AND is_active = true
      `;
      if (activePeriod) {
        // Nonaktifkan periode aktif sebelumnya (opsional, tergantung kebijakan)
        await sql`UPDATE academic_periods SET is_active = false WHERE id = ${activePeriod.id}`;
        // Atau kembalikan error
        // return NextResponse.json({ error: 'Sudah ada periode aktif untuk tahun dan semester ini' }, { status: 400 });
      }
    }

    const [newPeriod] = await sql`
      INSERT INTO academic_periods (
        name, code, year, semester, start_date, end_date, uts_week, uas_week, is_active
      ) 
      VALUES (
        ${validatedData.name}, ${validatedData.code}, 
        ${validatedData.year}, ${validatedData.semester}, 
        ${validatedData.start_date}, ${validatedData.end_date}, 
        ${validatedData.uts_week}, ${validatedData.uas_week}, 
        ${validatedData.is_active ?? false}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
       newPeriod,
      message: 'Periode akademik berhasil ditambahkan'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('POST Academic Period Error:', error);
    return NextResponse.json({ error: 'Gagal menambah periode akademik' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID periode akademik tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    // Gunakan schema untuk update
    const updateSchema = z.object({
      name: z.string().optional(),
      code: z.string().optional(),
      year: z.number().int().positive().optional(),
      semester: z.number().int().min(1).max(2).optional(),
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      uts_week: z.number().int().min(1).max(16).optional(),
      uas_week: z.number().int().min(1).max(16).optional(),
      is_active: z.boolean().optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Jika code diupdate, cek apakah sudah ada
    if (validatedData.code) {
      const [existing] = await sql`
        SELECT id FROM academic_periods WHERE code = ${validatedData.code} AND id != ${parseInt(id)}
      `;
      if (existing) {
        return NextResponse.json({ error: 'Kode periode akademik sudah digunakan' }, { status: 400 });
      }
    }

    // Jika tanggal diupdate, lakukan validasi logika
    let startDate = validatedData.start_date;
    let endDate = validatedData.end_date;
    let utsWeek = validatedData.uts_week;
    let uasWeek = validatedData.uas_week;

    if (startDate || endDate || utsWeek || uasWeek) {
      // Ambil data sebelumnya jika field tidak diupdate
      if (!startDate || !endDate || !utsWeek || !uasWeek) {
        const [currentPeriod] = await sql`SELECT start_date, end_date, uts_week, uas_week FROM academic_periods WHERE id = ${parseInt(id)}`;
        startDate = startDate || currentPeriod.start_date;
        endDate = endDate || currentPeriod.end_date;
        utsWeek = utsWeek || currentPeriod.uts_week;
        uasWeek = uasWeek || currentPeriod.uas_week;
      }

      if (new Date(startDate) >= new Date(endDate)) {
        return NextResponse.json({ error: 'Tanggal mulai harus sebelum tanggal selesai' }, { status: 400 });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const utsDate = new Date(start);
      utsDate.setDate(utsDate.getDate() + (utsWeek - 1) * 7);
      const uasDate = new Date(start);
      uasDate.setDate(uasDate.getDate() + (uasWeek - 1) * 7);

      if (utsDate > end || uasDate > end) {
        return NextResponse.json({ error: 'Minggu UTS/UAS melebihi rentang akhir semester' }, { status: 400 });
      }
    }

    // Jika is_active diupdate ke true, nonaktifkan periode aktif lain untuk tahun/semester yang sama
    if (validatedData.is_active === true) {
      await sql`
        UPDATE academic_periods 
        SET is_active = false 
        WHERE year = ${validatedData.year || sql`COALESCE((SELECT year FROM academic_periods WHERE id = ${parseInt(id)}), 0)`} 
          AND semester = ${validatedData.semester || sql`COALESCE((SELECT semester FROM academic_periods WHERE id = ${parseInt(id)}), 0)`} 
          AND id != ${parseInt(id)}
      `;
    }

    const [updatedPeriod] = await sql`
      UPDATE academic_periods 
      SET 
        name = COALESCE(${validatedData.name}, name),
        code = COALESCE(${validatedData.code}, code),
        year = COALESCE(${validatedData.year}, year),
        semester = COALESCE(${validatedData.semester}, semester),
        start_date = COALESCE(${validatedData.start_date}, start_date),
        end_date = COALESCE(${validatedData.end_date}, end_date),
        uts_week = COALESCE(${validatedData.uts_week}, uts_week),
        uas_week = COALESCE(${validatedData.uas_week}, uas_week),
        is_active = COALESCE(${validatedData.is_active}, is_active)
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!updatedPeriod) {
      return NextResponse.json({ error: 'Periode akademik tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
       updatedPeriod,
      message: 'Periode akademik berhasil diperbarui'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('PUT Academic Period Error:', error);
    return NextResponse.json({ error: 'Failed to update academic period' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID periode akademik tidak ditemukan' }, { status: 400 });
    }

    // Cek apakah periode memiliki ketergantungan (kelas, dll)
    const [classCheck] = await sql`
      SELECT COUNT(*) as count FROM classes WHERE academic_period_id = ${parseInt(id)}
    `;

    if (classCheck.count > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus periode akademik yang memiliki kelas terkait' }, { status: 400 });
    }

    const result = await sql`DELETE FROM academic_periods WHERE id = ${parseInt(id)}`;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Periode akademik tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Periode akademik berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE Academic Period Error:', error);
    return NextResponse.json({ error: 'Failed to delete academic period' }, { status: 500 });
  }
}