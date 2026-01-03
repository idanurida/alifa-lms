
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const TARGET_CODES = ['TI', 'SI', 'MI'];

    console.log(`🗑️  Starting deletion for Prodis: ${TARGET_CODES.join(', ')}`);

    for (const code of TARGET_CODES) {
        const prodi = await prisma.studyProgram.findUnique({
            where: { code: code }
        });

        if (!prodi) {
            console.log(`❓ Prodi ${code} not found. Skipping.`);
            continue;
        }

        console.log(`\n🛑 Deleting ${prodi.name} (${prodi.code}) [ID: ${prodi.id}]...`);

        // 1. Find Curricula
        const curricula = await prisma.curriculum.findMany({
            where: { study_program_id: prodi.id },
            select: { id: true }
        });
        const curriculumIds = curricula.map(c => c.id);
        console.log(`   Found ${curriculumIds.length} curricula.`);

        if (curriculumIds.length > 0) {
            // 2. Find Courses
            const courses = await prisma.course.findMany({
                where: { curriculum_id: { in: curriculumIds } },
                select: { id: true }
            });
            const courseIds = courses.map(c => c.id);
            console.log(`   Found ${courseIds.length} courses.`);

            if (courseIds.length > 0) {
                // 3. Find Classes
                const classes = await prisma.class.findMany({
                    where: { course_id: { in: courseIds } },
                    select: { id: true }
                });
                const classIds = classes.map(c => c.id);
                console.log(`   Found ${classIds.length} classes.`);

                if (classIds.length > 0) {
                    // Delete Class Dependencies
                    await prisma.attendance.deleteMany({ where: { class_id: { in: classIds } } });
                    await prisma.studentActivity.deleteMany({ where: { enrollment: { class_id: { in: classIds } } } }); // via Link? No, enrollment is direct.
                    // StudentActivity -> StudentEnrollment -> Class
                    // We need to find enrollments first to delete activities
                    const enrollments = await prisma.studentEnrollment.findMany({ where: { class_id: { in: classIds } } });
                    const enrollmentIds = enrollments.map(e => e.id);
                    await prisma.studentActivity.deleteMany({ where: { enrollment_id: { in: enrollmentIds } } });

                    await prisma.studentEnrollment.deleteMany({ where: { class_id: { in: classIds } } });
                    await prisma.lecturerAssignment.deleteMany({ where: { class_id: { in: classIds } } });
                    await prisma.evaluationComponent.deleteMany({ where: { class_id: { in: classIds } } });
                    await prisma.learningMaterial.deleteMany({ where: { class_id: { in: classIds } } });

                    // Finally delete Classes
                    await prisma.class.deleteMany({ where: { id: { in: classIds } } });
                    console.log('   ✅ Classes deleted.');
                }

                // Delete Courses
                await prisma.class.deleteMany({ where: { course_id: { in: courseIds } } }); // Double check safety
                await prisma.course.deleteMany({ where: { id: { in: courseIds } } });
                console.log('   ✅ Courses deleted.');
            }

            // Delete GradeScales
            await prisma.gradeScale.deleteMany({ where: { curriculum_id: { in: curriculumIds } } });

            // Delete Curricula
            await prisma.curriculum.deleteMany({ where: { id: { in: curriculumIds } } });
            console.log('   ✅ Curricula deleted.');
        }

        // Unlink Students
        const updatedStudents = await prisma.student.updateMany({
            where: { study_program_num_id: prodi.id },
            data: { study_program_num_id: null }
        });
        console.log(`   ✅ Unlinked ${updatedStudents.count} students.`);

        // Unlink Lecturers
        const updatedLecturers = await prisma.lecturer.updateMany({
            where: { study_program_id: prodi.id },
            data: { study_program_id: null }
        });
        console.log(`   ✅ Unlinked ${updatedLecturers.count} lecturers.`);

        // Finally delete Prodi
        await prisma.studyProgram.delete({ where: { id: prodi.id } });
        console.log(`   🎉 Deleted Study Program: ${prodi.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
