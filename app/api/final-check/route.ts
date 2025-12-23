
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results = await sql`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'lecturers' AND column_name = 'user_id'
        `;

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
