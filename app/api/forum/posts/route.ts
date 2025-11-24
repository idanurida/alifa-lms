// app/api/forum/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const postSchema = z.object({
  thread_id: z.number().int().positive('ID thread wajib diisi'),
  content: z.string().min(1, 'Konten wajib diisi'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('thread_id');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    if (!threadId) {
      return NextResponse.json({ error: 'ID thread tidak ditemukan' }, { status: 400 });
    }

    // PERBAIKAN 1: Gunakan parameterized query dengan template literals
    // PERBAIKAN 2: Gunakan username bukan name
    export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('thread_id');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    if (!threadId) {
      return NextResponse.json({ error: 'ID thread tidak ditemukan' }, { status: 400 });
    }

    // Cek apakah thread exists terlebih dahulu
    const threadExists = await sql`
      SELECT id FROM forum_threads WHERE id = ${parseInt(threadId)}
    `;

    if (threadExists.length === 0) {
      return NextResponse.json({ 
        error: 'Thread tidak ditemukan',
        data: [] 
      }, { status: 404 });
    }

    // Lanjutkan dengan query posts...
    const posts = await sql`
      SELECT 
        fp.id, 
        fp.thread_id, 
        fp.user_id, 
        fp.content, 
        fp.is_first_post, 
        fp.created_at, 
        fp.updated_at,
        u.username as user_name,
        u.role as user_role
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id::integer
      WHERE fp.thread_id = ${parseInt(threadId)}
      ORDER BY fp.created_at ASC
      LIMIT ${parseInt(limit)} 
      OFFSET ${parseInt(offset)}
    `;

    // Update view count
    await sql`
      UPDATE forum_threads 
      SET view_count = view_count + 1 
      WHERE id = ${parseInt(threadId)}
    `;

    return NextResponse.json({ 
      data: posts,
      thread: threadExists[0]
    });
  } catch (error) {
    console.error('GET Forum Posts Error:', error);
    return NextResponse.json({ 
      error: 'Gagal mengambil post forum',
      data: [] 
    }, { status: 500 });
  }
}

    const body = await req.json();
    const validatedData = postSchema.parse(body);

    // PERBAIKAN 4: Handle integer user_id conversion
    const userId = parseInt(session.user.id);

    // Cek apakah thread ada dan tidak terkunci
    const threadResult = await sql`
      SELECT is_locked FROM forum_threads WHERE id = ${validatedData.thread_id}
    `;
    
    if (threadResult.length === 0) {
      return NextResponse.json({ error: 'Thread forum tidak ditemukan' }, { status: 404 });
    }
    
    const thread = threadResult[0];
    if (thread.is_locked) {
      return NextResponse.json({ error: 'Thread ini telah dikunci. Balasan tidak diperbolehkan.' }, { status: 400 });
    }

    // PERBAIKAN 5: Insert post dengan user_id integer
    const newPostResult = await sql`
      INSERT INTO forum_posts (
        thread_id, user_id, content, is_first_post
      )
      VALUES (
        ${validatedData.thread_id}, 
        ${userId},  -- INTEGER user_id
        ${validatedData.content}, 
        false
      )
      RETURNING *
    `;

    if (newPostResult.length === 0) {
      throw new Error('Failed to create post');
    }

    const newPost = newPostResult[0];

    return NextResponse.json({
      success: true,
      newPost,
      message: 'Balasan forum berhasil ditambahkan',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validasi gagal', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('POST Forum Post Error:', error);
    return NextResponse.json({ 
      error: 'Gagal menambah balasan forum',
      details: error.message 
    }, { status: 500 });
  }
}