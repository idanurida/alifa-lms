// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const msgSchema = z.object({
  content: z.string().min(1).max(2000),
  receiver_id: z.number().int().positive().optional(),
  group_name: z.string().optional(),
});

// GET: ambil messages
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get('receiver_id');
    const groupName = searchParams.get('group');
    const limit = parseInt(searchParams.get('limit') || '50');

    let messages: any[];

    if (groupName) {
      // Group chat
      messages = await sql`
        SELECT m.*, u.username as sender_name, u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.group_name = ${groupName}
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `;
    } else if (receiverId) {
      // Direct message (two-way)
      const rid = parseInt(receiverId);
      messages = await sql`
        SELECT m.*, u.username as sender_name, u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE (m.sender_id = ${userId} AND m.receiver_id = ${rid})
           OR (m.sender_id = ${rid} AND m.receiver_id = ${userId})
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `;
      // Mark as read
      await sql`UPDATE messages SET is_read = true WHERE receiver_id = ${userId} AND sender_id = ${rid} AND is_read = false`;
    } else {
      // Semua conversations user
      messages = await sql`
        SELECT DISTINCT ON (
          CASE WHEN m.receiver_id IS NULL THEN m.group_name
               WHEN m.sender_id = ${userId} THEN m.receiver_id
               ELSE m.sender_id END
        )
          m.*, u.username as sender_name, u.role as sender_role,
          CASE WHEN m.receiver_id IS NULL THEN m.group_name
               WHEN m.sender_id = ${userId} THEN m.receiver_id
               ELSE m.sender_id END as conversation_key
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
        ORDER BY conversation_key, m.created_at DESC
      `;
    }

    return NextResponse.json({ data: messages.reverse() });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat pesan' }, { status: 500 });
  }
}

// POST: kirim message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = msgSchema.parse(body);

    if (!data.receiver_id && !data.group_name) {
      return NextResponse.json({ error: 'receiver_id atau group_name diperlukan' }, { status: 400 });
    }

    const [msg] = await sql`
      INSERT INTO messages (sender_id, receiver_id, group_name, content)
      VALUES (${parseInt(session.user.id)}, ${data.receiver_id || null}, ${data.group_name || null}, ${data.content})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: msg });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 });
  }
}
