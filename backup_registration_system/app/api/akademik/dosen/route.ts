// app/api/akademik/dosen/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { dosenSchema } from '@/lib/validations/user';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      // Jika dosen, hanya boleh lihat data sendiri
      if (session?.user.role === 'dosen') {
        const userId = session.user.id;
        const [lecturer] = await sql`
          SELECT 
            l.id, l.user_id, l.nidn, l.name, l.email, l.phone, l.expertise, l.status,
            u.is_active
          FROM lecturers l
          LEFT JOIN users u ON l.user_id = u.id
          WHERE l.user_id = ${userId}
        `;
        if (!lecturer) {
          return NextResponse.json({ error: 'Data dosen tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ data: [lecturer] });
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = `
      SELECT 
        l.id, l.user_id, l.nidn, l.name, l.email, l.phone, l.expertise, l.status,
        u.is_active
      FROM lecturers l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND l.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY l.nidn`;

    const result = await sql(query, params);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('GET Dosen Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dosen' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = dosenSchema.parse(body);

    // Cek apakah NIDN sudah ada
    const [existingNidn] = await sql`
      SELECT id FROM lecturers WHERE nidn = ${validatedData.nidn}
    `;
    if (existingNidn) {
      return NextResponse.json({ error: 'NIDN sudah terdaftar' }, { status: 400 });
    }

    // Cek apakah email sudah ada di users
    const [existingEmail] = await sql`
      SELECT id FROM users WHERE email = ${validatedData.email}
    `;
    if (existingEmail) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Buat user terlebih dahulu
    const [newUser] = await sql`
      INSERT INTO users (username, email, role, is_active)
      VALUES (${validatedData.nidn}, ${validatedData.email}, 'dosen', true)
      RETURNING id
    `;

    // Buat profil
    await sql`
      INSERT INTO profiles (user_id, name, phone)
      VALUES (${newUser.id}, ${validatedData.name}, ${validatedData.phone || null})
    `;

    // Buat lecturer
    const [newLecturer] = await sql`
      INSERT INTO lecturers (
        user_id, nidn, name, email, phone, expertise, status
      )
      VALUES (
        ${newUser.id}, ${validatedData.nidn}, ${validatedData.name}, 
        ${validatedData.email}, ${validatedData.phone || null}, 
        ${validatedData.expertise || null}, ${validatedData.status || 'active'}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      newLecturer,
      message: 'Dosen berhasil ditambahkan'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('POST Dosen Error:', error);
    return NextResponse.json({ error: 'Failed to add dosen' }, { status: 500 });
  }
}

// Implementasi PUT serupa
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID dosen tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    const updateSchema = z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      expertise: z.string().optional(),
      status: z.enum(['active', 'inactive', 'on_leave']).optional(),
    });

    const validatedData = updateSchema.parse(body);

    const [updatedLecturer] = await sql`
      UPDATE lecturers 
      SET 
        name = COALESCE(${validatedData.name}, name),
        phone = COALESCE(${validatedData.phone}, phone),
        expertise = COALESCE(${validatedData.expertise}, expertise),
        status = COALESCE(${validatedData.status}, status)
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!updatedLecturer) {
      return NextResponse.json({ error: 'Dosen tidak ditemukan' }, { status: 404 });
    }

    // Update juga di profil
    await sql`
      UPDATE profiles 
      SET 
        name = COALESCE(${validatedData.name}, (SELECT name FROM profiles WHERE user_id = ${updatedLecturer.user_id})),
        phone = COALESCE(${validatedData.phone}, (SELECT phone FROM profiles WHERE user_id = ${updatedLecturer.user_id}))
      WHERE user_id = ${updatedLecturer.user_id}
    `;

    return NextResponse.json({
      success: true,
      updatedLecturer,
      message: 'Data dosen berhasil diperbarui'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('PUT Dosen Error:', error);
    return NextResponse.json({ error: 'Failed to update dosen' }, { status: 500 });
  }
}