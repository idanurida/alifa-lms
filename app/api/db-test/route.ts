// app/api/db-test/route.ts
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic query
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    const version = await sql`SELECT version()`;
    
    return NextResponse.json({ 
      success: true, 
      userCount: users[0].count,
      version: version[0].version,
      message: 'Database connected successfully'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}