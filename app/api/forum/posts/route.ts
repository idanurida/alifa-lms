// app/api/forum/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const postSchema = z.object({
  thread_id: z.number().int().positive(),
  content: z.string().min(1, 'Konten wajib diisi'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('thread_id');

    if (!threadId) {
      return NextResponse.json({ error: 'thread_id diperlukan' }, { status: 400 });
    }

    const posts = await sql`
      SELECT 
        fp.id, fp.content, fp.is_first_post, fp.created_at, fp.updated_at,
        u.username, u.role,
        COALESCE(s.name, l.name, u.username) as author_name
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN lecturers l ON u.id = l.user_id
      WHERE fp.thread_id = ${parseInt(threadId)}
      ORDER BY fp.is_first_post DESC, fp.created_at ASC
    `;

    return NextResponse.json({ data: posts });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil post forum' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validated = postSchema.parse(body);

    // Cek thread masih bisa di-reply
    const [thread] = await sql`
      SELECT id, is_locked FROM forum_threads WHERE id = ${validated.thread_id}
    `;
    if (!thread) {
      return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
    }
    if (thread.is_locked) {
      return NextResponse.json({ error: 'Thread ini sudah dikunci' }, { status: 400 });
    }

    const [post] = await sql`
      INSERT INTO forum_posts (thread_id, user_id, content, is_first_post)
      VALUES (${validated.thread_id}, ${parseInt(session.user.id)}, ${validated.content}, false)
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: post, message: 'Balasan berhasil dikirim' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal membuat post' }, { status: 500 });
  }
}
