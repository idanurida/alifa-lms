
import { sql } from './lib/db';

async function main() {
    console.log('Fixing schema: Adding krs_submissions table...');
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS krs_submissions (
                id SERIAL PRIMARY KEY,
                mahasiswa_id INTEGER REFERENCES students(id),
                semester VARCHAR(50) NOT NULL,
                courses JSONB NOT NULL,
                total_credits INTEGER NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                notes TEXT,
                submitted_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log('✅ krs_submissions table created/verified!');
    } catch (e) {
        console.error('❌ Error creating krs_submissions:', (e as Error).message);
    }
}

main();
