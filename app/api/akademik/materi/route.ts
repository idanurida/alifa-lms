// app/api/akademik/materi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const materiSchema = z.object({
  class_id: z.number().int().positive(),
  title: z.string().min(1),
  material_type: z.enum(['file', 'video', 'link']),
  file_path: z.string().optional(),
  content: z.string().optional(),
  week_number: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['dosen', 'staff_akademik', 'super_admin', 'mahasiswa'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('class_id');

    if (!classId) {
      return NextResponse.json({ error: 'class_id diperlukan' }, { status: 400 });
    }

    const materials = await sql`
      SELECT lm.*, c.class_code, co.name as course_name
      FROM learning_materials lm
      JOIN classes c ON lm.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE lm.class_id = ${parseInt(classId)}
      ORDER BY lm.week_number ASC, lm.created_at DESC
    `;

    return NextResponse.json({ data: materials });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat materi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['dosen', 'staff_akademik', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const data = materiSchema.parse(body);

    const [materi] = await sql`
      INSERT INTO learning_materials (class_id, title, material_type, file_path, content, week_number, is_published)
      VALUES (${data.class_id}, ${data.title}, ${data.material_type}, ${data.file_path || null}, ${data.content || null}, ${data.week_number || null}, true)
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: materi });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal menambah materi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['dosen', 'staff_akademik', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id diperlukan' }, { status: 400 });

    await sql`DELETE FROM learning_materials WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus materi' }, { status: 500 });
  }
}
