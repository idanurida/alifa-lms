import { prisma } from './lib/prisma';

async function main() {
    try {
        const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    `;
        console.log('Profiles table check:', result);
    } catch (error) {
        console.error('Error checking profiles table:', error);
    }
}

main();
