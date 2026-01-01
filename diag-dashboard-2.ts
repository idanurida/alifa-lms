import { PrismaClient } from '@prisma/client';

// Simple URL decoding logic from lib/prisma.ts
const getDirectUrl = (): string | undefined => {
    const urlStr = process.env.DATABASE_URL;
    if (urlStr?.startsWith('prisma+postgres://')) {
        try {
            const url = new URL(urlStr);
            const apiKey = url.searchParams.get('api_key');
            if (apiKey) {
                const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString());
                if (decoded.databaseUrl) return decoded.databaseUrl;
            }
        } catch (e) { }
    }
    return undefined;
};

const datasources = getDirectUrl() ? { db: { url: getDirectUrl() } } : undefined;
const prisma = new PrismaClient({ datasources });

async function main() {
    const students = await prisma.student.findMany({
        select: { status: true },
        take: 1000
    });

    const statusCounts = students.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    console.log('--- ACTUAL STUDENT STATUS COUNTS ---');
    console.log(JSON.stringify(statusCounts, null, 2));

    const periods = await prisma.academicPeriod.findMany({
        where: { is_active: true }
    });
    console.log('--- ACTIVE ACADEMIC PERIODS ---');
    console.log(JSON.stringify(periods, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
