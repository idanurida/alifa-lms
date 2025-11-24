// app/api/forum/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const threadSchema = z.object({
  category_id: z.number().int().positive('ID kategori wajib diisi'),
  title: z.string().min(1, 'Judul wajib diisi'),
  content: z.string().min(1, 'Konten wajib diisi'), // Content untuk post pertama
  is_pinned: z.boolean().optional(),
  is_locked: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Session tidak diperlukan untuk melihat thread secara publik
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');
    const isPinned = searchParams.get('is_pinned');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    let query = `
      SELECT 
        ft.id, ft.category_id, ft.user_id, ft.title, ft.slug, ft.is_pinned, ft.is_locked,
        ft.view_count, ft.created_at,
        u.name as user_name,
        fc.name as category_name,
        (SELECT COUNT(*) FROM forum_posts fp WHERE fp.thread_id = ft.id) - 1 as reply_count -- Exclude first post
      FROM forum_threads ft
      JOIN users u ON ft.user_id = u.id
      JOIN forum_categories fc ON ft.category_id = fc.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (categoryId) {
      query += ` AND ft.category_id = $${params.length + 1}`;
      params.push(categoryId);
    }

    if (isPinned !== null) {
      query += ` AND ft.is_pinned = $${params.length + 1}`;
      params.push(isPinned === 'true');
    }

    query += ` ORDER BY ft.is_pinned DESC, ft.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await sql(query, params);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('GET Forum Threads Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil thread forum' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['mahasiswa', 'dosen', 'staff_akademik', 'super_admin'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = threadSchema.parse(body);

    // Cek apakah kategori ada dan aktif
    const [category] = await sql`
      SELECT is_active FROM forum_categories WHERE id = ${validatedData.category_id}
    `;
    if (!category || !category.is_active) {
      return NextResponse.json({ error: 'Kategori forum tidak ditemukan atau tidak aktif' }, { status: 400 });
    }

    // Generate slug dari title
    const slug = validatedData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

    const [newThread] = await sql`
      INSERT INTO forum_threads (
        category_id, user_id, title, slug, is_pinned, is_locked, view_count
      )
      VALUES (
        ${validatedData.category_id}, ${session.user.id}, 
        ${validatedData.title}, ${slug}, 
        ${validatedData.is_pinned ?? false}, ${validatedData.is_locked ?? false}, 
        0
      )
      RETURNING *
    `;

    // Buat post pertama (first post) untuk thread ini
    await sql`
      INSERT INTO forum_posts (
        thread_id, user_id, content, is_first_post
      )
      VALUES (
        ${newThread.id}, ${session.user.id}, 
        ${validatedData.content}, true
      )
    `;

    return NextResponse.json({
      success: true,
       newThread,
      message: 'Thread forum berhasil dibuat',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    console.error('POST Forum Thread Error:', error);
    return NextResponse.json({ error: 'Gagal membuat thread forum' }, { status: 500 });
  }
}