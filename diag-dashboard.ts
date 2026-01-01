
import { prisma } from './lib/prisma';
import { sql } from './lib/db';

async function test(name: string, fn: () => Promise<any>) {
    try {
        const start = Date.now();
        await fn();
        console.log(`✅ ${name} succeeded (${Date.now() - start}ms)`);
    } catch (e) {
        console.error(`❌ ${name} failed:`, (e as Error).message);
    }
}

async function main() {
    console.log('--- Testing Dashboard Queries ---');

    await test('Student Count', () => prisma.student.count());
    await test('Lecturer Count', () => prisma.lecturer.count());
    await test('Class Count', () => prisma.class.count());
    await test('Course Count', () => prisma.course.count());
    await test('Active Academic Period Count', () => prisma.academicPeriod.count({ where: { is_active: true } }));
    await test('Curriculum Count', () => prisma.curriculum.count());
    await test('SQL Pending KRS', () => sql`SELECT COUNT(*) as count FROM krs_submissions WHERE status = 'pending'`);
    await test('Urgent Tasks (Class no lecturer)', () => prisma.class.count({ where: { lecturer_id: null } }));
    await test('Program Stats (findMany with count)', () => prisma.studyProgram.findMany({
        include: {
            _count: {
                select: { students: true }
            }
        }
    }));
    await test('Recent Students (findMany)', () => prisma.student.findMany({
        orderBy: { created_at: 'desc' },
        take: 5
    }));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
