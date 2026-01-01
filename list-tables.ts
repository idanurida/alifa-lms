import { sql } from './lib/db';
async function main() {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log(JSON.stringify(tables, null, 2));
}
main().catch(console.error);
