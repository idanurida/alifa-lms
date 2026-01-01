
import { sql } from './lib/db';

async function main() {
    try {
        const result = await sql`SELECT count(*) FROM krs_submissions`;
        console.log('krs_submissions exists, count:', result);
    } catch (e) {
        console.log('krs_submissions does not exist or error:', (e as Error).message);
    }
}

main();
