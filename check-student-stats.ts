import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const statuses = await prisma.student.groupBy({
        by: ['status'],
        _count: { id: true }
    });
    console.log('--- STUDENT STATUSES ---');
    console.log(JSON.stringify(statuses, null, 2));

    const entries = await prisma.student.findMany({
        select: { status: true },
        where: { OR: [{ status: 'DO' }, { status: 'drop_out' }, { status: 'dropout' }] },
        take: 5
    });
    console.log('--- SAMPLE DO ENTRIES ---');
    console.log(JSON.stringify(entries, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
