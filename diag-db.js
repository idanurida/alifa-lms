
const { sql } = require('./lib/db');

async function check() {
    try {
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Tables:', tables.map(t => t.table_name).join(', '));

        const cols = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('users', 'lecturers') 
      AND column_name IN ('id', 'user_id')
    `;
        console.log('Columns:', JSON.stringify(cols, null, 2));

        const userCount = await sql`SELECT COUNT(*) as count FROM users`;
        console.log('User Count:', userCount[0].count);

        const lecCount = await sql`SELECT COUNT(*) as count FROM lecturers`;
        console.log('Lecturer Count:', lecCount[0].count);

        if (userCount[0].count > 0) {
            const sampleUser = await sql`SELECT id FROM users LIMIT 1`;
            console.log('Sample User ID:', sampleUser[0].id, typeof sampleUser[0].id);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

check();
