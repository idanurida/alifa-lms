// app/api/check-users/route.ts
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, username, email, role, is_active 
      FROM users 
      ORDER BY id
    `;
    
    return Response.json({ success: true, users });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}