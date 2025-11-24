import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    // SOLUSI: Convert UUID ke integer untuk JOIN, atau handle tanpa JOIN
    const result = await sql`
      SELECT 
        l.id, 
        l.user_id, 
        l.nidn, 
        l.name, 
        l.email, 
        l.phone, 
        l.expertise, 
        l.status,
        l.created_at,
        -- Handle is_active dengan subquery atau default value
        COALESCE(
          (SELECT u.is_active FROM users u WHERE u.id::integer = l.user_id),
          true
        ) as is_active
      FROM lecturers l
      WHERE l.id = ${id}
    `;

    // ALTERNATIF 2: Jika subquery tidak work, gunakan approach tanpa JOIN
    /*
    const result = await sql`
      SELECT 
        l.id, l.user_id, l.nidn, l.name, l.email, l.phone, l.expertise, l.status,
        l.created_at,
        true as is_active  -- Default value untuk sementara
      FROM lecturers l
      WHERE l.id = ${id}
    `;
    */

    if (result.length === 0) {
      return NextResponse.json({ error: 'Dosen not found' }, { status: 404 });
    }

    const dosen = result[0];

    return NextResponse.json({
      dosen,
      userRole: session.user.role,
      currentUserId: session.user.id
    });

  } catch (error) {
    console.error('Error fetching dosen:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}