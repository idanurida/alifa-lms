
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
    try {
        const krsCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'krs_submissions'
    `;

        const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('mahasiswa', 'students', 'program_studi', 'study_programs')
    `;

        return NextResponse.json({
            krs_submissions: krsCols,
            existing_tables: tables.map(t => t.table_name)
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
