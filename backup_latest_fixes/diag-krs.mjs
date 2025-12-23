
import { sql } from './lib/db';

async function check() {
    try {
        const cols = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'krs_submissions'
    `;
        console.log('KRS Submissions Columns:', JSON.stringify(cols, null, 2));

        const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('mahasiswa', 'students', 'program_studi', 'study_programs')
    `;
        console.log('Existing tables:', tables.map(t => t.table_name));

    } catch (e) {
        console.error('Error:', e);
    }
}

check();
