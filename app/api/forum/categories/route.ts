// app/api/forum/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi'),
  description: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Session tidak diperlukan untuk melihat kategori secara publik
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('is_active');

    let query = `SELECT * FROM forum_categories`;
    const params: any[] = [];

    if (isActive !== null) {
      query += ` WHERE is_active = $${params.length + 1}`;
      params.push(isActive === 'true');
    }

    query += ` ORDER BY sort_order ASC, created_at DESC`;

    const result = await sql(query, params);

    return NextResponse.json({  result });
  } catch (error) {
    console.error('GET Forum Categories Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil kategori forum' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    // Cek apakah slug sudah digunakan
    const [existing] = await sql`
      SELECT id FROM forum_categories WHERE slug = ${validatedData.slug}
    `;
    if (existing) {
      return NextResponse.json({ error: 'Slug kategori sudah digunakan' }, { status: 400 });
    }

    const [newCategory] = await sql`
      INSERT INTO forum_categories (
        name, slug, description, icon, sort_order, is_active
      )
      VALUES (
        ${validatedData.name}, ${validatedData.slug}, 
        ${validatedData.description || null}, 
        ${validatedData.icon || null}, 
        ${validatedData.sort_order || 0}, 
        ${validatedData.is_active ?? true}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
       newCategory,
      message: 'Kategori forum berhasil dibuat',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('POST Forum Category Error:', error);
    return NextResponse.json({ error: 'Gagal membuat kategori forum' }, { status: 500 });
  }
}