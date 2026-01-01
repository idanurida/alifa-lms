
import { prisma } from './lib/prisma';
import fs from 'fs';

async function main() {
    const text = fs.readFileSync('pdf_content.txt', 'utf-8');
    const lines = text.split('\n');

    let currentProdi: string | null = null;
    let currentSemester: number = 0;
    const courses: any[] = [];

    const prodiMap: Record<string, number> = {
        'EKONOMI SYARIAH (ESY)': 1,
        'MANAJEMEN BISNIS SYARIAH (MBS)': 2,
        'PERBANKAN SYARIAH (PS)': 3
    };

    const semesterMap: Record<string, number> = {
        'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8
    };

    // Reference data (simulated URLs based on user files)
    const pdfRef = '/SEBARAN MATA KULIAH PER PRODI STIES ALIFA.pdf';
    const visualRef = '/uploaded_image_1766636303063.png';

    console.log('Ensuring Curricula exist with reference data...');
    for (const [name, id] of Object.entries(prodiMap)) {
        await prisma.curriculum.upsert({
            where: { code: `KKNI-2019-${id}` },
            update: {
                name: 'Kurikulum KKNI 2019',
                study_program_id: id,
                reference_file_url: pdfRef,
                visual_schema_url: visualRef
            },
            create: {
                name: 'Kurikulum KKNI 2019',
                code: `KKNI-2019-${id}`,
                study_program_id: id,
                total_credits: 149,
                reference_file_url: pdfRef,
                visual_schema_url: visualRef
            }
        });
    }

    const courseRegex = /^(\d+)\s+([IV]+)\.?\s+([A-Z0-9*]+)\s+(.*?)\s+(\d+)\s+(\d+)\s+(\d+)(?:\s+([A-Z0-9,]+))?$/;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        // Detect Prodi
        for (const prodi of Object.keys(prodiMap)) {
            if (line.includes(prodi)) {
                currentProdi = prodi;
                console.log(`Switching to Prodi: ${currentProdi}`);
                break;
            }
        }

        // Detect Semester
        const semMatch = line.match(/Semester\s+(\d+|[IV]+)/i);
        if (semMatch) {
            const semStr = semMatch[1];
            if (semStr.match(/^\d+$/)) {
                currentSemester = parseInt(semStr);
            } else {
                currentSemester = semesterMap[semStr.toUpperCase()] || 0;
            }
            console.log(`  Semester ${currentSemester}`);
            continue;
        }

        // Detect Course Line
        const match = line.match(courseRegex);
        if (match && currentProdi) {
            const [_, no, semRoman, code, name, theory, practical, total, prasyarat] = match;

            courses.push({
                code: code.replace('*', ''),
                name: name.trim(),
                credits: parseInt(total),
                theory_credits: parseInt(theory),
                practical_credits: parseInt(practical),
                semester: currentSemester,
                prerequisites: prasyarat || null,
                study_program_id: prodiMap[currentProdi],
                curriculum_code: `KKNI-2019-${prodiMap[currentProdi]}`
            });
        }
    }

    console.log(`Parsed ${courses.length} courses with detail structure. Inserting into database...`);

    let count = 0;
    for (const course of courses) {
        const curriculum = await prisma.curriculum.findUnique({
            where: { code: course.curriculum_code }
        });

        if (!curriculum) continue;

        await prisma.course.upsert({
            where: {
                code_curriculum_id: {
                    code: course.code,
                    curriculum_id: curriculum.id
                }
            },
            update: {
                name: course.name,
                credits: course.credits,
                theory_credits: course.theory_credits,
                practical_credits: course.practical_credits,
                semester: course.semester,
                prerequisites: course.prerequisites
            },
            create: {
                code: course.code,
                name: course.name,
                credits: course.credits,
                theory_credits: course.theory_credits,
                practical_credits: course.practical_credits,
                semester: course.semester,
                prerequisites: course.prerequisites,
                curriculum_id: curriculum.id
            }
        });
        count++;
    }

    console.log(`✅ Successfully seeded ${count} courses with detail structure.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
