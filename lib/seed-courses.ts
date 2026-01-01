
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAcademicData() {
    console.log('🌱 Seeding Academic Data...');

    // 1. Ensure Study Program exists
    let studyProgram = await prisma.studyProgram.findFirst({
        where: { code: 'ES' }
    });

    if (!studyProgram) {
        studyProgram = await prisma.studyProgram.create({
            data: {
                name: 'Ekonomi Syariah',
                code: 'ES',
                degree_level: 'S1',
                is_active: true
            }
        });
        console.log('✅ Study Program created/found');
    }

    // 2. Ensure Curriculum
    let curriculum = await prisma.curriculum.findFirst({
        where: { code: 'KUR-2024-ES' }
    });

    if (!curriculum) {
        curriculum = await prisma.curriculum.create({
            data: {
                name: 'Kurikulum 2024 Ekonomi Syariah',
                code: 'KUR-2024-ES',
                study_program_id: studyProgram.id,
                total_credits: 144
            }
        });
        console.log('✅ Curriculum created/found');
    }

    // 3. Ensure Academic Period (Semester Ganjil 2024/2025)
    let period = await prisma.academicPeriod.findUnique({
        where: { code: '20241' }
    });

    if (!period) {
        period = await prisma.academicPeriod.create({
            data: {
                name: 'Semester Ganjil 2024/2025',
                code: '20241',
                year: 2024,
                semester: 1,
                start_date: new Date('2024-09-01'),
                end_date: new Date('2025-02-28'),
                is_active: true
            }
        });
        console.log('✅ Academic Period created/found');
    }

    // 4. Create Sample Courses
    const coursesData = [
        { code: 'MKK101', name: 'Al-Qur\'an dan Hadits Ekonomi', credits: 3 },
        { code: 'MKK102', name: 'Bahasa Arab I', credits: 2 },
        { code: 'MKK103', name: 'Pengantar Ekonomi Mikro', credits: 3 },
        { code: 'MKK104', name: 'Pengantar Manajemen', credits: 3 },
        { code: 'MKK105', name: 'Pengantar Akuntansi I', credits: 3 },
        { code: 'MKK106', name: 'Fiqh Muamalah I', credits: 2 },
        { code: 'MKK107', name: 'Sejarah Pemikiran Ekonomi Islam', credits: 2 },
    ];

    for (const c of coursesData) {
        // Use upsert with composite key mapping
        const course = await prisma.course.upsert({
            where: {
                code_curriculum_id: {
                    code: c.code,
                    curriculum_id: curriculum.id
                }
            },
            update: {},
            create: {
                code: c.code,
                name: c.name,
                credits: c.credits,
                curriculum_id: curriculum.id,
                semester: 1,
                theory_credits: c.credits,
                practical_credits: 0
            }
        });
        console.log(`   - Course ${c.code} synced`);

        // 5. Create Class for this course
        const cls = await prisma.class.upsert({
            where: {
                course_id_academic_period_id_class_code: {
                    course_id: course.id,
                    academic_period_id: period.id,
                    class_code: 'ES-1A'
                }
            },
            update: {},
            create: {
                course_id: course.id,
                academic_period_id: period.id,
                class_code: 'ES-1A',
                schedule: { day: 'Senin', time: '08:00 - 10:30', room: 'R.201' },
                max_students: 40
            }
        });

        // 6. Enroll ALL Active Students
        const students = await prisma.student.findMany({
            where: { status: 'active' }
        });

        console.log(`📚 Enrolling ${students.length} students to class ${c.code}...`);

        for (const student of students) {
            // Random Grade Generator
            const grades: string[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E'];
            const scores: Record<string, number> = {
                'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                'C+': 2.3, 'C': 2.0, 'D': 1.0, 'E': 0.0
            };
            const randomGrade = grades[Math.floor(Math.random() * grades.length)];

            await prisma.studentEnrollment.upsert({
                where: {
                    student_id_class_id: {
                        student_id: student.id,
                        class_id: cls.id
                    }
                },
                update: {
                    final_grade: randomGrade,
                    final_score: scores[randomGrade]
                },
                create: {
                    student_id: student.id,
                    class_id: cls.id,
                    enrollment_date: new Date(),
                    status: 'completed',
                    final_grade: randomGrade,
                    final_score: scores[randomGrade]
                }
            });

            // Update student study program & photo if needed
            if (!student.photo_url || !student.study_program_num_id) {
                const isMen = student.id % 2 === 0;
                const photoId = student.id % 70;
                await prisma.student.update({
                    where: { id: student.id },
                    data: {
                        study_program_num_id: studyProgram.id, // Assign to ES
                        photo_url: student.photo_url || `https://randomuser.me/api/portraits/${isMen ? 'men' : 'women'}/${photoId}.jpg`
                    }
                });
            }
        }
    }
    console.log('✅ Student enrolled and graded');
}

seedAcademicData()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
